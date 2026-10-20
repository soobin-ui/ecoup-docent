import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Mission } from '../content/tour'
import { STAMPS } from '../content/tour'
import { Button, Character, Waves } from './ui'
import { Icon } from './Icons'

/** 미션 상태 — 화면이 아래 버튼('정답 확인')을 직접 그리도록 바깥으로 꺼냄 */
export function useMission(m: Mission, solved: boolean, onCorrect: () => void) {
  const [sel, setSel] = useState<number | null>(solved ? m.answer : null)
  const [wrong, setWrong] = useState(0) // 틀린 횟수(흔들림 재생 키)
  const check = () => {
    if (sel === null) return
    if (sel === m.answer) onCorrect()
    else setWrong((w) => w + 1)
  }
  const pick = (i: number) => {
    if (solved) return
    setSel(i)
  }
  return { sel, pick, wrong, check }
}

export function MissionCard({ m, solved, state }: { m: Mission; solved: boolean; state: ReturnType<typeof useMission> }) {
  const { sel, pick, wrong } = state
  const showHint = wrong > 0 && !solved
  return (
    <section className="mt-6 rounded-3xl border-2 border-dashed p-5" style={{ borderColor: 'var(--water)', background: 'color-mix(in srgb, var(--water) 9%, white)' }}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-extrabold tracking-wider text-white" style={{ background: 'var(--water)' }}>
          MISSION {m.no}
        </span>
        {solved ? (
          <span className="flex items-center gap-1 text-[13px] font-extrabold text-eco">
            <Icon name="check" size={16} /> 해결
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-mute">
            <Icon name="lock" size={15} /> 맞혀야 다음 섹션이 열려요
          </span>
        )}
      </div>
      <p className="mt-3 text-[18px] font-extrabold leading-snug">{m.q}</p>
      <div key={wrong} className={`mt-4 flex flex-col gap-2.5 ${wrong > 0 && !solved ? 'shake' : ''}`}>
        {m.options.map((o, i) => {
          const on = sel === i
          const correct = solved && i === m.answer
          return (
            <button
              key={o}
              onClick={() => pick(i)}
              className={`flex min-h-[54px] items-center gap-3 rounded-2xl border-2 bg-white px-4 text-left text-[16px] transition-colors ${
                correct ? 'border-eco font-extrabold text-ink' : on ? 'border-deep font-extrabold text-ink' : 'border-line text-ink'
              }`}
              aria-pressed={on}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[14px] font-extrabold ${
                  correct ? 'bg-eco text-white' : on ? 'bg-deep text-white' : 'bg-[#eef3f5] text-mute'
                }`}
              >
                {correct ? <Icon name="check" size={16} /> : i + 1}
              </span>
              {o}
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-xl bg-[#fff4e5] px-3.5 py-2.5 text-[14.5px] leading-relaxed text-[#8a4b00]"
          >
            <b>다시 생각해 볼까요?</b> {m.hint}
          </motion.p>
        )}
      </AnimatePresence>
      {solved && <p className="mt-3 text-[14.5px] leading-relaxed text-mute">{m.done}</p>}
    </section>
  )
}

/** 정답! — 화면에 물이 차오르고, 물방울 캐릭터가 한 단계 맑아지며 스탬프 획득 */
export function StampOverlay({ m, onNext, nextLabel }: { m: Mission; onNext: () => void; nextLabel: string }) {
  const before = m.no - 1
  const after = m.no
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #d4f6ff 0%, #8fe2f7 55%, #4cc4ea 100%)' }}
      role="dialog"
      aria-modal
    >
      {/* 차오르는 물 */}
      <motion.div className="pointer-events-none fixed inset-x-0 bottom-0" initial={{ height: '0%' }} animate={{ height: '38%' }} transition={{ duration: 1.4, ease: [0.3, 0.9, 0.3, 1] }}>
        <Waves className="absolute inset-x-0 -top-10 h-12" color="#3db7e4" front="#1a94cf" />
        <div className="absolute inset-x-0 top-0 bottom-0" style={{ background: 'linear-gradient(180deg,#1a94cf,#0b5c90)' }} />
      </motion.div>

      <div className="relative mx-auto flex min-h-full max-w-[440px] flex-col items-center px-6 pt-[clamp(24px,7vh,64px)] pb-8 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="rounded-full bg-sea px-4 py-1.5 text-[13px] font-bold text-white">
          MISSION {m.no} 성공!
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 15, delay: 0.25 }}
          className="title-shadow mt-3 text-[clamp(28px,8.6vw,36px)] font-bold leading-[1.2]"
          style={{ ['--stroke' as never]: '5px' }}
        >
          <span className="stroke-title block text-white">물방울이 한 번 더</span>
          <span className="stroke-title block text-lime">맑아졌어요!</span>
        </motion.h2>

        <div className="relative mt-6 grid h-[min(170px,26vh)] w-[min(170px,26vh)] shrink-0 place-items-center">
          <span className="ripple absolute inset-0 rounded-full border-4 border-white/80" />
          <span className="ripple d2 absolute inset-0 rounded-full border-4 border-white/80" />
          <motion.div className="absolute" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
            <Character level={before} size={150} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: [0, -26, 0, -8, 0] }} transition={{ opacity: { delay: 0.7, duration: 0.6 }, y: { delay: 0.9, duration: 0.9 } }}>
            <Character level={after} size={150} />
          </motion.div>
        </div>

        <div className="relative mt-4 flex gap-3">
          {STAMPS.map((s, i) => {
            const got = i < m.no
            const isNew = i === m.no - 1
            return (
              <motion.div
                key={s}
                initial={isNew ? { scale: 2.4, rotate: -30, opacity: 0 } : false}
                animate={{ scale: 1, rotate: isNew ? -8 : 0, opacity: 1 }}
                transition={{ delay: 1.35, type: 'spring', stiffness: 300, damping: 13 }}
                className={`flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border-[3px] text-[12.5px] font-bold leading-tight ${
                  got ? 'border-sea bg-lime text-sea shadow-[0_4px_0_#0b4a75]' : 'border-dashed border-white bg-white/30 text-sea/50'
                }`}
              >
                {s.split(' ').map((w) => (
                  <span key={w} className="block">
                    {w}
                  </span>
                ))}
              </motion.div>
            )
          })}
        </div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="relative mt-5 rounded-2xl bg-white/95 px-4 py-3 text-[15px] leading-relaxed text-ink shadow-[0_6px_18px_rgba(8,60,100,0.2)]">
          {m.done}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="relative mt-auto w-full pt-6">
          <Button onClick={onNext} breathe>
            {nextLabel}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
