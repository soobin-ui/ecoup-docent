/*
  B · 물의 변화 ① — 더러워진 물은 어떻게 깨끗해질까?
  물리적 처리 / 화학적 처리 카드 2장 → 누르면 단계별 3D 그림(관람객이 직접 넘김)
  그림: Higgsfield(GPT Image 2.6)로 만든 정수장 단면도 9장, src/assets/img/b1
*/
import { useEffect, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { B1 } from '../content/tour'
import { Character, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import { useDraft } from '../lib/draft'
import step1 from '../assets/img/b1/step1.webp'
import step2 from '../assets/img/b1/step2.webp'
import step3 from '../assets/img/b1/step3.webp'
import step4 from '../assets/img/b1/step4.webp'
import step5 from '../assets/img/b1/step5.webp'
import step6 from '../assets/img/b1/step6.webp'
import step7 from '../assets/img/b1/step7.webp'
import step8 from '../assets/img/b1/step8.webp'
import step9 from '../assets/img/b1/step9.webp'

const ZOOM = 3.8 // 단계가 열릴 때 그림이 천천히 다가가는 시간(초)

/* box = 그림 안에서 짚어 줄 곳 [x, y, 폭, 높이] (그림 크기 대비 비율), tag = 그 위 이름표 */
type Pic = { src: string; box: [number, number, number, number]; tag: string; alt: string }
const PICS: Pic[][] = [
  [
    { src: step1, box: [0.34, 0.45, 0.25, 0.37], tag: '거름망', alt: '거름망에 나뭇잎·캔·페트병이 걸린 모습' },
    { src: step2, box: [0.11, 0.57, 0.74, 0.19], tag: '가라앉은 입자', alt: '무거운 모래·찌꺼기가 바닥에 가라앉고 긁개가 모으는 모습' },
    { src: step3, box: [0.13, 0.42, 0.68, 0.28], tag: '모래·자갈 필터', alt: '물이 모래와 자갈 층을 지나며 걸러지는 모습' },
    { src: step4, box: [0.13, 0.35, 0.71, 0.12], tag: '떠오른 찌꺼기', alt: '공기방울이 찌꺼기를 수면으로 띄우고 걷어내는 모습' },
    { src: step5, box: [0.25, 0.42, 0.4, 0.38], tag: '분리막', alt: '하얀 섬유 분리막을 지나 맑은 물이 나가는 모습' },
  ],
  [
    { src: step6, box: [0.505, 0.49, 0.38, 0.35], tag: '뭉쳐 가라앉는 먼지', alt: '약품을 넣어 작은 먼지가 덩어리로 뭉쳐 가라앉는 모습' },
    { src: step7, box: [0.72, 0.16, 0.13, 0.18], tag: 'pH 계측기', alt: '붉은 산성 물에 약품을 넣어 중성의 맑은 물로 맞추는 모습' },
    { src: step8, box: [0.35, 0.46, 0.43, 0.25], tag: '뭉쳐 가라앉는 인', alt: '녹조를 일으키는 인을 뭉쳐 가라앉혀 물이 맑아지는 모습' },
    { src: step9, box: [0.31, 0.44, 0.34, 0.27], tag: '자외선 램프·오존', alt: '짙은 물속 잘 안 썩는 물질을 자외선과 오존으로 줄이는 모습' },
  ],
]
const CARD = [
  { icon: 'filter', color: '#9a8a63' },
  { icon: 'floc', color: '#0e9fb8' },
]

/** 그림을 모두 겹쳐 두고 지금 단계만 보이게(바뀔 때 빈 화면 없이 서서히 전환) + 짚어 주는 표시 */
function PicStack({ g, i, tick }: { g: number; i: number; tick: number }) {
  const list = PICS[g]
  const [x, y, w, h] = list[i].box
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-[#f4fbfe]">
      {list.map((a, k) => {
        const [bx, by, bw, bh] = a.box
        return (
          <motion.img
            key={a.src}
            src={a.src}
            alt={k === i ? a.alt : ''}
            aria-hidden={k !== i}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transformOrigin: `${(bx + bw / 2) * 100}% ${(by + bh / 2) * 100}%` }}
            initial={k === i ? 'on' : 'off'}
            animate={k === i ? 'on' : 'off'}
            variants={{
              on: { opacity: 1, scale: 1.12, transition: { opacity: { duration: 0.45 }, scale: { duration: ZOOM, ease: 'easeInOut' } } },
              off: { opacity: 0, scale: 1, transition: { opacity: { duration: 0.45 }, scale: { delay: 0.5, duration: 0 } } },
            }}
          />
        )
      })}
      <motion.div
        key={`box-${g}-${i}-${tick}`}
        className="pointer-events-none absolute rounded-xl border-[2.5px] border-dashed border-white shadow-[0_0_0_2px_rgba(11,74,117,0.55)]"
        style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1.08 }}
        transition={{ delay: ZOOM * 0.35, duration: 0.5 }}
      />
      <motion.span
        key={`tag-${g}-${i}-${tick}`}
        className="pointer-events-none absolute -translate-x-1/2 rounded-full bg-sea px-2.5 py-1 text-[13px] font-bold whitespace-nowrap text-white"
        style={{ left: `${(x + w / 2) * 100}%`, top: `max(4px, calc(${y * 100}% - 34px))` }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ZOOM * 0.4, duration: 0.4 }}
      >
        {list[i].tag}
      </motion.span>
      <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-bold text-sea">
        물 흐름 <Icon name="arrow" size={14} />
      </span>
    </div>
  )
}

