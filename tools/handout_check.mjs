// 선물 지급 — 휴대폰에서 바로 처리 + 시트에는 뒤에서 기록(느린 서버·기록 실패·새로고침) 점검
// node tools/handout_check.mjs [http://localhost:5181/]   (개발 서버: .env.development.local 에 흉내 번호 0000 해시)
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/handout')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const errs = []

async function setup(withRow) {
  const page = await b.newPage()
  page.on('pageerror', (e) => errs.push(e.message))
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  const now = new Date().toISOString()
  await page.evaluate(
    (now, withRow) => {
      localStorage.clear()
      localStorage.setItem('ecoup-docent-localdb-v2', JSON.stringify(withRow ? [{ no: 1, issued_at: now, used_at: null, device_id: 'handout-check-0001', name: '테스트', phone: '010-0000-0000' }] : []))
      localStorage.setItem(
        'ecoup-docent-v2',
        JSON.stringify({ deviceId: 'handout-check-0001', step: 'ticket', maxStep: 24, solved: [true, true, true], stamps: [true, true, true], reg: { name: '테스트', phone8: '00000000', who: '일반', consent: true }, survey: {}, ticket: { no: 1, issuedAt: now, usedAt: null } }),
      )
    },
    now,
    withRow,
  )
  await page.goto(BASE + '?mockdelay=3000', { waitUntil: 'networkidle0' })
  await sleep(4000) // 화면 열 때 서버 확인(3초) 끝나길
  return page
}
async function openPin(page) {
  const btn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('지급 완료 처리')))
  const bx = await btn.boundingBox()
  await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2)
  await page.mouse.down()
  await sleep(1100)
  await page.mouse.up()
  await sleep(400)
}
const tk = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket)
const clickUse = (page) => page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '지급 완료')?.click())

// 1) 틀린 번호 → 바로 안내
let page = await setup(true)
await openPin(page)
await page.type('input[type=password]', '1234')
let t0 = Date.now()
await clickUse(page)
await page.waitForFunction(() => document.body.innerText.includes('스태프 번호가 맞지 않아요'), { timeout: 3000 }).catch(() => {})
expect('틀린 번호 → 1초 안 안내', Date.now() - t0 < 1000, true)
// 2) 맞는 번호 → 바로 받음, 시트 기록은 뒤에서
await page.type('input[type=password]', '0000')
t0 = Date.now()
await clickUse(page)
await page.waitForFunction(() => !!JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket.usedAt, { timeout: 3000 }).catch(() => {})
const ms = Date.now() - t0
expect('맞는 번호 → 1초 안 받음 처리', ms < 1000, true)
console.log('지급 처리까지', ms, 'ms')
await sleep(500)
expect('뒤에서 기록 중 표시', await page.evaluate(() => document.body.innerText.includes('지급 기록을 시트에 보내고 있어요')), true)
await page.screenshot({ path: `${OUT}/1_instant.png` })
await sleep(3500)
expect('시트(흉내 DB)에 지급 기록됨', await page.evaluate(() => !!JSON.parse(localStorage.getItem('ecoup-docent-localdb-v2'))[0].used_at), true)
expect('기록 끝나면 표시 사라짐', (await tk(page)).syncing, false)
await page.reload({ waitUntil: 'networkidle0' })
await sleep(4000)
expect('새로고침 후에도 받음 유지', !!(await tk(page)).usedAt, true)
await page.close()

// 3) 시트에 티켓이 없을 때(기록 실패) → 받음은 유지, 새로고침하면 실패 안내
page = await setup(false)
await openPin(page)
await page.type('input[type=password]', '0000')
await clickUse(page)
await sleep(600)
expect('기록 실패해도 받음은 바로', !!(await tk(page)).usedAt, true)
await page.reload({ waitUntil: 'networkidle0' })
await sleep(4500)
expect('새로고침 → 실패 안내', await page.evaluate(() => document.body.innerText.includes('시트에 지급 기록이 안 됐어요')), true)
expect('그래도 받음 유지(중복 수령 막음)', !!(await tk(page)).usedAt, true)
await page.screenshot({ path: `${OUT}/2_fail.png` })
await page.close()

await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
