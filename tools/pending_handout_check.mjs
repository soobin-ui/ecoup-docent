// 티켓 번호가 오기 전(발급 중·임시)에 선물을 먼저 지급해도 → 번호가 와도 '받음' 유지 + 시트에 지급 기록되는지
// node tools/pending_handout_check.mjs http://localhost:5182/ http://localhost:5199/   (가짜 시트 서버, 흉내 번호 0000 해시)
import puppeteer from 'puppeteer-core'
const URL = process.argv[2] ?? 'http://localhost:5182/'
const GAS = process.argv[3] ?? 'http://localhost:5199/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
let block = true
await page.setRequestInterception(true)
page.on('request', (r) => (block && r.url().startsWith(GAS) ? r.abort('internetdisconnected') : r.continue()))
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
await page.goto(URL, { waitUntil: 'networkidle0' })
const dev = 'pending-handout-' + Date.now().toString(36).padStart(10, '0')
await page.evaluate((dev) => {
  localStorage.clear()
  localStorage.setItem(
    'ecoup-docent-v2',
    JSON.stringify({ deviceId: dev, step: 'survey', maxStep: 23, solved: [true, true, true], stamps: [true, true, true], reg: { name: '먼저지급', phone8: '56785678', who: '일반 (대학원생 포함)', consent: true } }),
  )
  localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify({ survey: { sat: 5, understand: 4, best: ['물의 변화'], fun: ['맑은 물 정수하기'], career: '많이' } }))
}, dev)
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1000)
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '등록 완료')?.click())
await sleep(1500)
expect('끊긴 상태: 번호 없음(임시)', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket.no), 0)
// 번호 오기 전에 선물 지급
const btn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('지급 완료 처리')))
const bx = await btn.boundingBox()
await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2)
await page.mouse.down()
await sleep(1100)
await page.mouse.up()
await sleep(400)
await page.type('input[type=password]', '0000')
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '지급 완료')?.click())
await sleep(600)
expect('번호 전에 지급 → 바로 받음', !!(await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket.usedAt)), true)
// 연결 회복 → 번호 받기 + 지급 기록
block = false
await sleep(16000)
const t = await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket)
expect('연결 후 번호 받음', t.no > 0, true)
expect('번호 받아도 받음 유지', !!t.usedAt, true)
expect('화면도 받음 표시', await page.evaluate(() => document.body.innerText.includes('선물을')), true)
// 시트(가짜 서버)에 지급 기록이 됐는지
const srv = await (await fetch(GAS, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'ticket', device: dev }) })).json()
expect('시트에도 지급 기록', !!srv.ticket?.used_at, true)
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
