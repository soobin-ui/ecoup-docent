/*
  서버 연동층.
  - VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 있으면 Supabase(무료) RPC 를 부르고,
    없으면 이 브라우저 안에 흉내 DB(localStorage)를 둡니다(시안·로컬 확인용).
  - 서버 쪽은 표에 직접 손대지 못하게 막고(RLS), 아래 함수(RPC)만 열어 둡니다.
    스태프 기능은 함수 안에서 스태프 번호를 검사합니다 → supabase/schema.sql
  - 참가자에게서 받는 것: 이름·휴대폰 번호·구분(개인정보 수집·이용 동의 후), 설문 답, 기기 번호(무작위).
    목적은 선물 지급 확인·결과 보고, 행사 종료 후 파기.
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
export type ParticipantRow = {
  no: number
  name: string
  phone: string
  who: string
  sat: number | null
  understand: number | null
  best: string
  fun: string
  career: string
  issued_at: string
  used_at: string | null
}

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const SERVER_MODE = Boolean(URL_ && KEY_)

async function rpc<T>(fn: string, args: Record<string, unknown>, timeoutMs = 8000): Promise<T> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(`${URL_}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: KEY_!, Authorization: `Bearer ${KEY_}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: ctl.signal,
    })
    if (!res.ok) throw new Error(`${fn} ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(t)
  }
}

/* ── 흉내 DB (서버 없을 때) ─────────────────────────────── */
const LOCAL_KEY = 'ecoup-docent-localdb-v2'
const LOCAL_PIN = '0000'
type LocalRow = ParticipantRow & { device_id: string }
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
const toTicket = (r: { no: number; issued_at: string; used_at: string | null }): TicketOut => ({ no: r.no, issuedAt: r.issued_at, usedAt: r.used_at })
const joinArr = (v: unknown) => (Array.isArray(v) ? v.join(', ') : String(v ?? ''))

/* ── 참가자 ─────────────────────────────────────────── */

/** 등록+설문 → 선물 교환 티켓. 같은 기기가 다시 내면 처음 받은 티켓을 그대로 돌려줌 */
export async function registerTicket(i: RegIn): Promise<TicketOut> {
  if (SERVER_MODE) {
    const r = await rpc<{ no: number; issued_at: string; used_at: string | null }[]>('docent_register', {
      p_device: i.deviceId,
      p_name: i.name,
      p_phone: i.phone8,
      p_who: i.who,
      p_survey: i.survey,
    })
    return toTicket(r[0])
  }
  const rows = ldb()
  const hit = rows.find((r) => r.device_id === i.deviceId)
  if (hit) return toTicket(hit)
  const row: LocalRow = {
    device_id: i.deviceId,
    no: rows.length + 1,
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
    const r = await rpc<{ no: number; issued_at: string; used_at: string | null }[]>('docent_ticket', { p_device: deviceId })
    return r[0] ? toTicket(r[0]) : null
  }
  const hit = ldb().find((r) => r.device_id === deviceId)
  return hit ? toTicket(hit) : null
}

/* ── 스태프 ─────────────────────────────────────────── */

export async function staffCheckPin(pin: string): Promise<boolean> {
  if (SERVER_MODE) return rpc<boolean>('docent_staff_pin', { p_pin: pin })
  return pin === LOCAL_PIN
}

/** 선물 지급 완료 처리 — 기기 번호(참가자 화면) 또는 티켓 번호(스태프 화면) */
export async function staffUse(pin: string, by: { deviceId?: string; no?: number }): Promise<UseResult> {
  if (SERVER_MODE) {
    return rpc<UseResult>('docent_staff_use', { p_pin: pin, p_device: by.deviceId ?? null, p_no: by.no ?? null })
  }
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
  if (SERVER_MODE) return rpc<ParticipantRow[]>('docent_staff_list', { p_pin: pin }, 15000)
  if (pin !== LOCAL_PIN) return null
  return ldb().map(({ device_id: _d, ...r }) => r)
}
