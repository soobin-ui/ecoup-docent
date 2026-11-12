import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SCAN } from '../content/tour'
import { kindOf } from '../lib/stampCodes'
import type { StampKind } from '../lib/stampCodes'
import { PIN_ON_PHONE, stampPinOk, warmUp } from '../lib/api'

/*
  앱 안 QR 스캐너 — 뒷면 카메라로 QR 을 읽어 맞는 스탬프면 onStamp.
  - 크롬(안드로이드)은 내장 BarcodeDetector, 그 밖(아이폰 등)은 jsQR(public/vendor/jsQR.js, 스캐너를 열 때만 내려받음).
  - 카메라를 못 쓰면(권한 거부·구형 인앱 브라우저) 스태프 번호로 대신 찍기.
*/

type Detect = (v: HTMLVideoElement, c: HTMLCanvasElement) => Promise<string | null>

declare global {
  interface Window {
    jsQR?: (d: Uint8ClampedArray, w: number, h: number, o?: object) => { data: string } | null
    BarcodeDetector?: new (o: { formats: string[] }) => { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> }
  }
}

function loadJsQR(): Promise<void> {
  if (window.jsQR) return Promise.resolve()
  return new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = './vendor/jsQR.js'
    s.onload = () => res()
    s.onerror = () => rej(new Error('jsQR'))
    document.head.appendChild(s)
  })
}

async function makeDetector(): Promise<Detect> {
  if (window.BarcodeDetector) {
    try {
      const bd = new window.BarcodeDetector({ formats: ['qr_code'] })
      return async (v) => {
        const r = await bd.detect(v)
        return r[0]?.rawValue ?? null
      }
    } catch {
      /* 아래 jsQR 로 */
    }
  }
  await loadJsQR()
  return async (v, c) => {
    const w = v.videoWidth
    const h = v.videoHeight
    if (!w || !h) return null
    const scale = Math.min(1, 640 / Math.max(w, h))
    c.width = Math.round(w * scale)
    c.height = Math.round(h * scale)
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(v, 0, 0, c.width, c.height)
    const img = ctx.getImageData(0, 0, c.width, c.height)
    return window.jsQR?.(img.data, c.width, c.height, { inversionAttempts: 'dontInvert' })?.data ?? null
  }
}

/* 휴대폰 안에서 번호를 확인하므로 아무 번호나 눌러 맞히지 못하게: 5번 틀리면 1분 잠금(새로고침해도 유지) */
const LOCK_KEY = 'ecoup-docent-pinlock'
const MAX_FAIL = 5
const LOCK_MS = 60_000
type PinLock = { fails: number; until: number }
const readLock = (): PinLock => {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) ?? '') as PinLock
  } catch {
    return { fails: 0, until: 0 }
  }
}
const writeLock = (l: PinLock) => {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(l))
  } catch {
    /* 저장 막힘 — 잠금 없이 동작 */
  }
}

