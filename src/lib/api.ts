/*
  서버 연동층.
  - VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 있으면 Supabase(무료) RPC 를 부르고,
    없으면 이 브라우저 안에 흉내 DB(localStorage)를 둡니다(시안·로컬 확인용).
  - 서버 쪽은 표에 직접 손대지 못하게 막고(RLS), 아래 함수(RPC)만 열어 둡니다.
    스태프 기능은 함수 안에서 스태프 번호를 검사합니다 → supabase/schema.sql
  - 참가자에게서 받는 것: 기기 번호(무작위), 닉네임, 설문 답, 고른 체험 회차. 이름·연락처 없음.
*/
import { EVENT } from '../content/tour'

export type SubmitIn = {
  deviceId: string
  day: string
  nickname: string
  answers: Record<string, string>
  bookings: Record<string, string> // 체험 id → 회차 시각
}
export type Status = { code: string | null; exchanged: boolean }
export type ExchangeResult = 'ok' | 'already' | 'notfound' | 'badpin'
export type SlotKey = { program: string; day: string; time: string }
export type ResponseRow = {
  code: string
  day: string
  nickname: string
  who: string
  understand: string
  best: string
  career: string
  came: string
  booking_filter: string
  booking_led: string
  created_at: string
  exchanged_at: string | null
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

/** 행사 날짜별 교환 번호 앞글자: 11/18=A … 11/21=D, 그 밖의 날(시험)=T */
export function dayLetter(day: string) {
  const i = EVENT.days.indexOf(day)
  return i >= 0 ? 'ABCD'[i] : 'T'
}

/* ── 흉내 DB (서버 없을 때) ─────────────────────────────── */
const LOCAL_KEY = 'ecoup-docent-localdb'
const LOCAL_PIN = '0000'
type LocalDB = { rows: (ResponseRow & { device_id: string })[]; closed: string[] }
function ldb(): LocalDB {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* */
  }
  return { rows: [], closed: [] }
}
function lsave(db: LocalDB) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(db))
  } catch {
    /* */
  }
}
const slotId = (s: SlotKey) => `${s.program}|${s.day}|${s.time}`

/* ── 참가자용 ───────────────────────────────────────────── */

/** 설문 제출 → 교환 번호. 같은 기기가 다시 내면 처음 받은 번호를 그대로 돌려줍니다. */
export async function submitSurvey(i: SubmitIn): Promise<Status> {
  if (SERVER_MODE) {
    const r = await rpc<{ code: string; exchanged: boolean }[]>('docent_submit', {
      p_device: i.deviceId,
      p_day: i.day,
      p_nickname: i.nickname,
      p_answers: i.answers,
      p_bookings: i.bookings,
    })
    return { code: r[0]?.code ?? null, exchanged: Boolean(r[0]?.exchanged) }
  }
  const db = ldb()
  const hit = db.rows.find((r) => r.device_id === i.deviceId)
  if (hit) return { code: hit.code, exchanged: Boolean(hit.exchanged_at) }
  const seq = db.rows.filter((r) => r.day === i.day).length + 1
  const code = `${dayLetter(i.day)}-${String(seq).padStart(4, '0')}`
  db.rows.push({
    device_id: i.deviceId,
    code,
    day: i.day,
    nickname: i.nickname,
    who: i.answers.who ?? '',
    understand: i.answers.understand ?? '',
    best: i.answers.best ?? '',
    career: i.answers.career ?? '',
    came: i.answers.came ?? '',
    booking_filter: i.bookings.filter ?? '',
    booking_led: i.bookings.led ?? '',
    created_at: new Date().toISOString(),
    exchanged_at: null,
  })
  lsave(db)
  return { code, exchanged: false }
}

/** 이 기기의 교환 상태(다른 스태프가 처리했을 수도 있으니 화면 열 때마다 확인) */
export async function getStatus(deviceId: string): Promise<Status> {
  if (SERVER_MODE) {
    const r = await rpc<{ code: string; exchanged: boolean }[]>('docent_status', { p_device: deviceId })
    return { code: r[0]?.code ?? null, exchanged: Boolean(r[0]?.exchanged) }
  }
  const hit = ldb().rows.find((r) => r.device_id === deviceId)
  return { code: hit?.code ?? null, exchanged: Boolean(hit?.exchanged_at) }
}

/** 오늘 마감된 회차 */
export async function getClosedSlots(day: string): Promise<SlotKey[]> {
  if (SERVER_MODE) {
    return rpc<SlotKey[]>('docent_closed_slots', { p_day: day }, 5000)
  }
  return ldb()
    .closed.map((s) => {
      const [program, d, time] = s.split('|')
      return { program, day: d, time }
    })
    .filter((s) => s.day === day)
}

/* ── 스태프용 ───────────────────────────────────────────── */

export async function staffCheckPin(pin: string): Promise<boolean> {
  if (SERVER_MODE) return rpc<boolean>('docent_staff_pin', { p_pin: pin })
  return pin === LOCAL_PIN
}

/** 교환 처리 — 교환 번호 또는 기기 번호로 */
export async function staffExchange(pin: string, by: { code?: string; deviceId?: string }): Promise<ExchangeResult> {
  if (SERVER_MODE) {
    return rpc<ExchangeResult>('docent_staff_exchange', {
      p_pin: pin,
      p_code: by.code ?? null,
      p_device: by.deviceId ?? null,
    })
  }
  if (pin !== LOCAL_PIN) return 'badpin'
  const db = ldb()
  const hit = db.rows.find((r) =>
    by.deviceId ? r.device_id === by.deviceId : r.code.toUpperCase() === (by.code ?? '').toUpperCase(),
  )
  if (!hit) return 'notfound'
  if (hit.exchanged_at) return 'already'
  hit.exchanged_at = new Date().toISOString()
  lsave(db)
  return 'ok'
}

export async function staffSetSlot(pin: string, s: SlotKey, closed: boolean): Promise<boolean> {
  if (SERVER_MODE) {
    return rpc<boolean>('docent_staff_set_slot', {
      p_pin: pin,
      p_program: s.program,
      p_day: s.day,
      p_time: s.time,
      p_closed: closed,
    })
  }
  if (pin !== LOCAL_PIN) return false
  const db = ldb()
  const id = slotId(s)
  db.closed = db.closed.filter((x) => x !== id)
  if (closed) db.closed.push(id)
  lsave(db)
  return true
}

export async function staffResponses(pin: string): Promise<ResponseRow[] | null> {
  if (SERVER_MODE) return rpc<ResponseRow[] | null>('docent_staff_responses', { p_pin: pin }, 15000)
  if (pin !== LOCAL_PIN) return null
  return ldb().rows.map(({ device_id: _d, ...r }) => r)
}
