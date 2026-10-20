import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './Icons'
import char0 from '../assets/img/char-0.webp'
import char1 from '../assets/img/char-1.webp'
import char2 from '../assets/img/char-2.webp'
import char3 from '../assets/img/char-3.webp'

/** **굵게** → <b> */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((s, i) => (i % 2 ? <b key={i}>{s}</b> : <span key={i}>{s}</span>))}
    </>
  )
}

/* ── 물속 장면 배경(화면 뒤에 고정) ───────────────────── */
const BUBBLES = [
  { x: '6%', s: 26, d: 12, delay: 0 },
  { x: '18%', s: 12, d: 9, delay: 3 },
  { x: '33%', s: 18, d: 13, delay: 6 },
  { x: '47%', s: 10, d: 8, delay: 1.5 },
  { x: '61%', s: 22, d: 14, delay: 4.5 },
  { x: '74%', s: 14, d: 10, delay: 8 },
  { x: '86%', s: 30, d: 16, delay: 2 },
  { x: '94%', s: 11, d: 9, delay: 6.5 },
]
/** 위에서 떨어지는 물방울(배경) */
const DRIPS = [
  { x: '12%', s: 14, d: 7, delay: 0.5 },
  { x: '38%', s: 10, d: 6, delay: 3.5 },
  { x: '69%', s: 16, d: 8, delay: 1.8 },
  { x: '88%', s: 11, d: 6.5, delay: 5 },
]
export function SeaBackground() {
  return (
    <div className="sea-bg" aria-hidden>
      <div className="caustic" />
      {DRIPS.map((d, i) => (
        <svg key={`d${i}`} className="drip" width={d.s} height={d.s * 1.25} viewBox="0 0 50 60" style={{ left: d.x, animationDuration: `${d.d}s`, animationDelay: `${d.delay}s` }}>
          <path d="M25 3C25 3 6 27 6 39a19 19 0 0 0 38 0C44 27 25 3 25 3z" fill="rgba(255,255,255,.55)" stroke="#fff" strokeWidth="3" />
          <path d="M15 35c.6-4 2.4-7 4.6-10" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      ))}
      {BUBBLES.map((b, i) => (
        <span key={i} className="bubble" style={{ left: b.x, width: b.s, height: b.s, animationDuration: `${b.d}s`, animationDelay: `${b.delay}s` }} />
      ))}
    </div>
  )
}

