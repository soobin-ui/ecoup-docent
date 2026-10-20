import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MISSIONS, S1, S1B, S2, S3 } from '../content/tour'
import { BottomBar, Button, Card, ImageSlot, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import { MissionCard, StampOverlay, useMission } from '../components/Mission'

type MissionProps = { solved: boolean; onSolve: () => void; onNext: () => void }

/** 아래 버튼: 고르기 전엔 미션으로 스크롤, 고르면 정답 확인, 풀었으면 다음으로 */
function MissionBar({ solved, state, missionRef, nextLabel, onNext, no }: {
  solved: boolean
  state: ReturnType<typeof useMission>
  missionRef: React.RefObject<HTMLDivElement | null>
  nextLabel: string
  onNext: () => void
  no: number
}) {
  if (solved) return <Button onClick={onNext}>{nextLabel}</Button>
  if (state.sel === null)
    return (
      <Button
        variant="outline"
        onClick={() => {
          const el = missionRef.current
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' })
        }}
      >
        <Icon name="lock" size={18} /> MISSION {no} 풀기
      </Button>
    )
  return <Button onClick={state.check}>정답 확인</Button>
}

/* ── 03-1 물의 이해 ───────────────────────────────── */

function Jar({ color, specks }: { color: string; specks: number }) {
  const dots = [
    [30, 70, 3.2],
    [52, 84, 2.6],
    [44, 62, 2],
    [62, 72, 2.4],
    [36, 90, 2],
    [58, 96, 3],
  ].slice(0, specks)
  return (
    <svg width="84" height="112" viewBox="0 0 90 120" aria-hidden>
      <rect x="8" y="8" width="74" height="104" rx="16" fill="#fff" stroke="#10303e" strokeWidth="6" />
      <motion.path
        animate={{ fill: color }}
        transition={{ duration: 0.5 }}
        d="M11 44 Q28 38 45 44 T79 44 V100 a9 9 0 0 1-9 9 H20 a9 9 0 0 1-9-9z"
      />
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#10303e" opacity="0.45" />
      ))}
    </svg>
  )
}

