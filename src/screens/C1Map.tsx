/*
  C · 물의 미래 ① — 깨끗해진 물은 어디까지 활용될까?
  '우리 마을 물 지도': 물 종류를 고르면 가운데 정수장에서 쓰이는 곳까지 물길이 뻗고 이름표가 붙음.
  세 가지 물을 다 눌러 봐야 다음. 그림: Higgsfield 마을 디오라마(src/assets/img/c1/town.webp)
*/
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { C1 } from '../content/tour'
import { BottomBar, Button, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import { useDraft } from '../lib/draft'
import town from '../assets/img/c1/town.webp'

/* 그림 속 장소 위치(%) */
type Place = 'home' | 'river' | 'farm' | 'park' | 'factory' | 'road' | 'fab'
const PLANT = { x: 48.9, y: 45 }
const PLACES: Record<Place, { x: number; y: number }> = {
  home: { x: 20.2, y: 14 },
  river: { x: 50, y: 16.5 },
  farm: { x: 78.7, y: 16.5 },
  park: { x: 17, y: 45 },
  factory: { x: 80.9, y: 42.5 },
  road: { x: 19.1, y: 76 },
  fab: { x: 81.9, y: 72.5 },
}
/* 쓰임 → 장소 (C1.uses 순서와 같음) */
const WHERE: Place[][] = [
  ['home', 'farm', 'factory', 'river'],
  ['park', 'home', 'road', 'factory'],
  ['factory', 'factory', 'factory', 'fab'],
]
const SRC_COLOR = ['#2f8fb5', '#9a8a63', '#7b8794'] // B2 세 종류의 물과 같은 색
const FLOW = '#00add0'

export function C1Screen({ onNext }: { onNext: () => void }) {
  const [src, setSrc] = useState<number | null>(null)
  const [seen, setSeen] = useDraft<boolean[]>('c1-src', [false, false, false])
  const n = seen.filter(Boolean).length
  const pick = (k: number) => {
    setSrc(k)
    if (!seen[k]) setSeen(seen.map((v, j) => v || j === k))
  }
  // 고른 물이 가는 장소별 쓰임 묶기
  const byPlace = new Map<Place, string[]>()
  if (src !== null) C1.uses[src].to.forEach((t, i) => byPlace.set(WHERE[src][i], [...(byPlace.get(WHERE[src][i]) ?? []), t]))

  return (
    <>
      <Hero eyebrow={C1.eyebrow} title={C1.title} lead={C1.lead} />
      <Sheet>
        <p className="text-center text-[clamp(17px,4.9vw,20px)] font-bold text-sea">우리 마을 물 지도</p>
        <p className="mt-1 text-center text-[clamp(13.5px,3.85vw,16px)] font-bold text-cyan">물을 골라 정화한 물이 어디로 가는지 보세요</p>

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {C1.uses.map((u, k) => (
            <button
              key={u.from}
              onClick={() => pick(k)}
              className={`flex items-center justify-center gap-1 rounded-2xl px-1 py-2.5 text-[clamp(14px,3.97vw,16px)] font-bold ${k === src ? 'text-white' : 'bg-[#eef4f7] text-sea'}`}
              style={k === src ? { background: SRC_COLOR[k] } : undefined}
            >
              {seen[k] && k !== src && <Icon name="check" size={14} />}
              {u.from}
            </button>
          ))}
        </div>

        <div className="relative mt-3 aspect-[47/40] w-full overflow-hidden rounded-3xl bg-[#f4fbfe] ring-1 ring-[#c3dde8]">
          <img src={town} alt="정수장을 가운데 둔 마을 — 집, 강, 논밭, 공원, 공장, 도로, 반도체 공장" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          {/* 물길 */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <AnimatePresence>
              {src !== null &&
                [...byPlace.keys()].map((p, i) => {
                  const to = PLACES[p]
                  const mx = (PLANT.x + to.x) / 2 + (to.y - PLANT.y) * 0.15
                  const my = (PLANT.y + to.y) / 2 - (to.x - PLANT.x) * 0.15
                  const d = `M${PLANT.x} ${PLANT.y} Q${mx} ${my} ${to.x} ${to.y}`
                  return (
                    <g key={`${src}-${p}`}>
                      <motion.path d={d} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: i * 0.15 }} />
                      <motion.path d={d} fill="none" stroke={FLOW} strokeWidth={1.8} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: i * 0.15 }} />
                      <path d={d} fill="none" stroke="#fff" strokeWidth={0.9} strokeLinecap="round" strokeDasharray="1.5 3.5" className="flow-dash" style={{ animationDelay: `${0.6 + i * 0.15}s` }} />
                    </g>
                  )
                })}
            </AnimatePresence>
            <circle cx={PLANT.x} cy={PLANT.y} r={2.4} fill={FLOW} stroke="#fff" strokeWidth={1} />
          </svg>
          {/* 이름표 */}
          <AnimatePresence>
            {src !== null &&
              [...byPlace.entries()].map(([p, names], i) => (
                <motion.span
                  key={`${src}-${p}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.45 + i * 0.15 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-2.5 py-1 text-center text-[clamp(11.5px,3.3vw,13.5px)] leading-tight font-bold text-sea shadow-[0_4px_10px_-3px_rgba(8,60,100,0.55)] ring-2"
                  style={{ left: `${PLACES[p].x}%`, top: `${PLACES[p].y}%`, ['--tw-ring-color' as string]: FLOW }}
                >
                  {names.map((t) => (
                    <span key={t} className="block whitespace-nowrap">
                      {t}
                    </span>
                  ))}
                </motion.span>
              ))}
          </AnimatePresence>
          {src === null && (
            <span className="absolute top-[56%] left-[49%] -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[12.5px] font-bold whitespace-nowrap text-sea shadow">정수장</span>
          )}
        </div>

        {/* 고른 물 한 줄 정리 */}
        <div className="mt-3 text-center">
          <AnimatePresence mode="wait">
            {src === null ? (
              <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[clamp(14.5px,4.1vw,17px)] font-bold text-cyan">
                위에서 물을 하나 골라 보세요
              </motion.p>
            ) : (
              <motion.p key={src} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[clamp(15px,4.25vw,17.5px)] leading-snug font-bold text-ink">
                <span style={{ color: SRC_COLOR[src] }}>{C1.uses[src].from}</span>도 깨끗하게 정화하면
                <br />
                <span className="text-cyan">{C1.uses[src].to.length}곳</span>에 다시 쓸 수 있어요
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <BottomBar>
          {n < 3 && (
            <p className="mx-auto mb-2 flex w-fit items-center justify-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-center text-[clamp(12.5px,3.6vw,14.5px)] font-bold text-sea shadow-[0_4px_12px_-6px_rgba(8,60,100,0.45)] ring-1 ring-[#c3dde8]">
              <Icon name="lock" size={15} />세 가지 물을 모두 눌러 보면 넘어가요 ({n}/3)
            </p>
          )}
          <Button onClick={onNext} disabled={n < 3}>
            {C1.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}
