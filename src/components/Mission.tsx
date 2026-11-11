import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Riddle } from '../content/tour'
import { RIDDLE_UI, STAMPS } from '../content/tour'
import { BottomBar, Button, Character, Hero, Sheet } from './ui'
import { useDraft } from '../lib/draft'
import { Icon } from './Icons'

/* 그림 글자(Twemoji, CC-BY 4.0 — 그림이 기종마다 달라지거나 깨지지 않게 파일로 담음) */
const EMOJI = import.meta.glob('../assets/emoji/*.svg', { eager: true, import: 'default' }) as Record<string, string>
const emojiSrc = (code: string) => EMOJI[`../assets/emoji/${code}.svg`]

const norm = (s: string) => s.replace(/\s+/g, '').trim()

/* ── 스탬프 판(3칸) ──────────────────────────── */
export function StampBoard({ got, fresh = -1, showHow = false }: { got: boolean[]; fresh?: number; showHow?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STAMPS.map((s, i) => (
        <div key={s.id} className="flex flex-col items-center text-center">
          <motion.div
            initial={i === fresh ? { scale: 2.4, rotate: -30, opacity: 0 } : false}
            animate={{ scale: 1, rotate: got[i] ? -8 : 0, opacity: 1 }}
            transition={{ delay: i === fresh ? 0.5 : 0, type: 'spring', stiffness: 300, damping: 13 }}
            className={`grid aspect-square w-full max-w-[96px] place-items-center rounded-full border-[3px] ${
              got[i] ? 'border-sea bg-lime shadow-[0_4px_0_#0b4a75]' : 'border-dashed border-[#9cc9da] bg-white/70'
            }`}
          >
            <span className={`text-[clamp(13px,3.6vw,15.5px)] font-bold tracking-wider ${got[i] ? 'text-sea' : 'text-[#8fb3c2]'}`}>{got[i] ? 'CLEAR' : 'STAMP'}</span>
          </motion.div>
          <p className="mt-2 text-[clamp(14.5px,4.1vw,17px)] font-bold text-ink">{s.name}</p>
          {showHow && <p className="mt-1 text-[clamp(12.5px,3.5vw,14.5px)] leading-snug text-mute">{s.how}</p>}
        </div>
      ))}
    </div>
  )
}

/* ── 암호 풀기 화면 — 맞혀야만 다음으로 ─────────────── */
export function RiddleScreen({ r, solved, onSolve, onNext }: { r: Riddle; solved: boolean; onSolve: () => void; onNext: () => void }) {
  const [draft, setVal] = useDraft(`q${r.no}`, '')
  const val = solved ? r.answer : draft
  const [wrong, setWrong] = useState(0)
  const [overlay, setOverlay] = useState(false)
  const chars = Array.from(norm(val))
  const n = r.answer.length

  const check = () => {
    if (norm(val) === r.answer) {
      onSolve()
      setOverlay(true)
    } else setWrong((w) => w + 1)
  }

  return (
    <>
      <Hero eyebrow={`${r.section} · 암호 해독`} title={RIDDLE_UI.title} lead={RIDDLE_UI.lead} />
      <Sheet>
        <section className="rounded-3xl border-[3px] border-sea bg-[#fff6d6] px-4 pt-4 pb-5 text-center shadow-[0_6px_0_rgba(11,74,117,0.25)]">
          <span className="inline-block rounded-full border-2 border-sea bg-white px-4 py-1 text-[clamp(16px,4.5vw,18.5px)] font-bold text-sea">문제 {String(r.no).padStart(2, '0')}</span>
          <div className="mt-4 flex items-center justify-center gap-[min(18px,4vw)]">
            {r.emojis.map((e, i) => (
              <motion.img
                key={e}
                src={emojiSrc(e)}
                alt={r.emojiAlt[i]}
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 260, damping: 14 }}
                className="h-[clamp(56px,17vw,78px)] w-[clamp(56px,17vw,78px)]"
              />
            ))}
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[clamp(16px,4.5vw,18.5px)] font-bold text-[#d9363e]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d9363e]" /> {r.how}
          </p>
          <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2.5 text-[clamp(14.5px,4.1vw,17px)] font-bold text-ink">힌트 · {r.hint}</p>
        </section>

        <p className="mt-5 text-center text-[clamp(15px,4.23vw,17.5px)] font-bold text-mute">{RIDDLE_UI.input}</p>
        {/* 칸 모양 입력 — 위에 투명한 입력창을 겹쳐 한글 조합 입력이 그대로 됨 */}
        <div key={wrong} className={`relative mx-auto mt-2 w-fit ${wrong > 0 ? 'shake' : ''}`}>
          <div className="flex gap-2.5">
            {Array.from({ length: n }, (_, i) => (
              <span
                key={i}
                className={`grid h-[clamp(56px,16vw,68px)] w-[clamp(56px,16vw,68px)] place-items-center rounded-2xl border-[3px] bg-white text-[clamp(28px,8vw,34px)] font-bold ${
                  solved ? 'border-eco text-eco' : chars[i] ? 'border-sea text-ink' : 'border-[#9cc9da] text-ink'
                }`}
              >
                {chars[i] ?? ''}
              </span>
            ))}
          </div>
          {!solved && (
            <input
              value={val}
              onChange={(e) => setVal(e.target.value.slice(0, n + 2))}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              aria-label={RIDDLE_UI.input}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="absolute inset-0 h-full w-full cursor-text rounded-2xl bg-transparent text-transparent caret-transparent outline-none"
            />
          )}
        </div>
        <AnimatePresence>
          {wrong > 0 && !solved && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center text-[clamp(15px,4.23vw,17.5px)] font-bold text-[#c2410c]">
              {RIDDLE_UI.wrong}
            </motion.p>
          )}
        </AnimatePresence>
        {solved && <p className="mt-3 text-center text-[clamp(15px,4.23vw,17.5px)] leading-relaxed text-mute">{r.done}</p>}

        <BottomBar>
          {solved ? (
            <Button onClick={onNext}>다음</Button>
          ) : (
            <>
              <Button onClick={check} disabled={chars.length < n}>
                {RIDDLE_UI.check}
              </Button>
              <p className="mt-2 flex items-center justify-center gap-1 text-[clamp(13px,3.72vw,15.5px)] text-mute">
                <Icon name="lock" size={15} /> {RIDDLE_UI.lock}
              </p>
            </>
          )}
        </BottomBar>
      </Sheet>
      {overlay && <CorrectOverlay r={r} onNext={onNext} />}
    </>
  )
}

