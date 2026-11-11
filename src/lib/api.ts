/*
  서버 연동층 — 구글 시트(Apps Script 웹 앱, 코드는 gas/Code.gs).
  - VITE_GAS_URL(웹 앱 주소)이 있으면 그 시트에 저장하고,
    없으면 이 브라우저 안에 흉내 DB(localStorage)를 둡니다(시안·로컬 확인용).
  - 참가자에게서 받는 것: 이름·휴대폰 번호·구분(개인정보 수집·이용 동의 후), 설문 답, 기기 번호(무작위).
    목적은 선물 지급 확인·결과 보고, 행사 종료 후 파기.
  - 요청은 text/plain 으로 보냄 — application/json 이면 브라우저가 사전 확인(CORS preflight)을 보내는데
    Apps Script 는 그걸 받지 못합니다.
*/

export type RegIn = {
  deviceId: string
  name: string
  phone8: string // 010 뒤 8자리
  who: string
  survey: Record<string, string | string[] | number>
}
export type TicketOut = { no: number; issuedAt: string; usedAt: string | null }
export type UseResult = 'ok' | 'already' | 'notfound' | 'badpin'
/** 스태프 화면 집계용 — 이름·휴대폰·설문은 서버가 내보내지 않음(명단은 구글 시트에서 확인) */
export type ParticipantRow = { no: number; issued_at: string; used_at: string | null }
type LocalRow = ParticipantRow & {
  device_id: string
  name: string
  phone: string
  who: string
  sat: number | null
  understand: number | null
  best: string
  fun: string
  career: string
}
type RawTicket = { no: number; issued_at: string; used_at: string | null }

const GAS_URL = import.meta.env.VITE_GAS_URL as string | undefined
export const SERVER_MODE = Boolean(GAS_URL)

async function call<T>(action: string, body: Record<string, unknown>, timeoutMs = 15000): Promise<T> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(GAS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...body }),
      signal: ctl.signal,
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`${action} ${res.status}`)
    const j = await res.json()
    if (j.error) throw new Error(`${action} ${j.error}`)
    return j as T
  } finally {
    clearTimeout(t)
  }
}

/* ── 흉내 DB (서버 없을 때) ─────────────────────────────── */
const LOCAL_KEY = 'ecoup-docent-localdb-v2'
const LOCAL_PIN = '0000'
function ldb(): LocalRow[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}
function lsave(rows: LocalRow[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows))
  } catch {
    /* */
  }
}
const toTicket = (r: RawTicket): TicketOut => ({ no: r.no, issuedAt: r.issued_at, usedAt: r.used_at })
const joinArr = (v: unknown) => (Array.isArray(v) ? v.join(', ') : String(v ?? ''))

/* ── 참가자 ─────────────────────────────────────────── */

/** 등록+설문 → 선물 교환 티켓. 같은 기기가 다시 내면 처음 받은 티켓을 그대로 돌려줌 */
export async function registerTicket(i: RegIn): Promise<TicketOut> {
  if (SERVER_MODE) {
    const r = await call<{ ticket: RawTicket }>('register', { device: i.deviceId, name: i.name, phone: i.phone8, who: i.who, survey: i.survey })
    return toTicket(r.ticket)
  }
  const rows = ldb()
  const hit = rows.find((r) => r.device_id === i.deviceId)
  if (hit) return toTicket(hit)
  const row: LocalRow = {
    device_id: i.deviceId,
    no: rows.reduce((m, r) => Math.max(m, r.no), 0) + 1,
    name: i.name,
    phone: i.phone8,
    who: i.who,
    sat: Number(i.survey.sat) || null,
    understand: Number(i.survey.understand) || null,
    best: joinArr(i.survey.best),
    fun: joinArr(i.survey.fun),
    career: joinArr(i.survey.career),
    issued_at: new Date().toISOString(),
    used_at: null,
  }
  rows.push(row)
  lsave(rows)
  return toTicket(row)
}

/** 이 기기 티켓의 현재 상태(스태프가 지급 처리했는지) */
export async function getTicket(deviceId: string): Promise<TicketOut | null> {
  if (SERVER_MODE) {
    const r = await call<{ ticket: RawTicket | null }>('ticket', { device: deviceId })
    return r.ticket ? toTicket(r.ticket) : null
  }
  const hit = ldb().find((r) => r.device_id === deviceId)
  return hit ? toTicket(hit) : null
}

/* ── 스태프 ─────────────────────────────────────────── */

export async function staffCheckPin(pin: string): Promise<boolean> {
  if (SERVER_MODE) return (await call<{ ok: boolean }>('staff_pin', { pin })).ok
  return pin === LOCAL_PIN
}

/** 선물 지급 완료 처리 — 기기 번호(참가자 화면) 또는 티켓 번호(스태프 화면) */
export async function staffUse(pin: string, by: { deviceId?: string; no?: number }): Promise<UseResult> {
  if (SERVER_MODE) return (await call<{ result: UseResult }>('staff_use', { pin, device: by.deviceId ?? null, no: by.no ?? null })).result
  if (pin !== LOCAL_PIN) return 'badpin'
  const rows = ldb()
  const hit = rows.find((r) => (by.deviceId ? r.device_id === by.deviceId : r.no === by.no))
  if (!hit) return 'notfound'
  if (hit.used_at) return 'already'
  hit.used_at = new Date().toISOString()
  lsave(rows)
  return 'ok'
}

export async function staffList(pin: string): Promise<ParticipantRow[] | null> {
  if (SERVER_MODE) return (await call<{ rows: ParticipantRow[] | null }>('staff_list', { pin }, 25000)).rows
  if (pin !== LOCAL_PIN) return null
  return ldb().map((r) => ({ no: r.no, issued_at: r.issued_at, used_at: r.used_at }))
}