export function Section1Screen({ onNext }: { onNext: () => void }) {
  const [tab, setTab] = useState(0)
  const t = S1.tabs[tab]
  return (
    <>
      <Hero eyebrow={S1.eyebrow} title={S1.title} lead={S1.lead} />
      <Sheet>
      <div className="mt-5 grid grid-cols-3 gap-2" role="tablist">
        {S1.tabs.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`h-12 rounded-2xl text-[15.5px] font-extrabold transition-colors ${tab === i ? 'bg-deep text-white' : 'bg-white text-mute'}`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <Card className="mt-3">
        <AnimatePresence mode="wait">
          <motion.div key={t.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-4">
              <Jar color={t.color} specks={tab === 0 ? 3 : tab === 1 ? 5 : 6} />
              <div>
                <p className="text-[24px] font-extrabold">{t.name}</p>
                <p className="mt-0.5 text-[14.5px] text-mute">{t.sub}</p>
              </div>
            </div>
            <p className="mt-4 text-[16px] leading-[1.65]">{t.body}</p>
            <p className="mt-4 text-[14px] font-extrabold text-deep">{S1.hasLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.has.map((h) => (
                <span key={h} className="rounded-full border border-line px-3 py-1.5 text-[14.5px]">
                  {h}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[13.5px] text-mute">예) {t.ex}</p>
          </motion.div>
        </AnimatePresence>
      </Card>
      <BottomBar>
        <Button onClick={onNext}>{S1.cta}</Button>
      </BottomBar>
      </Sheet>
    </>
  )
}

/* ── 03-2 물속 오염물질 + 미션 1 ───────────────────── */
export function Section1MissionScreen({ solved, onSolve, onNext }: MissionProps) {
  const m = MISSIONS[0]
  const [overlay, setOverlay] = useState(false)
  const state = useMission(m, solved, () => {
    onSolve()
    setOverlay(true)
  })
  const ref = useRef<HTMLDivElement>(null)
  return (
    <>
      <Hero eyebrow={S1B.eyebrow} title={S1B.title} />
      <Sheet>
      <div className="mt-5 flex flex-col gap-2">
        {S1B.items.map((it, i) => (
          <motion.div
            key={it.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i }}
            className="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3"
          >
            <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: it.color }} />
            <div>
              <p className="text-[16.5px] font-extrabold">{it.name}</p>
              <p className="mt-0.5 text-[14px] text-mute">
                {it.desc} · {it.ex}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      <div ref={ref}>
        <MissionCard m={m} solved={solved} state={state} />
      </div>
      <BottomBar>
        <MissionBar solved={solved} state={state} missionRef={ref} nextLabel="다음 섹션: 물의 변화" onNext={onNext} no={1} />
      </BottomBar>
      </Sheet>
      {overlay && <StampOverlay m={m} nextLabel="섹션 2로 이동" onNext={onNext} />}
    </>
  )
}

/* ── 04 물의 변화 + 미션 2 ─────────────────────────── */
const STEP_ICONS = ['filter', 'floc', 'microbe', 'membrane']
export function Section2Screen({ solved, onSolve, onNext }: MissionProps) {
  const m = MISSIONS[1]
  const [open, setOpen] = useState<number | null>(0)
  const [overlay, setOverlay] = useState(false)
  const state = useMission(m, solved, () => {
    onSolve()
    setOverlay(true)
  })
  const ref = useRef<HTMLDivElement>(null)
  return (
    <>
      <Hero eyebrow={S2.eyebrow} title={S2.title} lead={S2.lead} />
      <Sheet>
      <ImageSlot label="LED 처리 과정 흐름" className="mt-5 h-[170px]">
        <div className="flex items-center gap-1.5 text-white">
          {STEP_ICONS.map((ic, i) => (
            <span key={ic} className="flex items-center gap-1.5">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${open === i ? 'bg-white text-deep' : 'bg-white/25'}`}>
                <Icon name={ic} size={22} />
              </span>
              {i < 3 && <span className="text-white/80">›</span>}
            </span>
          ))}
        </div>
      </ImageSlot>
      <div className="mt-4 flex flex-col gap-2.5">
        {S2.steps.map((s, i) => {
          const on = open === i
          return (
            <button
              key={s.title}
              onClick={() => setOpen(on ? null : i)}
              className={`rounded-3xl border bg-white p-4 text-left transition-colors ${on ? 'border-deep' : 'border-line'}`}
              aria-expanded={on}
            >
              <div className="flex items-center gap-3.5">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${on ? 'bg-deep text-white' : 'bg-[#e8f4f7] text-deep'}`}>
                  <Icon name={STEP_ICONS[i]} size={24} />
                </span>
                <div className="flex-1">
                  <p className="text-[12.5px] font-extrabold text-mute">
                    {i + 1}단계 · {s.tag}
                  </p>
                  <p className="text-[17px] font-extrabold">{s.title}</p>
                </div>
                <motion.span animate={{ rotate: on ? 180 : 0 }} className="text-mute">
                  <Icon name="chevron" size={20} />
                </motion.span>
              </div>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden text-[15.5px] leading-[1.65]"
                  >
                    <span className="block pt-3">{s.body}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>
      <div ref={ref}>
        <MissionCard m={m} solved={solved} state={state} />
      </div>
      <BottomBar>
        <MissionBar solved={solved} state={state} missionRef={ref} nextLabel="다음 섹션: 물의 미래" onNext={onNext} no={2} />
      </BottomBar>
      </Sheet>
      {overlay && <StampOverlay m={m} nextLabel="섹션 3으로 이동" onNext={onNext} />}
    </>
  )
}

/* ── 05 물의 미래 + 미션 3 ─────────────────────────── */
export function Section3Screen({ solved, onSolve, onNext }: MissionProps) {
  const m = MISSIONS[2]
  const [pop, setPop] = useState<number | null>(null)
  const [overlay, setOverlay] = useState(false)
  const state = useMission(m, solved, () => {
    onSolve()
    setOverlay(true)
  })
  const ref = useRef<HTMLDivElement>(null)
  return (
    <>
      <Hero eyebrow={S3.eyebrow} title={S3.title} lead={S3.lead} />
      <Sheet>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {S3.tiles.map((t, i) => (
          <button key={t.id} onClick={() => setPop(i)} className="text-left">
            <ImageSlot label={t.name} className="aspect-[1/0.9]">
              <span className="flex flex-col items-center gap-2 text-white">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/25">
                  <Icon name={t.id} size={30} />
                </span>
                <span className="text-[16px] font-extrabold drop-shadow">{t.name}</span>
              </span>
            </ImageSlot>
          </button>
        ))}
      </div>
      <div ref={ref}>
        <MissionCard m={m} solved={solved} state={state} />
      </div>
      <BottomBar>
        <MissionBar solved={solved} state={state} missionRef={ref} nextLabel="투어 완료!" onNext={onNext} no={3} />
      </BottomBar>
      </Sheet>

      <AnimatePresence>
        {pop !== null && (
          <motion.div className="fixed inset-0 z-40 flex items-end bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPop(null)}>
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              className="mx-auto w-full max-w-[480px] rounded-t-[28px] bg-white px-6 pt-6 pb-[max(24px,env(safe-area-inset-bottom))]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-deep text-white">
                  <Icon name={S3.tiles[pop].id} size={26} />
                </span>
                <p className="text-[21px] font-extrabold">{S3.tiles[pop].name}</p>
              </div>
              <p className="mt-4 text-[16.5px] leading-[1.65]">{S3.tiles[pop].desc}</p>
              <Button className="mt-6" variant="outline" onClick={() => setPop(null)}>
                닫기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {overlay && <StampOverlay m={m} nextLabel="완료 화면 보기" onNext={onNext} />}
    </>
  )
}
