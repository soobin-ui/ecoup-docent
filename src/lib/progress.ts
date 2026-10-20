/*
  진행 상태 — 휴대폰 브라우저에만 저장(localStorage).
  QR 페이지를 닫았다가 다시 열어도 하던 곳부터 이어집니다.
  저장이 막힌 브라우저(시크릿 모드 등)에서도 화면은 그대로 동작합니다.
*/
import { useCallback, useEffect, useState } from 'react'

export const STEPS = [
  'intro',
  'about',
  'talent',
  'partners',
  's1',
  's1b',
  's2',
  's3',
  'complete',
  'handson',
  'survey',
  'exchange',
] as const
export type Step = (typeof STEPS)[number]

export type Bookings = Record<string, { day: string; time: string }>

export type Progress = {
  deviceId: string
  step: Step
  maxStep: number // 지금까지 도달한 가장 먼 단계(앞으로 건너뛰기 방지)
  solved: [boolean, boolean, boolean]
  bookings: Bookings // 체험 id → 고른 회차
  nickname: string
  survey: Record<string, string> | null
  code: string | null // 교환 번호
  offlineCode: boolean
  exchanged: boolean
}

const KEY = 'ecoup-docent-v1'

function newId() {
  const a = new Uint8Array(12)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('')
}

function fresh(deviceId?: string): Progress {
  return {
    deviceId: deviceId ?? newId(),
    step: 'intro',
    maxStep: 0,
    solved: [false, false, false],
    bookings: {},
    nickname: '',
    survey: null,
    code: null,
    offlineCode: false,
    exchanged: false,
  }
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch {
    /* 저장소 막힘 — 새로 시작 */
  }
  return fresh()
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* 무시 */
  }
}

export function useProgress() {
  const [p, setP] = useState<Progress>(load)
  useEffect(() => save(p), [p])

  const update = useCallback((patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => {
    setP((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  }, [])

  const go = useCallback((step: Step) => {
    setP((prev) => {
      const i = STEPS.indexOf(step)
      return { ...prev, step, maxStep: Math.max(prev.maxStep, i) }
    })
    window.scrollTo({ top: 0 })
  }, [])

  // 처음부터 다시 — 기기 번호는 유지(같은 휴대폰 중복 수령 방지), 교환 기록도 유지
  const restart = useCallback(() => {
    setP((prev) => ({
      ...fresh(prev.deviceId),
      code: prev.code,
      exchanged: prev.exchanged,
      nickname: prev.nickname,
    }))
    window.scrollTo({ top: 0 })
  }, [])

  return { p, update, go, restart }
}

/** 맑음 단계 0~3 = 푼 미션 수 */
export function clarityOf(p: Progress) {
  return p.solved.filter(Boolean).length
}