export function B1Screen({ onNext }: { onNext: () => void }) {
  const [g, setG] = useState<number | null>(null)
  const [i, setI] = useState(0)
  // 끝까지 본 카드 — 폰에 저장(새로고침·뒤로 갔다 와도 다시 안 봐도 되게)
  const [seen, setSeen] = useDraft<boolean[]>('b1-seen', [false, false])
  const [tick, setTick] = useState(0) // 같은 단계를 다시 눌러도 표시가 다시 나오게
  const [dir, setDir] = useState(1)
  const [sx, setSx] = useState<number | null>(null)
  const groups = B1.groups
  const n = g === null ? 0 : groups[g].items.length
  const last = g !== null && i === n - 1
  const other = g === 0 ? 1 : 0
  const both = seen[0] && seen[1] // 물리·화학 둘 다 끝까지 봄

  // 마지막 단계까지 보면 카드에 체크
  useEffect(() => {
    if (g !== null && i === n - 1) setSeen((s) => s.map((v, k) => v || k === g))
  }, [g, i, n])

  // 카드를 열면 그 카드의 그림을 미리 받아 둠(다음 단계로 넘어갈 때 빈 화면 없게)
  useEffect(() => {
    if (g === null) return
    for (const x of PICS[g]) new Image().src = x.src
  }, [g])

  const open = (k: number) => {
    setG(k)
    setI(0)
    setTick((t) => t + 1)
    // 펼친 그림이 화면 아래에 숨지 않게 그림 쪽으로 스크롤
    setTimeout(() => document.getElementById('b1-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350)
  }
  const goto = (k: number) => {
    if (g === null || k < 0 || k >= n) return
    setDir(k > i ? 1 : -1)
    setI(k)
    setTick((t) => t + 1)
  }
  // 그림을 좌우로 밀어서 넘기기
  const swipe = {
    onPointerDown: (e: RPointerEvent) => setSx(e.clientX),
    onPointerUp: (e: RPointerEvent) => {
      if (sx === null) return
      const dx = e.clientX - sx
      setSx(null)
      if (dx < -45) goto(i + 1)
      else if (dx > 45) goto(i - 1)
    },
    onPointerCancel: () => setSx(null),
  }

  return (
    <>
      <Hero eyebrow={B1.eyebrow} title={B1.title} />
      <Sheet>
        <div className="grid grid-cols-2 gap-2.5">
          {groups.map((x, k) => {
            const on = g === k
            return (
              <button
                key={x.title}
                onClick={() => open(k)}
                className={`relative flex flex-col items-center rounded-3xl px-2 pt-4 pb-3.5 text-center transition ${on ? 'bg-[#e6f6fb] ring-[3px] ring-sea' : 'tile'} ${g !== null && !on ? 'opacity-70' : ''}`}
              >
                {seen[k] && (
                  <span className="absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full bg-sea text-white">
                    <Icon name="check" size={15} />
                  </span>
                )}
                <span className="grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: CARD[k].color }}>
                  <Icon name={CARD[k].icon} size={30} />
                </span>
                <span className="mt-2.5 text-[clamp(17px,4.9vw,20px)] font-bold text-ink">{x.title}</span>
                <span className="mt-0.5 text-[clamp(12.5px,3.6vw,15px)] leading-snug text-mute">{x.sub}</span>
                <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[12.5px] font-bold ${on ? 'bg-sea text-white' : 'bg-[#e3f1f6] text-sea'}`}>{x.items.length}단계 보기</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {g === null && both ? (
            <motion.div key="go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
              <button onClick={onNext} className="cta flex h-14 w-full items-center justify-center gap-1 rounded-2xl text-[17px] font-bold">
                다음으로 가기 <Icon name="back" size={18} className="rotate-180" />
              </button>
            </motion.div>
          ) : g === null ? (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 flex items-center justify-center gap-2">
              <Character level={1} size={52} />
              <p className="rounded-3xl rounded-bl-md bg-white px-4 py-3 text-[clamp(14.5px,4.1vw,17px)] font-bold text-sea shadow-[0_6px_16px_-10px_rgba(8,60,100,0.5)] ring-1 ring-[#c3dde8]">
                궁금한 처리 방법을 눌러 보세요
              </p>
            </motion.div>
          ) : (
            <motion.div key={g} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} id="b1-stage" className="tile mt-3 scroll-mt-16 rounded-3xl p-3">
              {/* 단계 버튼: 1. 스크리닝 · 2. 침전 … */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {groups[g].items.map((x, k) => (
                  <button
                    key={x.k}
                    onClick={() => goto(k)}
                    className={`rounded-full px-3 py-1.5 text-[clamp(13px,3.7vw,15px)] font-bold ${k === i ? 'bg-sea text-white' : k < i ? 'bg-[#d6eef6] text-sea' : 'bg-[#eef4f7] text-mute'}`}
                  >
                    {k + 1}. {x.k}
                  </button>
                ))}
              </div>

              <div className="mt-3 touch-pan-y overflow-hidden rounded-2xl bg-[#f4fbfe] select-none" {...swipe}>
                <PicStack key={g} g={g} i={i} tick={tick} />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${g}-${i}`} initial={{ opacity: 0, x: dir * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -16 }} transition={{ duration: 0.2 }} className="mt-3 px-1">
                  <p className="text-[13px] font-bold text-cyan">
                    {i + 1} / {n}
                  </p>
                  <p className="text-[clamp(20px,5.6vw,24px)] font-bold text-ink">{groups[g].items[i].k}</p>
                  <p className="mt-0.5 text-[clamp(15px,4.25vw,17.5px)] leading-snug text-mute">{groups[g].items[i].v}</p>
                </motion.div>
              </AnimatePresence>

              {/* 이전 · 다음 단계 */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => goto(i - 1)}
                  disabled={i === 0}
                  className="flex h-12 items-center justify-center gap-1 rounded-2xl border-2 border-sea px-4 text-[15px] font-bold text-sea disabled:border-[#c9dbe3] disabled:text-[#a9bfca]"
                >
                  <Icon name="back" size={18} /> 이전
                </button>
                {!last ? (
                  <button onClick={() => goto(i + 1)} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-2xl bg-sea text-[16px] font-bold text-white">
                    다음 단계 <Icon name="back" size={18} className="rotate-180" />
                  </button>
                ) : both ? (
                  <button onClick={onNext} className="cta flex h-12 flex-1 items-center justify-center gap-1 rounded-2xl text-[16px] font-bold">
                    다음으로 가기 <Icon name="back" size={18} className="rotate-180" />
                  </button>
                ) : (
                  <button onClick={() => open(other)} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-2xl bg-cyan text-[16px] font-bold text-white">
                    {groups[other].title} 보기 <Icon name="back" size={18} className="rotate-180" />
                  </button>
                )}
              </div>
              {/* 두 카드를 모두 끝까지 봐야 다음 화면으로 (사용자 결정 — 아래 '다음' 버튼 없음) */}
              {last && !both && <p className="mt-2 text-center text-[14px] font-bold text-sea">{groups[other].title}까지 보면 다음으로 넘어갈 수 있어요</p>}
              {i === 0 && <p className="mt-2 text-center text-[13px] text-mute">그림을 옆으로 밀어도 넘어가요</p>}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-[max(24px,env(safe-area-inset-bottom))] shrink-0" />
      </Sheet>
    </>
  )
}
