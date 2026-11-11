// B1 카드+단계 그림 점검 — 자동으로 안 넘어가는지, 이전/다음/밀기, 마지막→다른 카드, 9단계 캡처, 다음→B2
// node tools/b1_check.mjs [http://localhost:5181/]
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/b1check')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
page.on('response', (r) => r.status() >= 400 && errs.push(`${r.status()} ${r.url()}`))
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'b1-check-device-0001', step: 'b1', maxStep: 6, solved: [true, false, false], stamps: [false, false, false] }))
})
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1200)
await page.screenshot({ path: `${OUT}/0_closed.png` })
const step = () => page.evaluate(() => document.querySelector('#b1-stage p.text-cyan')?.textContent.replace(/\s/g, ''))
const clickText = async (t) => {
  const ok = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('#b1-stage button')].find((x) => x.textContent.replace(/\s/g, '').includes(t))
    if (!el || el.disabled) return false
    el.click()
    return true
  }, t)
  await sleep(450)
  return ok
}
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
await (await page.$$('section .grid > button'))[0].click()
await sleep(1200)
expect('열자마자', await step(), '1/5')
await sleep(5000)
expect('5초 기다려도 그대로', await step(), '1/5')
expect('첫 단계 이전 막힘', String(await clickText('이전')), 'false')
// 단계마다 그림 캡처(확대·표시 끝난 뒤)
for (let k = 0; k < 5; k++) {
  if (k) await clickText('다음단계')
  await sleep(4000)
  await (await page.$('#b1-stage')).screenshot({ path: `${OUT}/p${k + 1}.png` })
}
expect('다음 단계 4번', await step(), '5/5')
expect('마지막 안내', await page.evaluate(() => document.querySelector('#b1-stage')?.textContent.includes('다른 처리 방법도 볼까요?')), true)
await clickText('이전')
expect('이전', await step(), '4/5')
const box = await (await page.$('#b1-stage .touch-pan-y')).boundingBox()
const swipe = async (from, to) => {
  await page.touchscreen.touchStart(box.x + box.width * from, box.y + box.height / 2)
  await page.touchscreen.touchMove(box.x + box.width * ((from + to) / 2), box.y + box.height / 2)
  await page.touchscreen.touchMove(box.x + box.width * to, box.y + box.height / 2)
  await page.touchscreen.touchEnd()
  await sleep(500)
}
await swipe(0.8, 0.2)
expect('손가락 왼쪽 밀기', await step(), '5/5')
await swipe(0.2, 0.8)
expect('손가락 오른쪽 밀기', await step(), '4/5')
await clickText('다음단계')
await clickText('화학적처리보기')
await sleep(900)
expect('마지막→화학적 처리', await step(), '1/4')
for (let k = 0; k < 4; k++) {
  if (k) await clickText('다음단계')
  await sleep(4000)
  await (await page.$('#b1-stage')).screenshot({ path: `${OUT}/c${k + 1}.png` })
}
expect('두 카드 다 본 안내', await page.evaluate(() => document.querySelector('#b1-stage')?.textContent.includes('두 가지 처리를 모두 봤어요')), true)
expect('체크 2개', await page.evaluate(() => document.querySelectorAll('section .grid > button svg').length >= 4), true)
// 아래 '다음' → B2
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.click())
await sleep(1200)
expect('다음 → B2', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'b2')
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
