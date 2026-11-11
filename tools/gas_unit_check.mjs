// gas/Code.gs 단위 검사(가짜 구글 환경) — node tools/gas_unit_check.mjs
import { makeGas } from './gas_sim.mjs'
const { call, sheets } = makeGas()
const rows = []
const ok = (n, c, d = '') => rows.push({ 검사: n, 판정: c ? 'OK' : 'XX', 내용: d })
const sv = { sat: 5, understand: 3, best: ['물의 이해'], fun: ['=HYPERLINK("x")'], career: '많이' }
const reg = (i, name = `사람${i}`) => call({ action: 'register', device: `device-${i}`.padEnd(20, '0'), name, phone: '1234567' + (i % 10), who: '대학생', survey: sv })
for (let i = 1; i <= 4; i++) reg(i)
const sh = sheets['참가자']
// 가운데 줄(2번 티켓) 삭제 → 다음 번호는 5여야 함(4가 겹치면 안 됨)
sh.rows.splice(2, 1)
const t5 = reg(5).ticket
ok('가운데 줄 지운 뒤 번호 안 겹침', t5.no === 5, `새 번호 ${t5.no}`)
// 전부 지우면 1부터
sh.rows.splice(1)
ok('테스트 줄 전부 지우면 1번부터', reg(6).ticket.no === 1)
// 수식 실행 막기
reg(7, '=IMPORTXML("http://x","//a")')
const last = sh.rows[sh.rows.length - 1]
ok('이름 수식 → 글자로 저장', String(last[2]).startsWith("'="), last[2])
ok('설문 수식 → 글자로 저장', String(last[8]).startsWith("'="), last[8])
// 만족도 이상값
call({ action: 'register', device: 'device-x'.padEnd(20, '0'), name: '이상값', phone: '11112222', who: '대학생', survey: { sat: 99, understand: -1 } })
const lx = sh.rows[sh.rows.length - 1]
ok('만족도 1~5 밖 값 버림', lx[5] === '' && lx[6] === '', `${lx[5]}|${lx[6]}`)
// 스태프 목록에 이름·번호 없음
const list = call({ action: 'staff_list', pin: '0000' }).rows
ok('스태프 목록에 개인정보 없음', list.length > 0 && list.every((r) => Object.keys(r).join() === 'no,issued_at,used_at'), JSON.stringify(list[0]))
// 지급
ok('지급 처리', call({ action: 'staff_use', pin: '0000', no: 1 }).result === 'ok')
ok('중복 지급 막기', call({ action: 'staff_use', pin: '0000', no: 1 }).result === 'already')
console.table(rows)
