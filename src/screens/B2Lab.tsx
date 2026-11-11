/*
  B · 물의 변화 ② — 미생물과 미래 기술
  B1(카드 넘기기)과 손맛을 다르게:
   - 미생물 처리 = 미생물 도감(카드를 눌러 뒤집기, 4장 모으기)
   - 미래 수처리 기술 = 처리 전/후 그림을 손가락으로 밀어 비교
   - 세 종류의 물 = 탭을 고르면 B1·B2 그림으로 이어 보는 처리 순서
  그림: Higgsfield(GPT Image 2.6) — src/assets/img/b2, B1 그림 재사용
*/
import { useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { B2 } from '../content/tour'
import { BottomBar, Button, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import { useDraft } from '../lib/draft'
import m1 from '../assets/img/b2/m1.webp'
import m2 from '../assets/img/b2/m2.webp'
import m3 from '../assets/img/b2/m3.webp'
import m4 from '../assets/img/b2/m4.webp'
import mbrA from '../assets/img/b2/mbr-before.webp'
import mbrB from '../assets/img/b2/mbr-after.webp'
import roA from '../assets/img/b2/ro-before.webp'
import roB from '../assets/img/b2/ro-after.webp'
import uvA from '../assets/img/b2/uv-before.webp'
import uvB from '../assets/img/b2/uv-after.webp'
import b1s1 from '../assets/img/b1/step1.webp'
import b1s3 from '../assets/img/b1/step3.webp'
import b1s6 from '../assets/img/b1/step6.webp'
import b1s7 from '../assets/img/b1/step7.webp'
import b1s9 from '../assets/img/b1/step9.webp'

/* 미생물 도감 — 앞면 캐릭터·별명, 뒷면 시안 설명(v) + 한 줄 덧붙임 */
const MICROBES = [
  { img: m1, nick: '오염물질 먹보', more: '공기를 넣어 주면 더 열심히 먹어요', bg: '#fbf3e2', ac: '#a8711f' },
  { img: m2, nick: '질소 줄이기 콤비', more: '질소가 너무 많으면 녹조가 생겨요', bg: '#e8f3fd', ac: '#2a76b8' },
  { img: m3, nick: '산소 없이도 척척', more: '공기를 덜 넣어도 돼서 전기를 아껴요', bg: '#fdeceb', ac: '#c8413a' },
  { img: m4, nick: '에너지 만드는 일꾼', more: '찌꺼기를 분해하며 바이오가스를 만들어요', bg: '#eef5e3', ac: '#4f8a1f' },
]
/* 미래 기술 — 처리 전(before) 위로 처리 후(after)를 밀어서 덮음 */
const TECH = [
  { before: mbrA, after: mbrB, from: '하수', to: '맑은 물', full: 'Membrane BioReactor · 분리막 생물반응기' },
  { before: roA, after: roB, from: '바닷물', to: '마시는 물', full: 'Reverse Osmosis · 역삼투' },
  { before: uvA, after: uvB, from: '세균 있는 물', to: '소독된 물', full: 'UltraViolet · 자외선' },
]
/* 세 종류의 물 — 단계마다 앞에서 본 그림(없으면 아이콘) */
const FLOW_PIC: Record<string, string> = {
  '응집·침전': b1s6,
  여과: b1s3,
  소독: uvB,
  '큰 오염물질': b1s1,
  '미생물 처리': m1,
  고도처리: b1s9,
  '소독·검사': uvB,
  '중화·화학': b1s7,
  생물학처리: m1,
  '정제·검사': roB,
}
const FLOW_ICON: Record<string, string> = { 수질검사: 'flask', '오염물질 분석': 'flask' }
const FLOW_COLOR = ['#2f8fb5', '#9a8a63', '#7b8794'] // 출발 물(자연수·생활하수·공장폐수)
const RESULT = '#3d8f1c' // 처리 결과 물(수돗물·재이용수) — 출발 물과 다른 초록

const head = 'text-center text-[clamp(17px,4.9vw,20px)] font-bold text-sea'
const sub = 'mt-1 text-center text-[clamp(13px,3.7vw,15.5px)] font-bold text-cyan'

/* ── 미생물 도감 카드 ── */
function MicrobeCard({ k, open, onFlip }: { k: number; open: boolean; onFlip: () => void }) {
  const it = B2.groups[0].items[k]
  const m = MICROBES[k]
  return (
    <button onClick={onFlip} className="relative aspect-[3/4] w-full [perspective:900px]" aria-label={`${it.k} 카드 ${open ? '앞면 보기' : '뒤집기'}`}>
      <motion.div className="absolute inset-0 [transform-style:preserve-3d]" animate={{ rotateY: open ? 180 : 0 }} transition={{ duration: 0.55, ease: 'easeInOut' }}>
        {/* 앞면 */}
        <div className="tile absolute inset-0 flex flex-col items-center overflow-hidden rounded-3xl [backface-visibility:hidden]" style={{ background: m.bg }}>
          <span className="mt-2.5 rounded-full bg-white/80 px-2 py-0.5 text-[11.5px] font-bold text-mute">No.{k + 1}</span>
          <img src={m.img} alt="" draggable={false} className="mt-0.5 h-[58%] w-auto object-contain drop-shadow-[0_8px_10px_rgba(8,60,100,0.2)]" />
          <p className="mt-auto text-[clamp(15.5px,4.4vw,18px)] font-bold text-ink">{it.k}</p>
          <p className="mb-3 flex items-center gap-1 text-[12px] font-bold text-cyan">
            <Icon name="refresh" size={13} /> 눌러서 뒤집기
          </p>
        </div>
        {/* 뒷면 — 앞면과 같은 바탕색 */}
        <div className="tile absolute inset-0 flex flex-col items-center justify-center rounded-3xl px-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: m.bg }}>
          <img src={m.img} alt="" draggable={false} className="h-[24%] w-auto object-contain" />
          <span className="mt-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-bold text-white" style={{ background: m.ac }}>
            {m.nick}
          </span>
          <p className="mt-1.5 text-[clamp(15.5px,4.4vw,18px)] font-bold text-ink">{it.k}</p>
          <p className="mt-1 text-[clamp(13.5px,3.85vw,16px)] leading-snug font-bold [word-break:keep-all]" style={{ color: m.ac }}>
            {it.v}
          </p>
          <p className="mt-1.5 text-[clamp(12px,3.4vw,14px)] leading-snug text-mute [word-break:keep-all]">{m.more}</p>
        </div>
      </motion.div>
    </button>
  )
}

/* ── 처리 전/후 밀어서 비교 ── */
function Compare({ t, onDone }: { t: number; onDone: () => void }) {
  const x = TECH[t]
  const [pos, setPos] = useState(12) // 처리 후가 덮은 폭(%)
  const [drag, setDrag] = useState(false)
  const [moved, setMoved] = useState(false)
  const set = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))
    setPos(p)
    if (!moved && Math.abs(p - 12) > 4) setMoved(true)
    if (p > 85) onDone()
  }
  return (
    <div
      className="relative aspect-[3/2] w-full touch-pan-y overflow-hidden rounded-2xl bg-[#f4fbfe] select-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setDrag(true)
        set(e)
      }}
      onPointerMove={(e) => drag && set(e)}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
    >
      <img src={x.before} alt={`${x.from} — 처리 전`} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <img src={x.after} alt={`${x.to} — 처리 후`} draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      {/* 이름표 */}
      <span className="absolute top-2 right-2 rounded-full bg-[#5d4a2b]/85 px-2.5 py-0.5 text-[12.5px] font-bold text-white transition-opacity" style={{ opacity: pos > 80 ? 0 : 1 }}>
        처리 전 · {x.from}
      </span>
      <span className="absolute top-2 left-2 rounded-full bg-sea/90 px-2.5 py-0.5 text-[12.5px] font-bold text-white transition-opacity" style={{ opacity: pos < 25 ? 0 : 1 }}>
        처리 후 · {x.to}
      </span>
      {/* 손잡이 */}
      <div className="pointer-events-none absolute top-0 bottom-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(11,74,117,0.35)]" style={{ left: `${pos}%` }}>
        <motion.span
          className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sea shadow-[0_4px_12px_rgba(8,60,100,0.35)] ring-2 ring-sea"
          animate={moved ? { x: 0 } : { x: [0, 10, 0, 6, 0] }}
          transition={moved ? {} : { duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </motion.span>
      </div>
    </div>
  )
}

