/*
  쓰다 만 입력(암호 칸·참가자 등록·설문)을 휴대폰에 바로 저장.
  폰이 잠기거나 다른 앱에 다녀와서 브라우저가 페이지를 새로 불러와도 멈췄던 화면 그대로 보이게.
*/
import { useEffect, useState } from 'react'

const KEY = 'ecoup-docent-draft-v2'

function readAll(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}
function writeAll(all: Record<string, unknown>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* 저장 막힘 — 화면은 그대로 동작 */
  }
}

/** useState 와 같지만 값이 바뀔 때마다 저장되고, 다시 열면 저장된 값으로 시작 */
export function useDraft<T>(name: string, init: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    const all = readAll()
    return name in all ? (all[name] as T) : init
  })
  useEffect(() => {
    const all = readAll()
    all[name] = v
    writeAll(all)
  }, [name, v])
  return [v, setV]
}

/** 다 낸 입력은 지우기(개인정보가 폰에 남지 않게) */
export function clearDraft(...names: string[]) {
  const all = readAll()
  for (const n of names) delete all[n]
  writeAll(all)
}

/* ── 스크롤 위치 — 마지막으로 보던 화면·위치를 저장해 두고, 새로 불러온 직후 한 번만 되돌림 ── */
const SCROLL_KEY = 'ecoup-docent-scroll-v2'
let restored = false

export function useScrollMemory(step: string) {
  useEffect(() => {
    if (!restored) {
      restored = true
      try {
        const s = JSON.parse(localStorage.getItem(SCROLL_KEY) ?? 'null') as { step: string; y: number } | null
        if (s && s.step === step && s.y > 0) {
          // 화면이 그려진 뒤(등장 애니메이션 포함) 되돌림
          setTimeout(() => window.scrollTo(0, s.y), 400)
        }
      } catch {
        /* */
      }
    }
    let t = 0
    const on = () => {
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        try {
          localStorage.setItem(SCROLL_KEY, JSON.stringify({ step, y: Math.round(window.scrollY) }))
        } catch {
          /* */
        }
      }, 150)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      window.removeEventListener('scroll', on)
      window.clearTimeout(t)
    }
  }, [step])
}
