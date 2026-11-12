import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COMPLETE, CONTEST, HANDS, REGISTER, STAMP_GET, SURVEY, TICKET, WATER_STATION } from '../content/tour'
import type { Progress } from '../lib/progress'
import { stampLabel } from '../lib/day'
import { clearDraft, useDraft } from '../lib/draft'
import { getTicket, registerTicket, staffUse, warmUp } from '../lib/api'
import { BottomBar, Button, Card, Character, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import { StampBoard } from '../components/Mission'
import { Scanner } from '../components/Scanner'
import { LOGOS } from './Info'

type Upd = (patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => void
const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.07 } })
const t15 = 'text-[clamp(15px,4.23vw,17.5px)]'

/* ── 스탬프 획득(1/3 · 2/3) · 3개 완성 ─────────────── */
export function StampGetScreen({ p, which, onNext }: { p: Progress; which: 0 | 1 | 2; onNext: () => void }) {
  const g = STAMP_GET[which]
  const done = which === 2
  return (
    <>
      <div className="flex flex-col items-center pt-2 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="rounded-full bg-sea px-4 py-1.5 text-[clamp(13.5px,3.85vw,16px)] font-bold tracking-wide text-white">
          {g.label}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 15, delay: 0.2 }}
          className="title-shadow mt-3 text-[clamp(27px,8vw,35px)] font-bold leading-[1.2]"
          style={{ ['--stroke' as never]: '5px' }}
        >
          <span className="stroke-title block text-lime">{g.title}</span>
        </motion.h1>
      </div>
      <motion.div {...fade(1)} className="mt-5 rounded-3xl bg-white/95 p-4 shadow-[0_10px_30px_-14px_rgba(8,60,100,0.45)]">
        <StampBoard got={p.stamps} fresh={which} />
      </motion.div>
      {done ? (
        <motion.div {...fade(3)} className="mt-5 rounded-3xl border-2 border-[#f3cf6a] bg-[#fff1bf] p-5 text-center shadow-[0_10px_30px_-14px_rgba(160,110,0,0.45)]">
          <Icon name="gift" size={52} className="mx-auto text-[#d97706]" />
          <p className="mt-2 text-[clamp(22px,6.2vw,27px)] font-bold text-sea">{COMPLETE.giftHead}</p>
          {COMPLETE.giftBody.map((l) => (
            <p key={l} className={`${t15} mt-1 text-[#7a4a00]`}>
              {l}
            </p>
          ))}
        </motion.div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center">
          {/* 물방울이 직접 말하는 말풍선 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 15 }}
            className="relative mb-3 max-w-[85%] rounded-3xl bg-white px-5 py-3 text-center [text-wrap:balance] text-[clamp(17px,4.8vw,20px)] font-bold text-sea shadow-[0_8px_20px_-8px_rgba(8,60,100,0.45)]"
          >
            {g.next}
            <span className="absolute -bottom-[9px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 rounded-[4px] bg-white" />
          </motion.div>
          <Character level={3} size={Math.min(170, Math.round(window.innerHeight * 0.2))} bob />
        </div>
      )}
      <BottomBar tone="none">
        <Button onClick={onNext} breathe>
          {done ? COMPLETE.cta : '다음'}
        </Button>
      </BottomBar>
    </>
  )
}

/* ── 워터 스테이션 ──────────────────────────────── */
function Fridge() {
  return (
    <svg viewBox="0 0 160 200" className="h-[clamp(150px,26vh,220px)] w-auto" aria-hidden>
      <rect x="14" y="8" width="132" height="184" rx="16" fill="#0b4a75" />
      <rect x="24" y="18" width="112" height="164" rx="10" fill="#dff6ff" stroke="#7fd8f2" strokeWidth="3" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="30" y={70 + row * 50} width="100" height="4" rx="2" fill="#7fd8f2" />
          {[0, 1, 2, 3].map((k) => (
            <g key={k} transform={`translate(${38 + k * 24} ${34 + row * 50})`}>
              <rect x="2" y="0" width="8" height="6" rx="1.5" fill="#00add0" />
              <rect x="0" y="5" width="12" height="31" rx="4" fill="#5fd0ee" />
              <rect x="0" y="16" width="12" height="7" fill="#fff" opacity=".8" />
            </g>
          ))}
        </g>
      ))}
      <rect x="128" y="80" width="5" height="40" rx="2.5" fill="#fff" opacity=".7" />
    </svg>
  )
}
export function WaterScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow="잠깐!" title={WATER_STATION.title} />
      <div className="flex flex-1 flex-col items-center text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
          <Fridge />
        </motion.div>
        <p className="mt-5 text-[clamp(24px,6.8vw,30px)] font-bold text-sea">{WATER_STATION.head}</p>
        {WATER_STATION.body.map((l) => (
          <p key={l} className={`${t15} mt-1 text-sea/85`}>
            {l}
          </p>
        ))}
      </div>
      <BottomBar tone="none">
        <Button onClick={onNext}>{WATER_STATION.cta}</Button>
      </BottomBar>
    </>
  )
}

