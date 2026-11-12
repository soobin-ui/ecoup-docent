/*
  A · 물의 이해 — 물속 오염물질 5가지를 '돋보기로 찾기'
  확대한 흙탕물 그림(Higgsfield) 위 5곳을 눌러 찾으면 이름표가 붙고, 아래에 설명이 나옴.
  다 찾아야 다음(onAll 로 알림). 찾은 기록은 폰에 저장.
*/
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { A1 } from '../content/tour'
import { Icon } from '../components/Icons'
import { useDraft } from '../lib/draft'
import pic from '../assets/img/a1/pollutants.webp'

/* 그림 속 위치(%, 그림 크기 대비) — A1.pollutants 순서와 같음 */
const SPOTS: { x: number; y: number; color: string }[] = [
  { x: 27, y: 47, color: '#1f6fb2' }, // 부유물질(파랑 — 흙탕물 위에서 잘 보이게)
  { x: 66, y: 46, color: '#e8590c' }, // 유기물(주황)
  { x: 67, y: 20, color: '#2f9e44' }, // 영양염류(초록)
  { x: 29, y: 21, color: '#7c3aed' }, // 화학 오염물질(보라)
  { x: 50, y: 73, color: '#c92a2a' }, // 병원성 미생물(빨강)
]

export function PollutantFinder({ found, setFound }: { found: boolean[]; setFound: (v: boolean[]) => void }) {
  const [sel, setSel] = useState<number | null>(null)
  const n = found.filter(Boolean).length
  const tap = (k: number) => {
    setSel(k)
    if (!found[k]) setFound(found.map((v, j) => v || j === k))
  }
  return (
    <div className="tile mt-4 rounded-3xl px-3 pt-5 pb-4">
      <p className="text-center text-[clamp(17px,4.9vw,20px)] font-bold text-sea">{A1.pollutantsTitle}</p>
      <div className="mt-2.5 flex items-center justify-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-[#e3f1f6] px-3 py-1 text-[13px] font-bold whitespace-nowrap text-sea max-[359px]:px-2 max-[359px]:text-[11.5px]">
          <Icon name="search" size={14} /> 찾은 오염물질 {n} / 5
        </span>
        {n === 5 && (
          <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full bg-lime px-3 py-1 text-[13px] font-bold whitespace-nowrap text-sea max-[359px]:px-2 max-[359px]:text-[11.5px]">
            모두 찾았어요!
          </motion.span>
        )}
      </div>

      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-[#f4fbfe]">
        <img src={pic} alt="확대한 흙탕물 속 오염물질 다섯 가지" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {SPOTS.map((s, k) => {
          const on = found[k]
          return (
            <button
              key={k}
              onClick={() => tap(k)}
              aria-label={on ? A1.pollutants[k].name : `오염물질 ${k + 1} 찾기`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              {on ? (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[clamp(12px,3.45vw,14px)] font-bold whitespace-nowrap text-white shadow-[0_4px_10px_-3px_rgba(8,60,100,0.6)] ring-white ${sel === k ? 'ring-[3px]' : 'ring-2'}`}
                  style={{ background: s.color }}
                >
                  <Icon name="check" size={13} />
                  {A1.pollutants[k].name}
                </motion.span>
              ) : (
                // 보이는 표시는 작게(그림을 덜 가림), 누르는 영역은 44px 그대로
                <span className="relative grid h-11 w-11 place-items-center">
                  <motion.span
                    className="absolute inset-[9px] rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.7], opacity: [0.9, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.25 }}
                  />
                  <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-white/75 text-sea shadow-[0_2px_6px_-2px_rgba(8,60,100,0.6)] ring-[1.5px] ring-sea/80">
                    <Icon name="search" size={14} />
                  </span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 누른 오염물질 설명 */}
      <div className="mt-3">
        <AnimatePresence mode="wait">
          {sel === null ? (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-1 text-center text-[clamp(14.5px,4.1vw,17px)] font-bold text-cyan">
              {n === 5 ? '이름표를 누르면 설명을 다시 볼 수 있어요' : '돋보기를 눌러 물속 오염물질을 찾아보세요'}
            </motion.p>
          ) : (
            <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl px-4 py-3 text-center" style={{ background: `${SPOTS[sel].color}14`, boxShadow: `inset 0 0 0 1.5px ${SPOTS[sel].color}55` }}>
              <p className="text-[clamp(17px,4.75vw,19.5px)] font-bold" style={{ color: SPOTS[sel].color }}>
                {A1.pollutants[sel].name}
              </p>
              <p className="mt-0.5 text-[clamp(15px,4.25vw,17.5px)] leading-snug text-ink">{A1.pollutants[sel].desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** A1 화면에서 쓰는 찾은 기록 */
export function useFound() {
  return useDraft<boolean[]>('a1-found', [false, false, false, false, false])
}