/** 움직이는 물 표면(두 겹) — 시트 위 가장자리 등 */
export function Surface({ color = 'var(--sheet)', back = 'rgba(255,255,255,.55)', className = '' }: { color?: string; back?: string; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`} aria-hidden>
      <svg className="wave-move absolute bottom-0 h-full w-[200%]" viewBox="0 0 800 40" preserveAspectRatio="none">
        <path d="M0 14 Q50 0 100 14 T200 14 T300 14 T400 14 T500 14 T600 14 T700 14 T800 14 V40 H0z" fill={back} />
      </svg>
      <svg className="wave-move slow rev absolute bottom-0 h-[80%] w-[200%]" viewBox="0 0 800 40" preserveAspectRatio="none">
        <path d="M0 16 Q66 2 133 16 T266 16 T400 16 T533 16 T666 16 T800 16 V40 H0z" fill={color} />
      </svg>
    </div>
  )
}

/** 화면 아래 물결 띠(두 겹) */
export function Waves({ className = '', color = '#0e6aa0', front = '#0b4a75' }: { className?: string; color?: string; front?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <svg className="wave-move slow absolute bottom-0 h-full w-[200%]" viewBox="0 0 800 100" preserveAspectRatio="none">
        <path d="M0 30 Q50 5 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 V100 H0z" fill={color} opacity="0.55" />
      </svg>
      <svg className="wave-move rev absolute bottom-0 h-[78%] w-[200%]" viewBox="0 0 800 100" preserveAspectRatio="none">
        <path d="M0 35 Q50 12 100 35 T200 35 T300 35 T400 35 T500 35 T600 35 T700 35 T800 35 V100 H0z" fill={front} />
      </svg>
    </div>
  )
}

/**
 * 물방울 캐릭터 — 이 투어의 주인공.
 * 맑음(0~3)에 따라 색·표정·탁한 알갱이가 바뀝니다. 흙탕물일 땐 시무룩, 맑아질수록 활짝.
 * clarity 를 안 주면 body[data-clarity] 의 현재 색(--water)을 따릅니다.
 */
const WATER = [
  ['#c6ad7c', '#a68d5f'],
  ['#a5d2b6', '#74a98a'],
  ['#7fe0d8', '#20b6b4'],
  ['#8fe6fb', '#08aee0'],
]
const MOUTH = ['M21.5 47.5q1.75-1.6 3.5 0t3.5 0', 'M21.5 46.2q3.5 2.4 7 0', 'M20.8 45.6q4.2 4.6 8.4 0', 'M20 44.8q5 7.4 10 0z']
export function Droplet({
  size = 40,
  clarity,
  bob = false,
  face = false,
  mood,
  className = '',
}: {
  size?: number
  clarity?: number
  bob?: boolean
  face?: boolean
  mood?: number
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const c = clarity
  const top = c === undefined ? 'var(--water-2)' : WATER[c][0]
  const bot = c === undefined ? 'var(--water)' : WATER[c][1]
  const speck = c === undefined ? 'var(--speck)' : String([1, 0.65, 0.3, 0][c])
  const m = mood ?? c ?? 0
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 50 60" className={`${bob ? 'drop-bob' : ''} overflow-visible ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: top, transition: 'stop-color 1s' }} />
          <stop offset="1" style={{ stopColor: bot, transition: 'stop-color 1s' }} />
        </linearGradient>
      </defs>
      <path
        d="M25 2C25 2 4 27 4 39a21 21 0 0 0 42 0C46 27 25 2 25 2z"
        fill={`url(#g${id})`}
        stroke={face ? '#0b4a75' : 'none'}
        strokeWidth={face ? 2.2 : 0}
        strokeLinejoin="round"
      />
      <g fill="#5a4426" style={{ opacity: speck, transition: 'opacity 1s ease' }}>
        <circle cx="12.5" cy="48" r="2.1" />
        <circle cx="38" cy="50" r="1.7" />
        <circle cx="26" cy="56" r="1.5" />
        {!face && <circle cx="30" cy="36" r="1.5" />}
      </g>
      <path d="M14.5 31c.6-4 2.6-8 5.2-11.5" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.85" />
      {face && (
        <g>
          <ellipse cx="11.5" cy="44" rx="3.2" ry="2" fill="#ff8fa3" opacity="0.55" />
          <ellipse cx="38.5" cy="44" rx="3.2" ry="2" fill="#ff8fa3" opacity="0.55" />
          <g className="blink">
            <ellipse cx="18" cy="38.5" rx="2.6" ry="3.4" fill="#0b4a75" />
            <ellipse cx="32" cy="38.5" rx="2.6" ry="3.4" fill="#0b4a75" />
            <circle cx="18.9" cy="37.3" r="1" fill="#fff" />
            <circle cx="32.9" cy="37.3" r="1" fill="#fff" />
          </g>
          <path d={MOUTH[m]} stroke="#0b4a75" strokeWidth="1.8" fill={m === 3 ? '#0b4a75' : 'none'} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  )
}

