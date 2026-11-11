// B2 화면 3개(미생물 도감 → 미래 기술 밀어 비교 → 세 종류의 물) 점검 + 캡처
// node tools/b2_check.mjs [http://localhost:5181/]
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/b2check')
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
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'b2-check-device-0001', step: 'b2', maxStep: 7, solved: [true, false, false], stamps: [false, false, false] }))
})
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1300)
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const has = (t) => page.evaluate((t) => document.body.innerText.includes(t), t)
const clickExact = (t) => page.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t)?.click(), t)
const part = () => page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-draft-v2') || '{}')['b2-part'] ?? 0)

await page.screenshot({ path: `${OUT}/1_microbes.png` })
const nextDisabled = () => page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.disabled)
expect('화면1: 다음 잠김', await nextDisabled(), true)
expect('화면1: 안내 0/4', await has('미생물 4장을 모두 뒤집으면 넘어갈 수 있어요 (0/4)'), true)

const cards = await page.$$('button[aria-label*="카드"]')
expect('미생물 카드 4장', cards.length, 4)
for (const [k, c] of cards.entries()) {
  await c.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await c.click()
  await sleep(700)
  if (k === 1) await page.screenshot({ path: `${OUT}/2_flip_back.png` })
}
expect('질산화·탈질 새 문구', await has('물속 질소를 기체로 바꿔 날려 보내요'), true)
expect('4장 다 뒤집으면 다음 풀림', await nextDisabled(), false)
await page.screenshot({ path: `${OUT}/2b_all_flipped.png` })
await sleep(3500)
expect('기다려도 자동으로 안 넘어감', await part(), 0)
await clickExact('다음')
await sleep(900)
expect('다음 누르면 화면2', await part(), 1)
await page.screenshot({ path: `${OUT}/3_tech.png` })
expect('화면2: 다음 잠김', await nextDisabled(), true)
expect('화면2: 안내 0/3', await has('3가지 기술을 모두 밀어 보면 넘어갈 수 있어요 (0/3)'), true)

const techs = ['MBR', 'RO 분리막', 'UV 소독']
for (let k = 0; k < 3; k++) {
  await page.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().endsWith(t))?.click(), techs[k])
  await sleep(500)
  const area = await page.$('.touch-pan-y.aspect-\\[3\\/2\\]')
  const bx = await area.boundingBox()
  const y = bx.y + bx.height / 2
  await page.touchscreen.touchStart(bx.x + bx.width * 0.12, y)
  for (const f of [0.3, 0.5, 0.7]) await page.touchscreen.touchMove(bx.x + bx.width * f, y)
  if (k === 1) {
    await sleep(200)
    await page.screenshot({ path: `${OUT}/4_slide_mid.png` })
  }
  await page.touchscreen.touchMove(bx.x + bx.width * 0.95, y)
  await page.touchscreen.touchEnd()
  await sleep(1100)
}
expect('세 기술 다 밀면 다음 풀림', await nextDisabled(), false)
await sleep(3500)
expect('기다려도 자동으로 안 넘어감(화면2)', await part(), 1)
await clickExact('다음')
await sleep(900)
expect('다음 누르면 화면3', await part(), 2)
expect('화면3: 다음 잠김(1/3)', await nextDisabled(), true)
expect('화면3: 안내 1/3', await has('세 가지 물을 모두 눌러 보면 넘어갈 수 있어요 (1/3)'), true)
await clickExact('생활하수')
await sleep(1000)
await page.screenshot({ path: `${OUT}/5_flow.png` })
expect('생활하수 → 재이용수', await has('생활하수 → 재이용수'), true)
expect('화면3: 2/3 아직 잠김', await nextDisabled(), true)
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().endsWith('공장폐수'))?.click())
await sleep(900)
expect('세 가지 물 다 보면 다음 풀림', await nextDisabled(), false)
await page.screenshot({ path: `${OUT}/6_flow_done.png` })
// 위 표시에서 화면1 다시 보기 → 화면3 으로 돌아오기
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('미생물 처리') && x.textContent.trim().startsWith('1'))?.click())
await sleep(700)
expect('1번 표시 누르면 화면1', await part(), 0)
expect('화면1 다시 볼 땐 다음 풀려 있음', await nextDisabled(), false)
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('3'))?.click())
await sleep(700)
// 새로고침해도 화면3 유지
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1200)
expect('새로고침 후 화면3 유지', await part(), 2)
await clickExact('다음')
await sleep(1200)
expect('다음 → 암호 2', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'q2')
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
