import { EVENT } from '../content/tour'

/** 한국 시각 기준 오늘 날짜(YYYY-MM-DD)와 지금 시각(HH:MM) */
export function nowKST() {
  const d = new Date(Date.now() + 9 * 3600 * 1000)
  const iso = d.toISOString()
  return { day: iso.slice(0, 10), hm: iso.slice(11, 16) }
}

/** 회차표에 쓸 날: 행사 기간이면 오늘, 아니면 첫날(미리보기) */
export function scheduleDay() {
  const { day, hm } = nowKST()
  const live = EVENT.days.includes(day)
  return { day: live ? day : EVENT.days[0], live, hm }
}

const WD = ['일', '월', '화', '수', '목', '금', '토']
export function dayLabel(day: string) {
  const [y, m, d] = day.split('-').map(Number)
  return `${m}/${d}(${WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`
}

/** ISO 시각 → '11/18(수) 14:20' (한국 시각) */
export function stampLabel(iso: string) {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString()
  return `${dayLabel(d.slice(0, 10))} ${d.slice(11, 16)}`
}