/** 상단 진행 관: 소개 · 1 · 2 · 3 · 체험 */
export function Pipe({ seg }: { seg: number }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`진행 ${seg + 1}/5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="pipe-seg block h-[8px] w-[20px] rounded-full" data-fill={i <= seg ? '1' : '0'} data-now={i === seg ? '1' : '0'} />
      ))}
    </div>
  )
}

export function Header({ seg, onBack }: { seg: number; onBack?: () => void }) {
  return (
    <header className="relative z-20 -mx-5 flex h-14 shrink-0 items-center gap-1.5 px-5">
      {onBack ? (
        <button onClick={onBack} className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-sea active:bg-white/40" aria-label="이전 화면">
          <Icon name="back" />
        </button>
      ) : (
        <span className="w-2" />
      )}
      <Droplet size={17} />
      <span className="whitespace-nowrap text-[clamp(13.5px,3.85vw,16px)] font-bold text-sea">
        <span className="max-[359px]:hidden">에코업 </span>수처리 전시관
      </span>
      <span className="ml-auto">
        <Pipe seg={seg} />
      </span>
    </header>
  )
}

export function Page({ children, fit = false }: { children: ReactNode; fit?: boolean }) {
  return (
    <>
      <SeaBackground />
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative z-10 mx-auto flex w-full max-w-[480px] flex-col px-5 ${fit ? 'h-dvh overflow-hidden' : 'min-h-dvh'}`}
      >
        {children}
      </motion.main>
    </>
  )
}

