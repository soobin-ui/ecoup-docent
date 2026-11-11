// C1 '우리 마을 물 지도' 점검 + 캡처
// node tools/c1_check.mjs [http://localhost:5181/]
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/c1check')
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
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'c1-check-device-0001', step: 'c1', maxStep: 9, solved: [true, true, false], stamps: [false, false, false] }))
})
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1300)
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const has = (t) => page.evaluate((t) => document.body.innerText.includes(t), t)
const nextDisabled = () => page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.disabled)
const click = (t) => page.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().endsWith(t))?.click(), t)
expect('처음엔 다음 잠김', await nextDisabled(), true)
expect('안내 0/3', await has('세 가지 물을 모두 눌러 보면 넘어가요 (0/3)'), true)
await page.evaluate(() => document.querySelector('img[alt^="정수장을 가운데"]')?.scrollIntoView({ block: 'center' }))
await sleep(500)
await page.screenshot({ path: `${OUT}/1_start.png` })
const srcs = ['자연수', '생활하수', '공장폐수']
const uses = [
  ['수돗물', '농업용수', '산업용수', '하천유지용수'],
  ['공원·조경용수', '화장실 세정수', '도로 청소용수', '산업용 냉각수'],
  ['공정 세척수', '냉각수', '공업용수', '고순도 공정용수'],
]
for (let k = 0; k < 3; k++) {
  await click(srcs[k])
  await sleep(1800)
  await page.screenshot({ path: `${OUT}/${k + 2}_${srcs[k]}.png` })
  expect(`${srcs[k]}: 이름표 4개`, await page.evaluate((u) => u.every((t) => [...document.querySelectorAll('span')].some((s) => s.textContent.trim() === t)), uses[k]), true)
  expect(`${srcs[k]}: 물길 그려짐`, await page.evaluate(() => document.querySelectorAll('svg path.flow-dash').length > 0), true)
  // 이름표가 지도 밖으로 안 나가는지
  const out = await page.evaluate(() => {
    const box = document.querySelector('img[alt^="정수장을 가운데"]').getBoundingClientRect()
    return [...document.querySelectorAll('img[alt^="정수장을 가운데"] ~ span.absolute')].filter((s) => {
      const r = s.getBoundingClientRect()
      return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1
    }).length
  })
  expect(`${srcs[k]}: 이름표 넘침 없음`, out, 0)
}
expect('세 가지 다 → 다음 풀림', await nextDisabled(), false)
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1200)
expect('새로고침 후에도 풀림', await nextDisabled(), false)
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.click())
await sleep(1200)
expect('다음 → C2', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'c2')
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