/* ── 경진대회 소개 ──────────────────────────────── */
export function ContestScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <motion.div {...fade(0)} className="mt-2 rounded-3xl border-2 border-[#f3cf6a] bg-[#fff6d6] px-4 py-6 text-center">
        <Icon name="trophy" size={64} className="mx-auto text-[#e0a100]" />
        <span className="mt-3 inline-block rounded-full bg-sea px-3 py-1 text-[clamp(12.5px,3.59vw,15px)] font-bold tracking-[0.2em] text-white">{CONTEST.tag}</span>
        <h1 className="mt-3 text-[clamp(21px,6vw,26px)] font-bold leading-snug text-sea">
          {CONTEST.title.map((t) => (
            <span key={t} className="block">
              {t.split('ZERO-WASTE').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="whitespace-nowrap">ZERO-WASTE</span>}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className={`${t15} mt-2 leading-relaxed text-ink`}>
          {CONTEST.body.split('ZERO-WASTE')[0]}
          <span className="whitespace-nowrap">ZERO-WASTE</span>
          {CONTEST.body.split('ZERO-WASTE')[1]}
        </p>
      </motion.div>
      <motion.div {...fade(1)} className="mt-6 text-center">
        <p className="text-[clamp(14.5px,4.1vw,17px)] font-bold text-[#c2410c]">{CONTEST.finalists}</p>
        <p className="mt-1 text-[clamp(20px,5.6vw,24px)] font-bold leading-snug text-sea">
          {CONTEST.ask[0]}
          <br />
          {CONTEST.ask[1]}
        </p>
      </motion.div>
      <BottomBar tone="none">
        <Button onClick={onNext} breathe>
          {CONTEST.cta}
        </Button>
      </BottomBar>
    </>
  )
}

/* QR 안내 상자 */
function QrNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4 flex gap-3 rounded-3xl border-2 border-[#f3b24a] bg-[#fff6d6] p-4">
      <Icon name="qr" size={34} className="shrink-0 text-[#b45309]" />
      <div>
        <p className="text-[clamp(16.5px,4.62vw,19px)] font-bold text-[#8a4b00]">{title}</p>
        <p className={`${t15} mt-1 leading-snug text-[#8a4b00]`}>{body}</p>
      </div>
    </div>
  )
}

/* ── 경진대회 작품 5팀 + QR ─────────────────────── */
export function WorksScreen({ onStamp }: { onStamp: () => void }) {
  const [scan, setScan] = useState(false)
  return (
    <>
      <Hero eyebrow={CONTEST.worksEyebrow} title={CONTEST.worksTitle} />
      <Sheet>
        <div className="flex flex-col gap-2.5">
          {CONTEST.teams.map((t, i) => (
            <motion.div key={t.team} {...fade(i)} className="rounded-3xl tile border-l-[6px] px-4 py-3" style={{ borderLeftColor: t.color }}>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[clamp(13.5px,3.85vw,16px)] font-bold text-white" style={{ background: t.color }}>
                  팀 {t.team}
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[clamp(12.5px,3.59vw,15px)] text-mute">
                  <img src={LOGOS[t.logo]} alt="" className="h-5 w-auto max-w-[44px] object-contain" />
                  {t.school}
                </span>
              </div>
              <p className="mt-2 text-[clamp(15.5px,4.36vw,18px)] font-bold leading-snug text-ink">{t.idea}</p>
            </motion.div>
          ))}
        </div>
        <QrNote title={CONTEST.qrTitle} body={CONTEST.qrBody} />
        <BottomBar>
          <Button onClick={() => setScan(true)} breathe>
            <Icon name="qr" size={22} /> {CONTEST.qrCta}
          </Button>
        </BottomBar>
      </Sheet>
      {scan && <Scanner kind="contest" title={CONTEST.scanTitle} onStamp={onStamp} onClose={() => setScan(false)} />}
    </>
  )
}

