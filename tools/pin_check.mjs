// 카메라 대신 스태프 번호 — 휴대폰에서 바로 확인 + 5번 틀리면 1분 잠금 점검
// node tools/pin_check.mjs [http://localhost:5181/]   (개발 서버 흉내 DB 의 스태프 번호 0000)
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/pincheck')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const clickText = (t) => page.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.includes(t))?.click(), t)
const has = (t) => page.evaluate((t) => document.body.innerText.includes(t), t)
async function openPin(stamps) {
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate((stamps) => {
    localStorage.clear()
    localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'pin-check-device-0001', step: 'works', maxStep: 15, solved: [true, true, true], stamps }))
  }, stamps)
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(1000)
  await clickText('QR코드 찍기')
  await sleep(1200)
  await clickText('스태프 확인')
  await sleep(300)
}
const type = async (v) => {
  await page.type('input[type=password]', v)
}

// 1) 맞는 번호 — 바로 스탬프
await openPin([true, false, false])
const t0 = Date.now()
await type('0000')
await page.waitForFunction(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step === 'stamp2', { timeout: 5000 }).catch(() => {})
const ms = Date.now() - t0
expect('맞는 번호 → 스탬프 2', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'stamp2')
expect('걸린 시간 1초 안', ms < 1000, true)
console.log('맞는 번호 → 스탬프까지', ms, 'ms')

// 2) 틀린 번호 5번 → 1분 잠금
await openPin([true, false, false])
for (let k = 1; k <= 4; k++) {
  await type(String(1110 + k))
  await sleep(250)
}
expect('4번 틀림: 안내', await has('스태프 번호가 맞지 않아요'), true)
await page.screenshot({ path: `${OUT}/1_wrong.png` })
await type('1115')
await sleep(400)
expect('5번째: 잠금 안내', await has('여러 번 틀려서 1분 동안 넣을 수 없어요'), true)
expect('잠기면 입력칸 막힘', await page.evaluate(() => document.querySelector('input[type=password]').disabled), true)
await page.screenshot({ path: `${OUT}/2_locked.png` })
// 새로고침해도 잠금 유지
await page.reload({ waitUntil: 'networkidle0' })
await sleep(800)
await clickText('QR코드 찍기')
await sleep(1200)
await clickText('스태프 확인')
await sleep(1300)
expect('새로고침 후에도 잠김', await page.evaluate(() => document.querySelector('input[type=password]').disabled), true)
expect('남은 초 표시', await page.evaluate(() => /초 뒤에 다시/.test(document.querySelector('input[type=password]').placeholder)), true)
// 잠금 시간이 지나면 다시 됨(시계 앞당김 대신 저장값을 지난 시각으로)
await page.evaluate(() => localStorage.setItem('ecoup-docent-pinlock', JSON.stringify({ fails: 0, until: Date.now() - 1 })))
await sleep(1300)
expect('1분 지나면 다시 입력 가능', await page.evaluate(() => document.querySelector('input[type=password]').disabled), false)
await type('0000')
await sleep(600)
expect('풀린 뒤 맞는 번호 → 스탬프', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'stamp2')
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
