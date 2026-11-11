/*
  진행 상태 — 휴대폰 브라우저에만 저장(localStorage).
  QR 페이지를 닫았다가 다시 열어도 하던 곳부터 이어집니다.
  저장이 막힌 브라우저(시크릿 모드 등)에서도 화면은 그대로 동작합니다.
*/
import { clearDraft } from './draft'
import { useCallback, useEffect, useState } from 'react'

// 시안(에코업관 미션 웹 화면.pdf) 순서
export const STEPS = [
  'intro',
  'howto',
  'about',
  'partners',
  'a1',
  'q1',
  'b1',
  'b2',
  'q2',
  'c1',
  'c2',
  'q3',
  'stamp1',
  'water',
  'contest',
  'works',
  'stamp2',
  'hands',
  'complete',
  'register',
  'survey',
  'ticket',
] as const
export type Step = (typeof STEPS)[number]

export type Ticket = { no: number; issuedAt: string; usedAt: string | null; offline?: boolean }

export type Progress = {
  deviceId: string
  step: Step
  maxStep: number // 지금까지 도달한 가장 먼 단계
  solved: [boolean, boolean, boolean] // 암호 3개
  stamps: [boolean, boolean, boolean] // 전시 투어 · 경진대회 · 체험
  reg: { name: string; phone8: string; who: string; consent: boolean } | null
  survey: Record<string, string | string[] | number> | null
  ticket: Ticket | null
}

// v2 = 시안 반영 후(이전 v1 저장분과 구조가 달라 새로 시작)
const KEY = 'ecoup-docent-v2'

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
    stamps: [false, false, false],
    reg: null,
    survey: null,
    ticket: null,
  }
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = { ...fresh(), ...JSON.parse(raw) } as Progress
      if (!STEPS.includes(p.step)) p.step = 'intro'
      return p
    }
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

  // 처음부터 다시 — 기기 번호·등록·티켓은 유지(같은 휴대폰 중복 수령 방지)
  const restart = useCallback(() => {
    setP((prev) => ({ ...fresh(prev.deviceId), reg: prev.reg, survey: prev.survey, ticket: prev.ticket }))
    clearDraft('b1-seen') // 처음부터 하면 B1 카드도 다시 봐야 함
    window.scrollTo({ top: 0 })
  }, [])

  return { p, update, go, restart }
}

/** 맑음 단계 0~3 = 푼 암호 수(물방울 캐릭터 색) */
export function clarityOf(p: Progress) {
  return p.solved.filter(Boolean).length
}
/** 모은 스탬프 수 */
export function stampCount(p: Progress) {
  return p.stamps.filter(Boolean).length
}
