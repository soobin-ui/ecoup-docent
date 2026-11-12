// 카메라 대신 스태프 번호 — 느린 서버(?mockdelay)에서 '확인 중' 표시·자동 확인·틀린 번호 점검
// node tools/pin_check.mjs [http://localhost:5181/]   (흉내 DB 의 스태프 번호 0000)
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
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'pin-check-device-0001', step: 'works', maxStep: 15, solved: [true, true, true], stamps: [true, false, false] }))
})
await page.goto(BASE + '?mockdelay=3000', { waitUntil: 'networkidle0' })
await sleep(1200)
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const clickText = (t) => page.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.includes(t))?.click(), t)
await clickText('QR코드 찍기')
await sleep(1500)
await clickText('스태프 확인')
await sleep(400)
const input = await page.$('input[type=password]')
// 틀린 번호
await input.type('1234')
await sleep(400)
expect('4자리 넣자마자 확인 중', await page.evaluate(() => document.body.innerText.includes('확인 중')), true)
expect('확인 중엔 버튼 잠김', await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('확인 중'))?.disabled), true)
await page.screenshot({ path: `${OUT}/1_checking.png` })
await sleep(3200)
expect('틀리면 안내', await page.evaluate(() => document.body.innerText.includes('스태프 번호가 맞지 않아요')), true)
expect('틀리면 칸 비움', await page.evaluate(() => document.querySelector('input[type=password]').value), '')
await page.screenshot({ path: `${OUT}/2_wrong.png` })
// 맞는 번호
await page.type('input[type=password]', '0000')
await sleep(3600)
expect('맞으면 스탬프 2 획득 화면', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'stamp2')
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
