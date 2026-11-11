// 실제 구글 시트 웹 앱 검사 — 시트에 '[테스트]' 줄이 생깁니다(검사 후 지워 주세요)
// GAS_URL=... STAFF_PIN=.... node tools/gas_live_check.mjs
const U = process.env.GAS_URL
const PIN = process.env.STAFF_PIN
if (!U || !PIN) throw new Error('GAS_URL, STAFF_PIN 필요')

const call = async (body) => {
  const t0 = Date.now()
  const r = await fetch(U, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
  const text = await r.text()
  let j
  try {
    j = JSON.parse(text)
  } catch {
    j = { raw: text.slice(0, 200) }
  }
  return { ms: Date.now() - t0, status: r.status, j }
}
const rows = []
const ok = (name, cond, detail) => rows.push({ 검사: name, 판정: cond ? 'OK' : 'XX', 내용: detail })
const stamp = Date.now().toString(36)
const dev = (n) => `zz-live-test-${stamp}-${n}`.padEnd(24, '0')

// 1) 등록
const survey = { sat: 5, understand: 4, best: ['물의 변화', '경진대회 작품'], fun: ['맑은 물 정수하기'], career: '많이' }
const r1 = await call({ action: 'register', device: dev(1), name: '[테스트]등록', phone: '00000001', who: '대학생', survey })
const t1 = r1.j.ticket
ok('등록 → 티켓 발급', t1 && t1.no > 0 && !t1.used_at, `${r1.ms}ms ${JSON.stringify(r1.j)}`)
const issued = t1 && new Date(t1.issued_at)
ok('발급시각이 지금(한국시각) 근처', issued && Math.abs(issued.getTime() - Date.now()) < 5 * 60e3, `${t1?.issued_at} / 지금 ${new Date().toISOString()}`)

// 2) 같은 기기 재등록 → 같은 티켓
const r2 = await call({ action: 'register', device: dev(1), name: '[테스트]다른이름', phone: '00000009', who: '일반', survey })
ok('같은 폰 재등록 = 같은 번호', r2.j.ticket?.no === t1?.no, `${r2.ms}ms no=${r2.j.ticket?.no}`)

// 3) 티켓 조회
const r3 = await call({ action: 'ticket', device: dev(1) })
ok('티켓 조회', r3.j.ticket?.no === t1?.no, `${r3.ms}ms`)

// 4) 잘못된 입력 막기
const r4 = await call({ action: 'register', device: dev(9), name: '[테스트]번호오류', phone: '12ab', who: '대학생', survey })
ok('휴대폰 형식 오류 거절', Boolean(r4.j.error), JSON.stringify(r4.j))

// 5) 지급 처리
const r5a = await call({ action: 'staff_use', pin: '0000x', device: dev(1) })
ok('틀린 스태프 번호 거절', r5a.j.result === 'badpin', JSON.stringify(r5a.j))
const r5 = await call({ action: 'staff_use', pin: PIN, device: dev(1) })
ok('지급 완료 처리', r5.j.result === 'ok', `${r5.ms}ms ${JSON.stringify(r5.j)}`)
const r6 = await call({ action: 'staff_use', pin: PIN, no: t1?.no })
ok('같은 티켓 다시 지급 → 이미 지급', r6.j.result === 'already', JSON.stringify(r6.j))
const r7 = await call({ action: 'ticket', device: dev(1) })
ok('지급시각 기록', Boolean(r7.j.ticket?.used_at), r7.j.ticket?.used_at)
const r8 = await call({ action: 'staff_use', pin: PIN, no: 999999 })
ok('없는 티켓 번호', r8.j.result === 'notfound', JSON.stringify(r8.j))

// 6) 동시에 5명 등록 → 번호 겹치지 않음
const many = await Promise.all([2, 3, 4, 5, 6].map((n) => call({ action: 'register', device: dev(n), name: `[테스트]동시${n}`, phone: `0000000${n}`, who: '중·고등학생', survey })))
const nos = many.map((m) => m.j.ticket?.no)
ok('동시 5명 등록 번호 안 겹침', nos.every(Boolean) && new Set(nos).size === 5, `${JSON.stringify(nos)} 최대 ${Math.max(...many.map((m) => m.ms))}ms`)

// 7) 스태프 목록
const r9 = await call({ action: 'staff_list', pin: PIN })
const mine = (r9.j.rows ?? []).filter((x) => String(x.name).startsWith('[테스트]'))
ok('스태프 목록 읽기', Array.isArray(r9.j.rows), `${r9.ms}ms 전체 ${r9.j.rows?.length}줄, 테스트 ${mine.length}줄`)
const one = mine.find((x) => x.no === t1?.no)
ok('목록 값(휴대폰·설문·지급)', one && one.phone === '00000001' && one.best === '물의 변화, 경진대회 작품' && one.sat === 5 && one.used_at, JSON.stringify(one))

console.table(rows)
console.log('테스트 줄 이름: [테스트]등록, [테스트]동시2~6')
