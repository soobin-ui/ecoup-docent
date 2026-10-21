import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { INTRO } from '../content/tour'
import type { Progress, Step } from '../lib/progress'
import { STEPS } from '../lib/progress'
import { SeaBackground } from '../components/ui'
import hero from '../assets/img/hero.webp'
import heroLoop from '../assets/img/hero-loop.mp4'
import { Icon } from '../components/Icons'

/** 그림 가장자리를 배경 물빛에 녹여 네모 테두리가 안 보이게 */
/** 하늘(투명) → 맑은 물 → 깊은 물, 중간에 단단한 경계 없이 */
const SEA_FADE =
  'linear-gradient(180deg, rgba(54,189,236,0) 0%, rgba(54,189,236,0) 52%, rgba(54,189,236,.35) 64%, rgba(38,170,225,.75) 76%, #1e9bd6 88%, #1689c6 100%)'
const MASK = 'radial-gradient(ellipse 56% 50% at 50% 50%, #000 72%, transparent 100%)'
/** 폭포·맑은 물 위 반짝임(그림 기준 %) */
const SPARKS = [
  { x: '84%', y: '64%', s: 16, d: '0s' },
  { x: '91%', y: '74%', s: 11, d: '0.9s' },
  { x: '76%', y: '57%', s: 12, d: '1.6s' },
  { x: '88%', y: '83%', s: 14, d: '2.3s' },
]

/**
 * 01 오프닝 — QR 을 찍으면 처음 뜨는 화면.
 * 3D 정화장 섬(흙탕물 관 → 침전지 → 미생물 반응조 → 막 여과 → 맑은 물 폭포)이 둥실 떠 있고,
 * 섬 위 흙탕물 물방울(주인공)이 "나 좀 맑게 해 줄래?" 하고 말을 겁니다. 시작 버튼은 물속에.
 */
export function IntroScreen({ p, go, restart }: { p: Progress; go: (s: Step) => void; restart: () => void }) {
  const resumable = p.maxStep > 0 && p.step !== 'intro'
  const resumeTo = resumable ? p.step : STEPS[Math.max(1, p.maxStep)]
  // 남는 무대 크기를 재서 그림 크기·위치를 맞춤
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ w: 375, h: 360 })
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const fit = () => setStage({ w: el.clientWidth, h: el.clientHeight })
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // 그림은 무대 정가운데 — 폭의 112% 또는 높이의 122% 중 작은 쪽(섬 위아래 빈 하늘은 잘려도 됨)
  const art = Math.min(stage.w * 1.12, stage.h * 1.22)
  const artTop = (stage.h - art) / 2
  return (
    <>
      <SeaBackground />
      <main className="relative z-10 mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden">
        {/* 하늘 → 물: 한 장으로 이어지는 그라데이션(띠·경계선 없이) */}
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: SEA_FADE }} />
        <div className="pointer-events-none absolute inset-x-0 top-[66%] h-[60px] overflow-hidden opacity-70" aria-hidden>
          <svg className="wave-move slow absolute top-0 h-full w-[200%]" viewBox="0 0 800 60" preserveAspectRatio="none">
            <path d="M0 20 Q50 8 100 20 T200 20 T300 20 T400 20 T500 20 T600 20 T700 20 T800 20" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
            <path d="M0 44 Q66 32 133 44 T266 44 T400 44 T533 44 T666 44 T800 44" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
          </svg>
        </div>
        {/* ── 제목 ── */}
        <div className="shrink-0 px-5 pt-[clamp(14px,8.5vh,96px)] text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-[min(16px,3.6vw)] py-2 text-[min(14px,3.7vw)] font-bold text-sea"
          >
            <svg width="11" height="13" viewBox="0 0 50 60" aria-hidden>
              <path d="M25 2C25 2 4 27 4 39a21 21 0 0 0 42 0C46 27 25 2 25 2z" fill="#00add0" />
            </svg>
            {INTRO.eyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.12 }}
            className="title-shadow mt-[min(16px,2vh)] font-bold leading-[1.14] tracking-[-0.03em]"
            style={{ fontSize: 'min(13.4vw, 7.4vh, 62px)', ['--stroke' as never]: 'min(8px, 1.9vw)' }}
          >
            <span className="stroke-title block text-white">{INTRO.title[0]}</span>
            <span className="stroke-title block text-lime">{INTRO.title[1]}</span>
          </motion.h1>
        </div>

        {/* ── 키 비주얼: 3D 정화장 섬(힉스필드) — 둥실 떠 있고 폭포에 반짝임 ── */}
        <div ref={stageRef} className="relative min-h-0 flex-1" data-crop>
          <motion.div
            className="absolute left-1/2 aspect-square"
            style={{ width: art, top: artTop, x: '-50%' }}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 15, delay: 0.25 }}
          >
            <div className="float-slow absolute inset-0">
              {/* 물이 계속 흐르는 5초 반복 영상(첫·끝 장면이 같아 이음매 없음). 자동재생이 막힌 기기는 poster 그림이 그대로 보임 */}
              <video
                src={heroLoop}
                poster={hero}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label="흙탕물이 정화장을 지나 맑은 물이 되는 3D 미니어처와 물방울 캐릭터"
                className="h-full w-full object-contain"
                style={{ WebkitMaskImage: MASK, maskImage: MASK }}
              />
              {SPARKS.map((k, i) => (
                <svg key={i} className="twinkle absolute" width={k.s} height={k.s} viewBox="0 0 24 24" style={{ left: k.x, top: k.y, animationDelay: k.d }} aria-hidden>
                  <path d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z" fill="#fff" />
                </svg>
              ))}
              {/* 말풍선 — 캐릭터 머리 위 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 260, damping: 15 }}
                className="absolute left-[52%] top-[37%] w-max rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-[clamp(14px,3.97vw,16.5px)] font-bold text-sea shadow-[0_6px_16px_rgba(8,60,100,0.2)]"
              >
                나 좀 맑게 해 줄래?
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── 물웅덩이 + 시작 버튼 ── */}
        <div className="relative shrink-0 px-5 pt-[min(36px,4.5vh)] pb-[max(min(84px,7.5vh),calc(env(safe-area-inset-bottom)+16px))]">
          <motion.div className="relative flex flex-col gap-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="mb-[min(12px,1.4vh)] flex justify-center gap-2 text-[clamp(14.5px,4.1vw,17px)] font-bold text-white">
              <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white/20 px-3 py-1.5 ring-1 ring-white/45">
                <Icon name="clock" size={15} /> {INTRO.chips[0]}
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white/20 px-3 py-1.5 ring-1 ring-white/45">
                <Icon name="water" size={15} /> {INTRO.chips[1]}
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white/20 px-3 py-1.5 ring-1 ring-white/45">
                <Icon name="gift" size={15} /> {INTRO.chips[2]}
              </span>
            </div>
            {resumable ? (
              <>
                <button onClick={() => go(resumeTo)} className="cta breathe h-[clamp(50px,7.6vh,64px)] w-full rounded-2xl text-[clamp(17px,2.5vh,20px)] font-bold">
                  {INTRO.resume}
                </button>
                <button onClick={restart} className="h-10 text-[clamp(15px,4.23vw,17.5px)] font-bold text-white/85">
                  {INTRO.restart}
                </button>
              </>
            ) : (
              <button onClick={() => go('about')} className="cta breathe h-[clamp(50px,7.6vh,64px)] w-full rounded-2xl text-[clamp(17px,2.5vh,20px)] font-bold">
                {INTRO.cta}
              </button>
            )}
          </motion.div>
        </div>
      </main>
    </>
  )
}