/* ── 체험 2종 + QR ──────────────────────────────── */
export function HandsScreen({ onStamp }: { onStamp: () => void }) {
  const [scan, setScan] = useState(false)
  return (
    <>
      <Hero eyebrow={HANDS.eyebrow} title={HANDS.title} lead={HANDS.lead} />
      <Sheet>
        <div className="flex flex-col gap-3">
          {HANDS.programs.map((pr, i) => (
            <motion.div key={pr.id} {...fade(i)}>
              <Card className="flex gap-3.5 p-4">
                <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-2xl text-white" style={{ background: `linear-gradient(150deg, ${pr.color}, ${pr.color}cc)` }}>
                  <Icon name={pr.icon} size={34} />
                </span>
                <div className="min-w-0">
                  <p className="text-[clamp(18px,5vw,21px)] font-bold text-ink">{pr.name}</p>
                  <p className={`${t15} mt-0.5 leading-snug text-mute`}>{pr.desc}</p>
                  <span className="mt-2 inline-block rounded-full px-2.5 py-1 text-[clamp(13px,3.72vw,15.5px)] font-bold" style={{ background: pr.soft, color: pr.color }}>
                    {pr.gift}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <QrNote title={HANDS.qrTitle} body={HANDS.qrBody} />
        <BottomBar>
          <Button onClick={() => setScan(true)} breathe>
            <Icon name="qr" size={22} /> {HANDS.qrCta}
          </Button>
        </BottomBar>
      </Sheet>
      {scan && <Scanner kind="hands" title={HANDS.scanTitle} onStamp={onStamp} onClose={() => setScan(false)} />}
    </>
  )
}

/* ── 참가자 등록 1/2 ─────────────────────────────── */
export function RegisterScreen({ p, update, onNext }: { p: Progress; update: Upd; onNext: () => void }) {
  const [name, setName] = useDraft('reg-name', p.reg?.name ?? '')
  const [phone, setPhone] = useDraft('reg-phone', p.reg?.phone8 ?? '')
  const [who, setWho] = useDraft('reg-who', p.reg?.who ?? '')
  const [agree, setAgree] = useDraft('reg-agree', p.reg?.consent ?? false)
  const [err, setErr] = useState('')

  const next = () => {
    if (name.trim().length < 2) return setErr(REGISTER.errName)
    if (!/^\d{8}$/.test(phone)) return setErr(REGISTER.errPhone)
    if (!who) return setErr(REGISTER.errWho)
    if (!agree) return setErr(REGISTER.errConsent)
    update({ reg: { name: name.trim(), phone8: phone, who, consent: true } })
    clearDraft('reg-name', 'reg-phone', 'reg-who', 'reg-agree')
    onNext()
  }
  const lab = 'text-[clamp(16px,4.5vw,18.5px)] font-bold text-ink'
  return (
    <>
      <Hero eyebrow={REGISTER.eyebrow} title={REGISTER.title} />
      <Sheet>
        <label className="block">
          <span className={lab}>{REGISTER.name.label}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            placeholder={REGISTER.name.placeholder}
            autoComplete="name"
            className="mt-2 h-14 w-full rounded-2xl border-2 border-line bg-white px-4 outline-none focus:border-sea"
          />
        </label>
        <div className="mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className={lab}>{REGISTER.phone.label}</span>
            <span className="text-[clamp(12.5px,3.59vw,15px)] font-bold text-[#c2410c]">{REGISTER.phone.note}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="grid h-14 w-[72px] shrink-0 place-items-center rounded-2xl bg-[#e8f0f3] text-[18px] font-bold text-mute">010</span>
            <span className="text-mute">-</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder={REGISTER.phone.placeholder}
              inputMode="numeric"
              autoComplete="tel-local"
              className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-4 tracking-wider outline-none focus:border-sea"
            />
          </div>
        </div>
        <div className="mt-5">
          <span className={lab}>{REGISTER.who.label}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {REGISTER.who.options.map((o) => (
              <button
                key={o}
                onClick={() => setWho(o)}
                aria-pressed={who === o}
                className={`h-11 rounded-full border-2 px-4 text-[clamp(15px,4.23vw,17.5px)] font-bold ${who === o ? 'border-sea bg-sea text-white' : 'border-line bg-white text-ink'}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-line bg-white p-4">
          <p className="text-[clamp(15.5px,4.36vw,18px)] font-bold text-ink">{REGISTER.consent.title}</p>
          {REGISTER.consent.lines.map((l) => (
            <p key={l} className="mt-1 text-[clamp(13.5px,3.85vw,16px)] text-mute">
              {l}
            </p>
          ))}
          <button onClick={() => setAgree(!agree)} aria-pressed={agree} className="mt-3 flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-lg border-2 ${agree ? 'border-sea bg-sea text-white' : 'border-[#9cc9da] bg-white'}`}>{agree && <Icon name="check" size={18} />}</span>
            <span className="text-[clamp(16px,4.5vw,18.5px)] font-bold text-ink">{REGISTER.consent.agree}</span>
          </button>
        </div>
        <BottomBar>
          {err && <p className="mb-2 text-center text-[clamp(14.5px,4.1vw,17px)] font-bold text-[#c2410c]">{err}</p>}
          <Button onClick={next}>{REGISTER.next}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/* ── 참가자 등록 2/2 — 설문 ──────────────────────── */
export function SurveyScreen({ p, update, onDone }: { p: Progress; update: Upd; onDone: () => void }) {
  const [ans, setAns] = useDraft<Record<string, string | string[] | number>>('survey', p.survey ?? {})
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (id: string, v: string | number, multi = false) => {
    setAns((a) => {
      if (!multi) return { ...a, [id]: v }
      const cur = (a[id] as string[]) ?? []
      return { ...a, [id]: cur.includes(v as string) ? cur.filter((x) => x !== v) : [...cur, v as string] }
    })
  }
  const filled = (id: string) => {
    const v = ans[id]
    return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  }

  const submit = async () => {
    if (!SURVEY.qs.every((q) => filled(q.id))) return setErr(SURVEY.needAll)
    if (!p.reg) return
    setErr('')
    setBusy(true)
    update({ survey: ans })
    clearDraft('survey')
    try {
      const t = await registerTicket({ deviceId: p.deviceId, name: p.reg.name, phone8: p.reg.phone8, who: p.reg.who, survey: ans })
      update({ ticket: { ...t, offline: false } })
    } catch {
      // 연결이 끊겨도 막히지 않게 — 임시 티켓으로 보여 주고 티켓 화면에서 다시 보냄
      update((prev) => ({ ticket: prev.ticket ?? { no: 0, issuedAt: new Date().toISOString(), usedAt: null, offline: true } }))
    }
    setBusy(false)
    onDone()
  }

  return (
    <>
      <Hero eyebrow={SURVEY.eyebrow} title={SURVEY.title} />
      <Sheet>
        {SURVEY.qs.map((q) => (
          <Card key={q.id} className="mt-3 p-4 first:mt-0">
            <p className="text-[clamp(16px,4.5vw,18.5px)] font-bold text-ink">
              {q.label}
              {q.kind === 'multi' && <span className="ml-1 text-[clamp(13px,3.72vw,15.5px)] font-medium text-cyan">· {SURVEY.multiNote}</span>}
            </p>
            {q.kind === 'scale' ? (
              <>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => set(q.id, n)}
                      aria-pressed={ans[q.id] === n}
                      className={`h-12 rounded-xl text-[18px] font-bold ${ans[q.id] === n ? 'bg-sea text-white' : 'bg-[#eef5f8] text-ink'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[clamp(12.5px,3.59vw,15px)] text-mute">
                  <span>{q.low}</span>
                  <span>{q.high}</span>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {q.options!.map((o) => {
                  const on = q.kind === 'multi' ? ((ans[q.id] as string[]) ?? []).includes(o) : ans[q.id] === o
                  return (
                    <button
                      key={o}
                      onClick={() => set(q.id, o, q.kind === 'multi')}
                      aria-pressed={on}
                      className={`min-h-11 rounded-full border-2 px-4 py-1.5 text-[clamp(14.5px,4.1vw,17px)] font-bold ${on ? 'border-sea bg-sea text-white' : 'border-line bg-white text-ink'}`}
                    >
                      {o}
                    </button>
                  )
                })}
              </div>
            )}
          </Card>
        ))}
        <BottomBar>
          {err && <p className="mb-2 text-center text-[clamp(14.5px,4.1vw,17px)] font-bold text-[#c2410c]">{err}</p>}
          <Button onClick={submit} disabled={busy}>
            {busy ? '보내는 중…' : SURVEY.submit}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/* ── 선물 교환 티켓 ──────────────────────────────── */
export function TicketScreen({ p, update, onHome }: { p: Progress; update: Upd; onHome: () => void }) {
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false) // 지급 처리 중(서버 응답 기다림)
  const [holding, setHolding] = useState(false)
  const holdT = useRef<number | undefined>(undefined)
  const t = p.ticket
  const used = Boolean(t?.usedAt)

  // 화면 열 때 서버 상태 확인 + 임시 티켓이면 다시 보내기(연결될 때까지 8초마다 재시도)
  const offline = Boolean(p.ticket?.offline)
  useEffect(() => {
    let alive = true
    let timer = 0
    const sync = async () => {
      try {
        if (p.ticket?.offline && p.reg && p.survey) {
          const r = await registerTicket({ deviceId: p.deviceId, name: p.reg.name, phone8: p.reg.phone8, who: p.reg.who, survey: p.survey })
          if (alive) update({ ticket: { ...r, offline: false } })
        } else {
          const r = await getTicket(p.deviceId)
          if (alive && r) update({ ticket: { ...r, offline: false } })
        }
      } catch {
        if (alive && p.ticket?.offline) timer = window.setTimeout(sync, 8000)
      }
    }
    sync()
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [offline]) // eslint-disable-line react-hooks/exhaustive-deps

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
  // 스태프 번호 창을 열면 서버를 미리 깨워 둠(지급 처리 응답이 빨라지게)
  useEffect(() => {
    if (pinOpen) warmUp()
  }, [pinOpen])
  const confirm = async () => {
    if (busy || pin.length < 4) return
    setBusy(true)
    setMsg('')
    try {
      const r = await staffUse(pin, { deviceId: p.deviceId })
      if (r === 'ok' || r === 'already') {
        const now = await getTicket(p.deviceId).catch(() => null)
        update((prev) => ({ ticket: prev.ticket ? { ...prev.ticket, usedAt: now?.usedAt ?? new Date().toISOString() } : prev.ticket }))
        setPinOpen(false)
      } else if (r === 'badpin') setMsg('스태프 번호가 맞지 않아요')
      else setMsg('티켓 기록을 찾지 못했어요. 연결 상태를 확인해 주세요')
    } catch {
      setMsg('연결이 불안정해요. 잠시 후 다시 눌러 주세요')
    } finally {
      setBusy(false)
    }
  }

  const phone = p.reg ? `010-****-${p.reg.phone8.slice(4)}` : '-'
  const no = t && t.no > 0 ? `No. ${String(t.no).padStart(4, '0')}` : '임시'
  const field = (k: string, v: string) => (
    <div>
      <p className="text-[clamp(12.5px,3.59vw,15px)] text-mute">{k}</p>
      <p className="text-[clamp(16px,4.5vw,18.5px)] font-bold text-ink">{v}</p>
    </div>
  )
  return (
    <>
      <Hero eyebrow={TICKET.eyebrow} title={used ? TICKET.doneTitle : TICKET.title} lead={used ? TICKET.doneLead : TICKET.lead} />
      <Sheet>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative overflow-hidden rounded-3xl shadow-[0_14px_34px_-16px_rgba(8,60,100,0.5)]">
          <div className={`relative px-5 pt-5 pb-6 text-center text-white ${used ? 'bg-[#a9b8c0]' : 'bg-[linear-gradient(150deg,#13b67a,#0e9f6e)]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold tracking-[0.25em] text-white/85">{TICKET.label}</span>
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[13px] font-bold">{used ? TICKET.used : `● ${TICKET.ok}`}</span>
            </div>
            <Icon name="gift" size={58} className="mx-auto mt-3" />
            <p className={`mt-2 text-[clamp(25px,7vw,30px)] font-bold ${used ? 'line-through decoration-2' : ''}`}>{TICKET.name}</p>
            <p className={`${t15} mt-1 text-white/90`}>{TICKET.what}</p>
            {t && t.no > 0 && <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[clamp(14px,3.97vw,16.5px)] font-bold">{TICKET.order(t.no)}</span>}
            <AnimatePresence>
              {used && (
                <motion.span
                  initial={{ scale: 2.2, opacity: 0, rotate: -24 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="absolute top-[38%] left-1/2 -translate-x-1/2 rounded-2xl border-[5px] border-[#e5323b] bg-white/90 px-4 py-1 text-[clamp(26px,7.5vw,32px)] font-bold text-[#e5323b]"
                >
                  {TICKET.paid}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="relative grid grid-cols-2 gap-x-4 gap-y-3 border-t-2 border-dashed border-line bg-white px-5 py-4">
            <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[var(--sheet)]" />
            <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[var(--sheet)]" />
            {field(TICKET.fName, p.reg?.name ?? '-')}
            {field(TICKET.fPhone, phone)}
            {field(TICKET.fNo, no)}
            {field(used ? TICKET.fUsed : TICKET.fIssued, t ? stampLabel(used ? t.usedAt! : t.issuedAt) : '-')}
          </div>
        </motion.div>
        {t?.offline && <p className="mt-3 text-center text-[clamp(14px,3.97vw,16.5px)] text-[#b45309]">{TICKET.offline}</p>}

        <BottomBar>
          {used ? (
            <>
              <button disabled className="h-[56px] w-full rounded-2xl bg-[#dfe7eb] text-[clamp(17px,4.8vw,19.5px)] font-bold text-[#8aa1ad]">
                {TICKET.usedBtn}
              </button>
              <Button onClick={onHome} className="mt-2">
                {TICKET.home}
              </Button>
            </>
          ) : (
            <>
              <p className="mb-2 text-center text-[clamp(13px,3.72vw,15.5px)] text-mute">{TICKET.staffNote}</p>
              <button
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                onContextMenu={(e) => e.preventDefault()}
                className="relative h-[56px] w-full select-none overflow-hidden rounded-2xl bg-sea text-[clamp(17px,4.8vw,19.5px)] font-bold text-white"
              >
                <span className="absolute inset-y-0 left-0 bg-white/25" style={{ width: holding ? '100%' : '0%', transition: holding ? 'width 0.9s linear' : 'none' }} />
                <span className="relative">{holding ? '길게 눌러 주세요…' : TICKET.staffBtn}</span>
              </button>
              <button onClick={onHome} className="mt-1 h-11 w-full text-[clamp(14.5px,4.1vw,17px)] font-bold text-mute underline underline-offset-4">
                {TICKET.home}
              </button>
            </>
          )}
        </BottomBar>
      </Sheet>

      <AnimatePresence>
        {pinOpen && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-[360px] rounded-3xl bg-white p-6">
              <p className="text-[clamp(20px,5.6vw,24px)] font-bold">{TICKET.pinTitle}</p>
              <p className={`${t15} mt-1 text-mute`}>{TICKET.pinLead}</p>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={(e) => e.key === 'Enter' && confirm()}
                disabled={busy}
                inputMode="numeric"
                enterKeyHint="done"
                type="password"
                autoFocus
                autoComplete="off"
                className="mt-4 h-14 w-full rounded-2xl border-2 border-line text-center text-[24px] tracking-[0.5em] outline-none focus:border-sea"
              />
              {msg && <p className="mt-2 text-[clamp(14.5px,4.1vw,17px)] font-bold text-[#c2410c]">{msg}</p>}
              {busy && <p className="mt-2 text-center text-[clamp(14px,3.97vw,16px)] font-bold text-cyan">지급 처리 중이에요. 몇 초만 기다려 주세요</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setPinOpen(false)} disabled={busy} className="h-12 flex-1 rounded-2xl bg-[#eef2f3] font-bold text-mute disabled:opacity-50">
                  취소
                </button>
                <button
                  onClick={confirm}
                  disabled={pin.length < 4 || busy}
                  className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-sea font-bold text-white ${busy ? '' : 'disabled:bg-[#b9c7cd]'}`}
                >
                  {busy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                      확인 중
                    </>
                  ) : (
                    '지급 완료'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