export function Scanner({ kind, title, onStamp, onClose }: { kind: StampKind; title: string[]; onStamp: () => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [checking, setChecking] = useState(false) // 서버에 스태프 번호 확인 중
  // 부모가 렌더할 때마다 새 함수를 넘겨도 카메라가 다시 켜지지 않게
  const stampRef = useRef(onStamp)
  stampRef.current = onStamp

  useEffect(() => {
    let stream: MediaStream | null = null
    let stop = false
    let timer = 0
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (stop) return
        const v = video.current!
        v.srcObject = stream
        await v.play()
        const detect = await makeDetector()
        const tick = async () => {
          if (stop) return
          try {
            const text = await detect(v, canvas.current!)
            if (text) {
              const k = kindOf(text)
              if (k === kind) {
                stop = true
                navigator.vibrate?.(80)
                stampRef.current()
                return
              }
              setMsg(SCAN.wrongCode)
            }
          } catch {
            /* 다음 프레임 */
          }
          timer = window.setTimeout(tick, 160)
        }
        tick()
      } catch {
        setErr(SCAN.noCamera)
      }
    })()
    return () => {
      stop = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [kind])

  // 스태프 확인 창을 열면 서버를 미리 깨워 둠(번호를 다 넣을 즈음엔 응답이 빨라지게)
  useEffect(() => {
    if (pinOpen && !PIN_ON_PHONE) warmUp()
  }, [pinOpen])

  const [lockLeft, setLockLeft] = useState(0) // 잠금 남은 초
  useEffect(() => {
    const tick = () => setLockLeft(Math.max(0, Math.ceil((readLock().until - Date.now()) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const staffOk = async (value = pin) => {
    if (checking || value.length < 4) return
    if (readLock().until > Date.now()) {
      setPin('')
      return
    }
    setChecking(true)
    setMsg('')
    try {
      if (await stampPinOk(value)) {
        writeLock({ fails: 0, until: 0 })
        onStamp()
      } else {
        const l = readLock()
        const fails = (l.until > 0 && l.until <= Date.now() ? 0 : l.fails) + 1
        if (fails >= MAX_FAIL) {
          writeLock({ fails: 0, until: Date.now() + LOCK_MS })
          setLockLeft(LOCK_MS / 1000)
          setMsg('여러 번 틀려서 1분 동안 넣을 수 없어요')
        } else {
          writeLock({ fails, until: 0 })
          setMsg('스태프 번호가 맞지 않아요')
        }
        setPin('')
      }
    } catch {
      setMsg('연결이 불안정해요. 다시 눌러 주세요')
    } finally {
      setChecking(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex flex-col bg-[#071f33]" role="dialog" aria-modal>
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-[max(20px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
        <h2 className="text-[clamp(22px,6.2vw,27px)] font-bold leading-snug text-white">
          {title.map((t) => (
            <span key={t} className="block">
              {t}
            </span>
          ))}
        </h2>
        <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-3xl bg-[#0b3352]">
          <video ref={video} playsInline muted className="h-full w-full object-cover" />
          <canvas ref={canvas} className="hidden" />
          {/* 모서리 틀 + 훑는 선 */}
          <div className="pointer-events-none absolute inset-[16%]">
            {['top-0 left-0 border-t-4 border-l-4 rounded-tl-xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl'].map((c) => (
              <span key={c} className={`absolute h-9 w-9 border-cyan ${c}`} />
            ))}
            <span className="scan-line absolute inset-x-[6%] h-[3px] rounded-full bg-cyan shadow-[0_0_12px_#00add0]" />
          </div>
          <p className="absolute inset-x-0 bottom-4 text-center text-[clamp(13.5px,3.85vw,16px)] font-bold text-white/85">{SCAN.guide}</p>
          {err && <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-black/60 p-4 text-center text-[clamp(15px,4.23vw,17.5px)] font-bold text-white">{err}</p>}
        </div>
        {msg && <p className="mt-3 text-center text-[clamp(14.5px,4.1vw,17px)] font-bold text-[#ffc98a]">{msg}</p>}
        <p className="mt-3 text-center text-[clamp(13.5px,3.85vw,16px)] text-white/70">{SCAN.auto}</p>

        <div className="mt-auto flex flex-col gap-2 pt-5">
          {pinOpen ? (
            <div className="rounded-2xl bg-white p-4">
              <p className="text-[clamp(14.5px,4.1vw,17px)] font-bold text-ink">{SCAN.staffLead}</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={pin}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setPin(v)
                    if (v.length === 4) staffOk(v) // 4자리를 다 넣으면 바로 확인
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && staffOk()}
                  disabled={checking || lockLeft > 0}
                  placeholder={lockLeft > 0 ? `${lockLeft}초 뒤에 다시` : ''}
                  inputMode="numeric"
                  enterKeyHint="done"
                  type="password"
                  autoComplete="off"
                  className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line text-center text-[22px] tracking-[0.4em] outline-none placeholder:text-[15px] placeholder:tracking-normal focus:border-sea disabled:bg-[#f1f5f7]"
                />
                <button onClick={() => staffOk()} disabled={pin.length < 4 || checking || lockLeft > 0} className={`flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-sea px-4 font-bold text-white ${checking ? "" : "disabled:bg-[#b9c7cd]"}`}>
                  {checking ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                      확인 중
                    </>
                  ) : (
                    '스탬프 찍기'
                  )}
                </button>
              </div>
              {checking && <p className="mt-2 text-center text-[13.5px] font-bold text-cyan">스태프 번호를 확인하고 있어요. 몇 초만 기다려 주세요</p>}
            </div>
          ) : (
            <button onClick={() => setPinOpen(true)} className="h-11 text-[clamp(14.5px,4.1vw,17px)] font-bold text-white/80 underline underline-offset-4">
              {SCAN.staff}
            </button>
          )}
          <button onClick={onClose} className="h-[56px] w-full rounded-2xl bg-white/15 text-[clamp(17px,4.8vw,19.5px)] font-bold text-white">
            {SCAN.close}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
