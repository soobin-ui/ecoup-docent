// B1 — 물리·화학 둘 다 본 뒤 화면(다음으로 가기 버튼·물방울 말풍선) 캡처 + 버튼 동작 확인
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/b1check')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const errs = []
const page = await b.newPage()
page.on('pageerror', (e) => errs.push(e.message))
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'b1-both-device-0001', step: 'b1', maxStep: 6, solved: [true, false, false], stamps: [false, false, false] }))
})
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1000)
const click = async (t) => {
  await page.evaluate((t) => [...document.querySelectorAll('#b1-stage button')].find((x) => x.textContent.replace(/\s/g, '').includes(t))?.click(), t)
  await sleep(400)
}
await (await page.$$('section .grid > button'))[0].click()
await sleep(900)
for (let k = 0; k < 4; k++) await click('다음단계')
await sleep(600)
await page.screenshot({ path: `${OUT}/both_0_first_last.png` })
await click('화학적처리보기')
await sleep(900)
for (let k = 0; k < 3; k++) await click('다음단계')
await sleep(2500)
await page.screenshot({ path: `${OUT}/both_1_done.png` })
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.click())
await sleep(1200)
console.log('아래 다음 →', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step))
await b.close()
console.log('errors:', errs.length ? errs : 'none')