/* ── 정답! — 물이 차오르고 물방울 캐릭터가 한 단계 맑아짐 ── */
function CorrectOverlay({ r, onNext }: { r: Riddle; onNext: () => void }) {
  const before = r.no - 1
  const after = r.no
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overlay-sky fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal>
      <motion.div className="pointer-events-none fixed inset-x-0 bottom-0" initial={{ height: '0%' }} animate={{ height: '38%' }} transition={{ duration: 1.4, ease: [0.3, 0.9, 0.3, 1] }}>
        <div className="absolute inset-x-0 -top-[45%] bottom-0" style={{ background: 'linear-gradient(180deg, rgba(76,196,234,0) 0%, rgba(61,183,228,.45) 28%, #2aa8e0 55%, #1d93cf 100%)' }} />
      </motion.div>
      <div className="relative mx-auto flex min-h-full max-w-[440px] flex-col items-center px-6 pt-[clamp(24px,7vh,64px)] pb-8 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="rounded-full bg-sea px-4 py-1.5 text-[clamp(13.5px,3.85vw,16px)] font-bold text-white">
          암호 {r.no} / 3 해독!
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 15, delay: 0.25 }}
          className="title-shadow mt-3 text-[clamp(26px,7.8vw,34px)] font-bold leading-[1.22]"
          style={{ ['--stroke' as never]: '5px' }}
        >
          <span className="stroke-title block text-white">{r.cheer[0]}</span>
          <span className="stroke-title block text-lime">{r.cheer[1]}</span>
        </motion.h2>
        <div className="relative mt-6 grid h-[min(170px,26vh)] w-[min(170px,26vh)] shrink-0 place-items-center">
          <span className="ripple absolute inset-0 rounded-full border-4 border-white/80" />
          <span className="ripple d2 absolute inset-0 rounded-full border-4 border-white/80" />
          <motion.div className="absolute" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
            <Character level={before} size={150} />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, -26, 0, -8, 0] }} transition={{ opacity: { delay: 0.7, duration: 0.6 }, y: { delay: 0.9, duration: 0.9 } }}>
            <Character level={after} size={150} />
          </motion.div>
        </div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="relative mt-5 rounded-2xl bg-white/95 px-4 py-3 text-[clamp(15.5px,4.36vw,18px)] leading-relaxed text-ink shadow-[0_6px_18px_rgba(8,60,100,0.2)]">
          {r.done}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="relative mt-auto w-full pt-6">
          <Button onClick={onNext} breathe>
            {r.no < 3 ? '다음 전시 보러 가기' : '전시 투어 스탬프 받기'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
