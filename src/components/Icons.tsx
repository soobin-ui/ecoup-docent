/* 선 아이콘 모음 (24×24, 외부 파일 없이) */
import type { ReactNode } from 'react'

function I({ children, size = 24, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

type P = { size?: number; className?: string }

const PATHS: Record<string, ReactNode> = {
  // 6대 분야
  water: <path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z" />,
  carbon: (
    <>
      <path d="M7 17h10a3.6 3.6 0 0 0 .3-7.2A5 5 0 0 0 7.7 8.6 3.3 3.3 0 0 0 7 17z" />
      <path d="M12 11v8M9.6 16.8 12 19.2l2.4-2.4" />
    </>
  ),
  circular: (
    <>
      <path d="M4.5 11a7.5 7.5 0 0 1 13-4.6M18.5 3v4h-4" />
      <path d="M19.5 13a7.5 7.5 0 0 1-13 4.6M5.5 21v-4h4" />
    </>
  ),
  pollution: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  climate: (
    <>
      <path d="M10 14.2V5a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0z" />
      <path d="M12 10v7" />
    </>
  ),
  bio: (
    <>
      <path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" />
      <path d="M5 19l8-8" />
    </>
  ),
  // 섹션 3
  reuse: (
    <>
      <path d="M4.5 11a7.5 7.5 0 0 1 13-4.6M18.5 3v4h-4" />
      <path d="M19.5 13a7.5 7.5 0 0 1-13 4.6M5.5 21v-4h4" />
      <path d="M12 8.5s-2.4 2.8-2.4 4.4a2.4 2.4 0 0 0 4.8 0c0-1.6-2.4-4.4-2.4-4.4z" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  ai: (
    <>
      <rect x="4" y="4" width="16" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="16" height="6.5" rx="1.5" />
      <path d="M8 7.2h.01M8 16.8h.01M12 7.2h5M12 16.8h5" />
    </>
  ),
  energy: <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z" />,
  // 섹션 2 처리 단계
  filter: (
    <>
      <path d="M3.5 4.5h17l-6.5 7.5v6l-4 2.2v-8.2z" />
    </>
  ),
  floc: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <circle cx="12" cy="16" r="3.6" />
    </>
  ),
  microbe: (
    <>
      <path d="M12 4.5c4 0 7.5 3 7.5 7.2S16.4 19.5 12 19.5 4.5 16 4.5 11.7 8 4.5 12 4.5z" />
      <path d="M9.3 10h.01M14.5 12.6h.01M10.6 15h.01M3 8l2 1.3M21 8l-2 1.3M4 17l2-1M20 17l-2-1" />
    </>
  ),
  membrane: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
    </>
  ),
  // 공용
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.6M17.5 14.2a5.5 5.5 0 0 1 3 4.8" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.8 4 8.3 4.3C6 4.6 6.8 8.5 12 8.5zM12 8.5s1.2-4.5 3.7-4.2c2.3.3 1.5 4.2-3.7 4.2z" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </>
  ),
  refresh: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15" />,
}

export function Icon({ name, size, className }: P & { name: string }) {
  return (
    <I size={size} className={className}>
      {PATHS[name] ?? PATHS.water}
    </I>
  )
}

/** 설문 이해도 얼굴 4단계 (이모지 대신) */
export function Face({ level, size = 28 }: { level: number; size?: number }) {
  const mouth = ['M8.5 16.2c1.8-1.6 5.2-1.6 7 0', 'M9 15.4h6', 'M8.5 14.6c1.8 1.6 5.2 1.6 7 0', 'M7.8 13.8c1.8 3 6.6 3 8.4 0z'][level]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.6v.6M15 9.6v.6" strokeWidth={2.2} />
      <path d={mouth} fill={level === 3 ? 'currentColor' : 'none'} />
    </svg>
  )
}