const PARTS = ['미생물 처리', '미래 기술', '세 종류의 물']

export function B2Screen({ onNext }: { onNext: () => void }) {
  // 뒤집은 미생물·밀어 본 기술·지금 화면 — 폰에 저장(새로고침·되돌아와도 유지)
  const [flipped, setFlipped] = useDraft<boolean[]>('b2-flip', [false, false, false, false])
  const [tried, setTried] = useDraft<boolean[]>('b2-tech', [false, false, false])
  const [part, setPart] = useDraft<number>('b2-part', 0)
  const [open, setOpen] = useState<boolean[]>([false, false, false, false])
  const [t, setT] = useState(0)
  const [w, setW] = useState(0)
  const [waters, setWaters] = useDraft<boolean[]>('b2-water', [true, false, false])
  const wCount = waters.filter(Boolean).length
  const pickW = (k: number) => {
    setW(k)
    if (!waters[k]) setWaters(waters.map((v, j) => v || j === k))
  }
  const fCount = flipped.filter(Boolean).length
  const tCount = tried.filter(Boolean).length
  const reached = [true, fCount === 4, fCount === 4 && tCount === 3] // 열린 화면
  const mic = B2.groups[0]
  const fut = B2.groups[1]

  const goPart = (k: number) => {
    setPart(k)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const flip = (k: number) => {
    setOpen((o) => o.map((v, j) => (j === k ? !v : v)))
    if (!flipped[k]) {
      const nf = flipped.map((v, j) => v || j === k)
      setFlipped(nf)
    }
  }
  const done = (k: number) => {
    if (tried[k]) return
    const nt = tried.map((v, j) => v || j === k)
    setTried(nt)
    // 아직 안 밀어 본 기술로 탭 옮김
    const nx = nt.findIndex((v) => !v)
    if (nx >= 0) setTimeout(() => setT(nx), 900)
  }

  const hint = (text: string) => (
    <p className="mx-auto mb-2 flex w-fit items-center justify-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-center text-[clamp(12.5px,3.6vw,14.5px)] font-bold text-sea shadow-[0_4px_12px_-6px_rgba(8,60,100,0.45)] ring-1 ring-[#c3dde8]">
      <Icon name="lock" size={15} />
      {text}
    </p>
  )

  return (
    <>
      <Hero eyebrow={B2.eyebrow} title={B2.title} />
      <Sheet>
        {/* 화면 1·2·3 표시 — 열린 화면은 눌러서 다시 볼 수 있음 */}
        <div className="mt-1 mb-7 flex items-center justify-center gap-1">
          {PARTS.map((x, k) => (
            <div key={x} className="flex items-center gap-1">
              <button
                onClick={() => reached[k] && goPart(k)}
                disabled={!reached[k]}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[clamp(12px,3.45vw,14px)] font-bold ${k === part ? 'bg-sea text-white' : reached[k] ? 'bg-[#d6eef6] text-sea' : 'bg-[#eef4f7] text-[#a9bfca]'}`}
              >
                <span>{k + 1}</span>
                {x}
              </button>
              {k < 2 && <span className="text-[12px] text-[#a9bfca]">›</span>}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {part === 0 && (
            <motion.div key="p0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <p className={head}>{mic.title}</p>
              <p className={sub}>{mic.sub}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="rounded-full bg-[#e3f1f6] px-3 py-1 text-[13px] font-bold text-sea">미생물 도감 {fCount} / 4</span>
                {fCount === 4 && (
                  <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full bg-lime px-3 py-1 text-[13px] font-bold text-sea">
                    도감 완성!
                  </motion.span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {mic.items.map((x, k) => (
                  <MicrobeCard key={x.k} k={k} open={open[k]} onFlip={() => flip(k)} />
                ))}
              </div>
            </motion.div>
          )}

          {part === 1 && (
            <motion.div key="p1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <p className={head}>{fut.title}</p>
              <p className={sub}>{fut.sub}</p>
              <div className="mt-4 flex justify-center gap-1.5">
                {fut.items.map((x, k) => (
                  <button key={x.k} onClick={() => setT(k)} className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[clamp(13.5px,3.85vw,15.5px)] font-bold ${k === t ? 'bg-sea text-white' : 'bg-[#eef4f7] text-sea'}`}>
                    {tried[k] && <Icon name="check" size={14} />}
                    {x.k}
                  </button>
                ))}
              </div>
              <div className="tile mt-3 rounded-3xl p-2.5">
                <Compare key={t} t={t} onDone={() => done(t)} />
                <div className="mt-2.5 px-1 pb-1 text-center">
                  <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-[clamp(18px,5.1vw,21px)] font-bold text-ink">
                    {fut.items[t].k}
                    <span className="text-[clamp(12px,3.45vw,14px)] font-bold text-cyan">{TECH[t].full}</span>
                  </p>
                  <p className="text-[clamp(14.5px,4.1vw,17px)] leading-snug text-mute">{fut.items[t].v}</p>
                  {!tried[t] && <p className="mt-1.5 text-[13px] font-bold text-cyan">가운데 동그라미를 오른쪽 끝까지 밀어 보세요</p>}
                </div>
              </div>
            </motion.div>
          )}

          {part === 2 && (
            <motion.div key="p2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <p className={head}>{B2.flowTitle}</p>
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {B2.flows.map((f, k) => (
                  <button key={f.from} onClick={() => pickW(k)} className={`flex items-center justify-center gap-1 rounded-2xl px-1 py-2.5 text-[clamp(14px,3.97vw,16px)] font-bold ${k === w ? 'text-white' : 'bg-[#eef4f7] text-sea'}`} style={k === w ? { background: FLOW_COLOR[k] } : undefined}>
                    {waters[k] && k !== w && <Icon name="check" size={14} />}
                    {f.from}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={w} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="tile mt-3 rounded-3xl px-3.5 py-4">
                  <p className="text-center text-[clamp(16px,4.5vw,18.5px)] font-bold text-ink">
                    <span style={{ color: FLOW_COLOR[w] }}>{B2.flows[w].from}</span> → <span style={{ color: RESULT }}>{B2.flows[w].to}</span>
                  </p>
                  <ol className="mt-3">
                    {B2.flows[w].steps.map((st, k) => (
                      <motion.li key={st} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + k * 0.1 }}>
                        <div className="flex items-center gap-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: FLOW_COLOR[w] }}>
                            {k + 1}
                          </span>
                          <span className="grid h-[62px] w-[93px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eaf4f8] ring-1 ring-[#c3dde8]">
                            {FLOW_PIC[st] ? <img src={FLOW_PIC[st]} alt="" className="h-full w-full object-cover" /> : <Icon name={FLOW_ICON[st] ?? 'water'} size={30} className="text-sea" />}
                          </span>
                          <span className="text-[clamp(16px,4.5vw,18.5px)] font-bold text-ink [word-break:keep-all]">{st}</span>
                        </div>
                        {k < 3 && <span className="my-0.5 ml-[13px] block h-3.5 w-[2px] rounded bg-[#c3dde8]" aria-hidden />}
                      </motion.li>
                    ))}
                  </ol>
                  <p className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-[#e6f5df] py-2 text-[clamp(15px,4.25vw,17.5px)] font-bold" style={{ color: RESULT }}>
                    <Icon name="water" size={18} /> {B2.flows[w].to} 완성
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomBar>
          {/* 다 할 때까지 '다음' 잠김 → 다 하면 눌러서 다음 화면(자동으로 안 넘어감) */}
          {part === 0 && (
            <>
              {fCount < 4 ? hint(`미생물 4장을 모두 뒤집으면 넘어갈 수 있어요 (${fCount}/4)`) : null}
              <Button onClick={() => goPart(1)} disabled={fCount < 4}>
                다음
              </Button>
            </>
          )}
          {part === 1 && (
            <>
              {tCount < 3 ? hint(`3가지 기술을 모두 밀어 보면 넘어갈 수 있어요 (${tCount}/3)`) : null}
              <Button onClick={() => goPart(2)} disabled={tCount < 3}>
                다음
              </Button>
            </>
          )}
          {part === 2 && (
            <>
              {wCount < 3 ? hint(`세 가지 물을 모두 눌러 보면 넘어갈 수 있어요 (${wCount}/3)`) : null}
              <Button onClick={onNext} disabled={wCount < 3}>
                {B2.cta}
              </Button>
            </>
          )}
        </BottomBar>
      </Sheet>
    </>
  )
}
