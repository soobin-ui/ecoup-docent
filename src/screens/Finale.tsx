import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COMPLETE, EXCHANGE, HANDSON, STAMPS, SURVEY } from '../content/tour'
import type { Progress } from '../lib/progress'
import { dayLabel, nowKST, scheduleDay } from '../lib/day'
import { dayLetter, getClosedSlots, getStatus, staffExchange, submitSurvey } from '../lib/api'
import type { SlotKey } from '../lib/api'
import { BottomBar, Button, Card, Character, Hero, ImageSlot, Sheet } from '../components/ui'
import { Face, Icon } from '../components/Icons'

type Upd = (patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => void

/* ── 미션 3개 완료 ─────────────────────────────────── */
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 61) % 100,
  d: 2.6 + ((i * 7) % 10) / 6,
  delay: ((i * 13) % 10) / 8,
  c: ['#c8f169', '#ffffff', '#00add0', '#0fb04a', '#ffe15a'][i % 5],
  s: 10 + ((i * 5) % 8),
}))
export function CompleteScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      {/* 물방울 모양 축하 조각 */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {CONFETTI.map((c, i) => (
          <motion.svg
            key={i}
            width={c.s}
            height={c.s * 1.2}
            viewBox="0 0 50 60"
            className="absolute"
            style={{ left: `${c.x}%`, top: -30 }}
            initial={{ y: -40, rotate: 0 }}
            animate={{ y: '110vh', rotate: 200 }}
            transition={{ duration: c.d, delay: c.delay, ease: 'easeIn', repeat: 1 }}
          >
            <path d="M25 2C25 2 4 27 4 39a21 21 0 0 0 42 0C46 27 25 2 25 2z" fill={c.c} stroke="#0b4a75" strokeWidth="3" />
          </motion.svg>
        ))}
      </div>
      <Hero eyebrow="TOUR COMPLETE" title={COMPLETE.title} center />
      <div className="relative -mt-4 flex flex-col items-center text-center">
        <div className="relative grid h-[190px] w-[190px] place-items-center">
          <span className="ripple absolute inset-0 rounded-full border-4 border-white/80" />
          <span className="ripple d2 absolute inset-0 rounded-full border-4 border-white/80" />
          <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: [30, -30, 0, -10, 0] }} transition={{ duration: 1.1 }}>
            <Character level={3} size={170} bob />
          </motion.div>
        </div>
        <div className="mt-2 flex items-end gap-1.5 rounded-full bg-white/70 px-4 py-2">
          {[0, 1, 2, 3].map((c) => (
            <span key={c} className="flex items-end gap-1.5">
              <Character level={c} size={c === 3 ? 46 : 36} />
              {c < 3 && <span className="pb-2 text-[clamp(14.5px,4.1vw,17px)] font-bold text-sea/60">→</span>}
            </span>
          ))}
        </div>
      </div>
      <Sheet>
        <p className="text-center text-[clamp(16px,4.49vw,18.5px)] leading-[1.65] text-ink">{COMPLETE.lead}</p>
        <div className="mt-5 flex justify-center gap-3">
          {STAMPS.map((s) => (
            <div key={s} className="flex h-[72px] w-[72px] -rotate-6 flex-col items-center justify-center rounded-full border-[3px] border-sea bg-lime text-[clamp(13px,3.72vw,15.5px)] font-bold leading-tight text-sea shadow-[0_4px_0_#0b4a75]">
              {s.split(' ').map((w) => (
                <span key={w} className="block">
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
        <BottomBar>
          <Button onClick={onNext} breathe>
            {COMPLETE.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/* ── 06 체험 2종 + 회차 고르기 ─────────────────────── */
export function HandsOnScreen({ p, update, onNext }: { p: Progress; update: Upd; onNext: () => void }) {
  const { day, live, hm } = scheduleDay()
  const [closed, setClosed] = useState<SlotKey[]>([])
  const [openPick, setOpenPick] = useState<string | null>(null)
  useEffect(() => {
    getClosedSlots(day)
      .then(setClosed)
      .catch(() => setClosed([]))
  }, [day])

  const choose = (program: string, time: string | null) => {
    update((prev) => {
      const b = { ...prev.bookings }
      if (time) b[program] = { day, time }
      else delete b[program]
      return { bookings: b }
    })
    setOpenPick(null)
  }

  return (
    <>
      <Hero eyebrow={HANDSON.eyebrow} title={HANDSON.title} lead={HANDSON.lead} />
      <Sheet>
      {!live && <p className="text-[clamp(13.5px,3.85vw,16px)] font-bold text-[#b45309]">행사 기간(11/18~21) 회차표 미리보기 · {dayLabel(day)}</p>}

      <div className="mt-3 flex flex-col gap-3">
        {HANDSON.programs.map((pr) => {
          const mine = p.bookings[pr.id]
          const picking = openPick === pr.id
          return (
            <Card key={pr.id} className="p-4">
              <ImageSlot label={`${pr.name} 사진`} className="h-[150px]">
                <Icon name={pr.id === 'filter' ? 'filter' : 'energy'} size={44} className="text-white/90" />
              </ImageSlot>
              <p className="mt-3.5 text-[19px] font-extrabold">{pr.name}</p>
              <p className="mt-1 text-[clamp(15.5px,4.36vw,18px)] leading-relaxed text-mute">{pr.desc}</p>
              <div className="mt-2.5 flex gap-3 text-[clamp(14px,3.97vw,16.5px)] text-mute">
                <span className="flex items-center gap-1">
                  <Icon name="people" size={16} /> 회차당 {pr.capacity}명
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="clock" size={16} /> 약 {pr.minutes}분
                </span>
              </div>

              {mine && !picking ? (
                <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 rounded-2xl border-2 border-dashed border-deep bg-[#eaf6fa] p-4">
                  <p className="flex items-center gap-1.5 text-[clamp(13.5px,3.85vw,16px)] font-extrabold text-deep">
                    <Icon name="ticket" size={17} /> {HANDSON.picked}
                  </p>
                  <p className="mt-1 text-[22px] font-extrabold">
                    {dayLabel(mine.day)} {mine.time}
                  </p>
                  <p className="mt-1 text-[clamp(13.5px,3.85vw,16px)] text-mute">{HANDSON.ticketNote}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setOpenPick(pr.id)} className="h-10 flex-1 rounded-xl bg-white text-[clamp(14.5px,4.1vw,17px)] font-semibold text-deep">
                      {HANDSON.change}
                    </button>
                    <button onClick={() => choose(pr.id, null)} className="h-10 rounded-xl px-4 text-[clamp(14.5px,4.1vw,17px)] font-semibold text-mute">
                      {HANDSON.cancel}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {!picking && (
                    <Button variant="outline" className="mt-4 h-12 text-[clamp(16.5px,4.62vw,19px)]" onClick={() => setOpenPick(pr.id)}>
                      <Icon name="clock" size={18} /> {HANDSON.pick}
                    </Button>
                  )}
                  <AnimatePresence>
                    {picking && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {HANDSON.times.map((t) => {
                            const isClosed = closed.some((c) => c.program === pr.id && c.time === t)
                            const isPast = live && t <= hm
                            const off = isClosed || isPast
                            return (
                              <button
                                key={t}
                                disabled={off}
                                onClick={() => choose(pr.id, t)}
                                className={`flex h-12 flex-col items-center justify-center rounded-xl border text-[clamp(15.5px,4.36vw,18px)] font-extrabold ${
                                  off ? 'border-transparent bg-[#eef2f3] text-[#a9b6bb]' : mine?.time === t ? 'border-deep bg-deep text-white' : 'border-line bg-white text-ink'
                                }`}
                              >
                                {t}
                                {off && <span className="text-[clamp(11px,3.21vw,13.5px)] font-semibold">{isClosed ? HANDSON.closed : HANDSON.past}</span>}
                              </button>
                            )
                          })}
                        </div>
                        <button onClick={() => setOpenPick(null)} className="mt-2 h-10 w-full text-[clamp(14.5px,4.1vw,17px)] font-semibold text-mute">
                          닫기
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Card>
          )
        })}
      </div>
      <p className="mt-3 text-[clamp(13.5px,3.85vw,16px)] text-mute">{HANDSON.operator}</p>

      <BottomBar>
        <Button onClick={onNext}>{HANDSON.cta}</Button>
        {Object.keys(p.bookings).length === 0 && <p className="mt-2 text-center text-[clamp(13.5px,3.85vw,16px)] text-mute">시간을 고르지 않아도 넘어갈 수 있어요</p>}
      </BottomBar>
      </Sheet>
    </>
  )
}

/* ── 07 설문 ───────────────────────────────────────── */
export function SurveyScreen({ p, update, onDone }: { p: Progress; update: Upd; onDone: () => void }) {
  const [page, setPage] = useState(0)
  const [nick, setNick] = useState(p.nickname)
  const [ans, setAns] = useState<Record<string, string>>(p.survey ?? {})
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const qs = SURVEY.pages[page]

  const pageOk = (i: number) => SURVEY.pages[i].every((q) => ans[q.id]) && (i > 0 || nick.trim().length > 0)

  const next = async () => {
    if (page === 0 && !nick.trim()) return setErr(SURVEY.needNick)
    if (!pageOk(page)) return setErr(SURVEY.needAll)
    setErr('')
    if (page < SURVEY.pages.length - 1) {
      setPage(page + 1)
      window.scrollTo({ top: 0 })
      return
    }
    setBusy(true)
    const nickname = nick.trim()
    update({ nickname, survey: ans })
    const bookings = Object.fromEntries(Object.entries(p.bookings).map(([k, v]) => [k, `${dayLabel(v.day)} ${v.time}`]))
    try {
      const r = await submitSurvey({ deviceId: p.deviceId, day: nowKST().day, nickname, answers: ans, bookings })
      update({ code: r.code, exchanged: r.exchanged, offlineCode: false })
    } catch {
      // 연결이 끊겨도 막히지 않게 — 임시 번호로 보여 주고 교환 화면에서 다시 보냄
      update((prev) => ({ code: prev.code ?? `${dayLetter(nowKST().day)}-임시${prev.deviceId.slice(0, 3).toUpperCase()}`, offlineCode: true }))
    }
    setBusy(false)
    onDone()
  }

  return (
    <>
      <Hero eyebrow={`SURVEY · ${page + 1} / ${SURVEY.pages.length}`} title={SURVEY.title} lead={SURVEY.lead} />
      <Sheet>

      {page === 0 && (
        <label className="mt-1 block">
          <span className="text-[clamp(16.5px,4.62vw,19px)] font-extrabold">{SURVEY.nickname.label}</span>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value.slice(0, SURVEY.nickname.max))}
            placeholder={SURVEY.nickname.placeholder}
            autoComplete="off"
            enterKeyHint="done"
            className="mt-2 h-14 w-full rounded-2xl border-2 border-line bg-white px-4 outline-none focus:border-deep"
          />
          <span className="mt-1 block text-right text-[clamp(12.5px,3.59vw,15px)] text-mute">
            {nick.length}/{SURVEY.nickname.max}
          </span>
        </label>
      )}

      {qs.map((q) => (
        <div key={q.id} className="mt-5">
          <p className="text-[clamp(16.5px,4.62vw,19px)] font-extrabold">{q.label}</p>
          <div className={`mt-2.5 ${'faces' in q && q.faces ? 'grid grid-cols-4 gap-2' : 'flex flex-wrap gap-2'}`}>
            {q.options.map((o, oi) => {
              const on = ans[q.id] === o
              if ('faces' in q && q.faces)
                return (
                  <button
                    key={o}
                    onClick={() => setAns({ ...ans, [q.id]: o })}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-2.5 text-[clamp(12.5px,3.59vw,15px)] font-semibold leading-tight ${on ? 'border-deep bg-deep text-white' : 'border-line bg-white text-mute'}`}
                    aria-pressed={on}
                  >
                    <Face level={oi} />
                    {o}
                  </button>
                )
              return (
                <button
                  key={o}
                  onClick={() => setAns({ ...ans, [q.id]: o })}
                  className={`h-11 rounded-full border-2 px-4 text-[clamp(15.5px,4.36vw,18px)] font-semibold ${on ? 'border-deep bg-deep text-white' : 'border-line bg-white text-ink'}`}
                  aria-pressed={on}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <BottomBar>
        {err && <p className="mb-2 text-center text-[clamp(14.5px,4.1vw,17px)] font-semibold text-[#c2410c]">{err}</p>}
        <Button onClick={next} disabled={busy}>
          {busy ? '보내는 중…' : page < SURVEY.pages.length - 1 ? SURVEY.next : SURVEY.submit}
        </Button>
      </BottomBar>
      </Sheet>
    </>
  )
}

/* ── 08 기념품 교환 ────────────────────────────────── */
export function ExchangeScreen({ p, update }: { p: Progress; update: Upd }) {
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')
  const [holding, setHolding] = useState(false)
  const holdT = useRef<number | undefined>(undefined)

  // 화면 열 때 서버 상태 확인 + 임시 번호였다면 다시 보내기
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (p.offlineCode && p.survey) {
          const bookings = Object.fromEntries(Object.entries(p.bookings).map(([k, v]) => [k, `${dayLabel(v.day)} ${v.time}`]))
          const r = await submitSurvey({ deviceId: p.deviceId, day: nowKST().day, nickname: p.nickname, answers: p.survey, bookings })
          if (alive) update({ code: r.code, exchanged: r.exchanged, offlineCode: false })
        } else {
          const r = await getStatus(p.deviceId)
          if (alive && r.code) update({ code: r.code, exchanged: r.exchanged })
        }
      } catch {
        /* 연결 실패 — 그대로 둠 */
      }
    })()
    return () => {
      alive = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startHold = () => {
    setHolding(true)
    holdT.current = window.setTimeout(() => {
      setHolding(false)
      setPinOpen(true)
      setPin('')
      setMsg('')
    }, 900)
  }
  const endHold = () => {
    setHolding(false)
    window.clearTimeout(holdT.current)
  }

  const confirm = async () => {
    setMsg('')
    try {
      const r = await staffExchange(pin, { deviceId: p.deviceId })
      if (r === 'ok' || r === 'already') {
        update({ exchanged: true })
        setPinOpen(false)
      } else if (r === 'badpin') setMsg('스태프 번호가 맞지 않아요')
      else setMsg('설문 기록을 찾지 못했어요. 연결 상태를 확인해 주세요')
    } catch {
      setMsg('연결이 불안정해요. 잠시 후 다시 눌러 주세요')
    }
  }

  const bookings = Object.entries(p.bookings)
  return (
    <>
      <div className="relative">
        <Hero eyebrow={`${p.nickname || '맑은 물방울'} 님`} title={[p.exchanged ? EXCHANGE.done : EXCHANGE.title]} center />
        <motion.div className="absolute right-0 top-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
          <Character level={3} size={76} bob />
        </motion.div>
      </div>
      <Sheet>
      <div className="flex justify-center gap-3">
        {STAMPS.map((s, i) => (
          <div
            key={s}
            className={`flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full border-[3px] text-[clamp(14px,3.97vw,16.5px)] font-extrabold leading-tight ${
              p.solved[i] ? 'border-sea bg-lime text-sea shadow-[0_4px_0_#0b4a75]' : 'border-dashed border-[#c5d2d7] text-[#9fb0b7]'
            }`}
          >
            {s.split(' ').map((w) => (
              <span key={w} className="block">
                {w}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="relative mt-5 rounded-3xl border border-line bg-white p-5 text-center">
        <p className="flex items-center justify-center gap-1.5 text-[clamp(13.5px,3.85vw,16px)] font-extrabold text-mute">
          <Icon name="gift" size={16} /> {EXCHANGE.giftLabel}
        </p>
        <p className="mt-1 text-[clamp(17.5px,4.87vw,20px)] font-extrabold">{EXCHANGE.giftName}</p>
        <div className="my-4 border-t border-dashed border-line" />
        <p className="text-[clamp(15.5px,4.36vw,18px)] font-extrabold">{EXCHANGE.show}</p>
        <p className="mt-1 text-[clamp(13px,3.72vw,15.5px)] font-semibold text-mute">{EXCHANGE.codeLabel}</p>
        <p className={`mt-1 font-mono text-[46px] font-extrabold tracking-[0.12em] ${p.exchanged ? 'text-[#b6c3c8] line-through decoration-4' : 'text-ink'}`}>{p.code ?? '----'}</p>
        {p.offlineCode && <p className="mt-1 text-[clamp(13.5px,3.85vw,16px)] text-[#9a5b00]">{EXCHANGE.offline}</p>}
        <AnimatePresence>
          {p.exchanged && (
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: -10 }}
              transition={{ type: 'spring', stiffness: 220, damping: 15 }}
              className="pointer-events-none absolute right-4 bottom-6 rounded-xl border-4 border-eco px-3 py-1 text-[22px] font-extrabold text-eco"
            >
              {EXCHANGE.done}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {p.exchanged && <p className="mt-3 text-center text-[clamp(15px,4.23vw,17.5px)] text-mute">{EXCHANGE.doneSub}</p>}

      {bookings.length > 0 && (
        <div className="mt-4 rounded-3xl border-2 border-dashed border-deep bg-[#eaf6fa] p-4">
          <p className="flex items-center gap-1.5 text-[clamp(13.5px,3.85vw,16px)] font-extrabold text-deep">
            <Icon name="ticket" size={17} /> {EXCHANGE.ticket}
          </p>
          {bookings.map(([id, b]) => (
            <p key={id} className="mt-1.5 flex justify-between text-[clamp(16.5px,4.62vw,19px)] font-extrabold">
              <span>{HANDSON.programs.find((x) => x.id === id)?.name}</span>
              <span>
                {dayLabel(b.day)} {b.time}
              </span>
            </p>
          ))}
        </div>
      )}

      <BottomBar>
        {!p.exchanged && (
          <button
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            onContextMenu={(e) => e.preventDefault()}
            className="relative h-14 w-full select-none overflow-hidden rounded-2xl border-2 border-deep bg-white text-[clamp(16.5px,4.62vw,19px)] font-extrabold text-deep"
          >
            <span className="absolute inset-y-0 left-0 bg-[#d6eef6]" style={{ width: holding ? '100%' : '0%', transition: holding ? 'width 0.9s linear' : 'none' }} />
            <span className="relative">{holding ? EXCHANGE.staffHold : EXCHANGE.staffBtn}</span>
          </button>
        )}
      </BottomBar>
      </Sheet>

      <AnimatePresence>
        {pinOpen && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-[360px] rounded-3xl bg-white p-6">
              <p className="text-[20px] font-extrabold">{EXCHANGE.pinTitle}</p>
              <p className="mt-1 text-[clamp(15px,4.23vw,17.5px)] text-mute">{EXCHANGE.pinLead}</p>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                type="password"
                autoFocus
                autoComplete="off"
                className="mt-4 h-14 w-full rounded-2xl border-2 border-line text-center text-[24px] tracking-[0.5em] outline-none focus:border-deep"
              />
              {msg && <p className="mt-2 text-[clamp(14.5px,4.1vw,17px)] font-semibold text-[#c2410c]">{msg}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setPinOpen(false)} className="h-12 flex-1 rounded-2xl bg-[#eef2f3] font-extrabold text-mute">
                  취소
                </button>
                <button onClick={confirm} disabled={pin.length < 4} className="h-12 flex-1 rounded-2xl bg-deep font-extrabold text-white disabled:bg-[#b9c7cd]">
                  교환 완료 처리
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