/** 물빛 위 머리 영역: 리본 머리표 + 외곽선 제목 + 한 줄 설명 */
export function Hero({ eyebrow, title, lead, center = false, compact = false }: { eyebrow?: string; title: string[]; lead?: string; center?: boolean; compact?: boolean }) {
  return (
    <div className={`${compact ? 'shrink-0 pb-[min(30px,3.6vh)]' : 'pb-9'} pt-1 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[clamp(13px,3.72vw,15.5px)] font-bold tracking-tight text-sea"
        >
          <svg width="11" height="13" viewBox="0 0 50 60" aria-hidden>
            <path d="M25 2C25 2 4 27 4 39a21 21 0 0 0 42 0C46 27 25 2 25 2z" fill="#00add0" />
          </svg>
          {eyebrow}
        </motion.span>
      )}
      <Title lines={title} className={compact ? 'mt-[min(10px,1.2vh)]' : 'mt-3'} size={compact ? 'min(8.4vw, 4.4vh, 36px)' : undefined} />
      {lead && (
        <p className={`b-accent text-sea/85 ${compact ? 'mt-[min(10px,1.2vh)] text-[clamp(15.5px,4.36vw,18px)] leading-[1.5]' : 'mt-3 text-[clamp(15.5px,4.36vw,18px)] leading-[1.6]'}`}>
          <Rich text={lead} />
        </p>
      )}
    </div>
  )
}

/** 외곽선 제목 — 첫 줄 흰색, 마지막 줄 연두 */
export function Title({ lines, className = '', size }: { lines: string[]; className?: string; size?: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.05 }}
      className={`title-shadow font-bold leading-[1.22] tracking-[-0.02em] ${className}`}
      style={{ fontSize: size ?? 'clamp(28px,8.4vw,36px)', ['--stroke' as never]: '5px' }}
    >
      {lines.map((l, i) => (
        <span key={i} className={`stroke-title block ${i === lines.length - 1 && lines.length > 1 ? 'text-lime' : 'text-white'}`}>
          {l}
        </span>
      ))}
    </motion.h1>
  )
}

/** 흰 시트 — 위쪽이 물결, 화면 끝까지 */
export function Sheet({ children }: { children: ReactNode }) {
  return (
    <section className="sheet -mx-5 flex min-h-0 flex-1 flex-col px-5 pt-[min(16px,2vh)]">
      <Surface className="-top-[26px] h-[28px]" />
      {children}
    </section>
  )
}

// 예전 이름 호환
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[clamp(13.5px,3.85vw,16px)] font-bold tracking-wide text-sea">{children}</p>
}
export function Lead({ text }: { text: string }) {
  return (
    <p className="b-accent mt-3 text-[clamp(15.5px,4.36vw,18px)] leading-[1.6] text-mute">
      <Rich text={text} />
    </p>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[clamp(14px,3.97vw,16.5px)] font-bold text-sea shadow-[0_3px_8px_rgba(8,60,100,0.12)]">{children}</span>
}

/** 아래 고정 버튼 띠 (시트 색으로 페이드) */
export function BottomBar({ children, tone = 'sheet', fit = false }: { children: ReactNode; tone?: 'sheet' | 'none'; fit?: boolean }) {
  return (
    <div
      className={
        fit
          ? 'z-10 -mx-5 mt-auto shrink-0 px-5 pt-[min(14px,1.8vh)] pb-[max(min(24px,3vh),calc(env(safe-area-inset-bottom)+10px))]'
          : 'sticky bottom-0 z-10 -mx-5 mt-auto px-5 pt-6 pb-[max(18px,env(safe-area-inset-bottom))]'
      }
      style={tone === 'sheet' ? { background: 'linear-gradient(180deg, transparent, var(--sheet) 40%)' } : undefined}
    >
      {children}
    </div>
  )
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  breathe = false,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'outline'
  className?: string
  breathe?: boolean
}) {
  const style =
    variant === 'primary'
      ? `cta ${breathe ? 'breathe' : ''}`
      : variant === 'outline'
        ? 'border-[2.5px] border-sea bg-white text-sea shadow-[0_4px_0_rgba(11,74,117,0.25)]'
        : 'bg-transparent text-sea/80'
  return (
    <button onClick={onClick} disabled={disabled} className={`flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl text-[clamp(18.5px,5.13vw,21px)] font-bold ${style} ${className}`}>
      {children}
    </button>
  )
}

/** 그림 자리 — 힉스필드 그림이 오면 src 만 넣으면 됩니다 */
export function ImageSlot({ src, label, className = '', children }: { src?: string; label: string; className?: string; children?: ReactNode }) {
  if (src) return <img src={src} alt={label} className={`w-full rounded-3xl object-cover ${className}`} />
  return (
    <div className={`img-slot relative grid place-items-center overflow-hidden rounded-3xl text-center ${className}`} role="img" aria-label={label}>
      {children}
      <span className="absolute top-2.5 left-2.5 rounded-full bg-white/85 px-2 py-0.5 text-[clamp(11px,3.21vw,13.5px)] font-bold text-sea/70">그림 자리</span>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-white p-5 shadow-[0_8px_24px_-14px_rgba(8,60,100,0.35)] ${className}`}>{children}</div>
}

/* ── 3D 물방울 캐릭터(힉스필드, 첫 화면 섬 위 캐릭터와 같은 모습) ── 0 흙탕물 → 3 맑은 물 */
const CHARS = [char0, char1, char2, char3]
const CHAR_ALT = ['흙탕물 물방울', '조금 맑아진 물방울', '거의 맑아진 물방울', '맑은 물방울']
export function Character({ level, size = 120, bob = false, className = '' }: { level: number; size?: number; bob?: boolean; className?: string }) {
  return (
    <img
      src={CHARS[Math.max(0, Math.min(3, level))]}
      alt={CHAR_ALT[level] ?? ''}
      width={size}
      height={size}
      draggable={false}
      className={`select-none drop-shadow-[0_10px_14px_rgba(8,60,100,0.25)] ${bob ? 'drop-bob' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * 한 화면 보장 상자 — 남는 높이에 내용이 안 들어가면 내용 전체를 살짝 축소(zoom)해서 맞춥니다.
 * 디자인은 작은 폰에서도 거의 1배로 들어가게 짜고, 이건 어떤 기종에서도 스크롤이 안 생기게 하는 안전장치입니다.
 */
export function FitBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const fit = () => {
      i.style.zoom = '1'
      i.style.minHeight = '0px'
      const need = i.scrollHeight
      const have = o.clientHeight
      const z = need > have ? Math.max(0.6, have / need) : 1
      i.style.zoom = String(z)
      i.style.minHeight = z === 1 ? '100%' : '0px'
      setZoom(z)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(o)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={outer} className="min-h-0 flex-1 overflow-hidden" data-zoom={zoom.toFixed(2)}>
      <div ref={inner} className={`flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  )
}
