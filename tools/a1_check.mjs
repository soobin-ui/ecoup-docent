// A1 '물속 오염물질 5가지 돋보기 찾기' 점검 + 캡처
// node tools/a1_check.mjs [http://localhost:5181/]
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/a1check')
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
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'a1-check-device-0001', step: 'a1', maxStep: 4, solved: [false, false, false], stamps: [false, false, false] }))
})
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1300)
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const has = (t) => page.evaluate((t) => document.body.innerText.includes(t), t)
const nextDisabled = () => page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.disabled)
expect('처음엔 다음 잠김', await nextDisabled(), true)
expect('안내 0/5', await has('5가지를 모두 찾으면 넘어갈 수 있어요 (0/5)'), true)
// 그림이 화면에 오게
await page.evaluate(() => document.querySelector('img[alt^="확대한 흙탕물"]')?.scrollIntoView({ block: 'center' }))
await sleep(600)
await page.screenshot({ path: `${OUT}/1_start.png` })
const spots = await page.$$('button[aria-label^="오염물질"]')
expect('돋보기 5개', spots.length, 5)
const names = ['부유물질', '유기물', '영양염류', '화학 오염물질', '병원성 미생물']
for (let k = 0; k < 5; k++) {
  const btn = await page.$(`button[aria-label="오염물질 ${k + 1} 찾기"]`)
  await btn.click()
  await sleep(500)
  if (k === 1) await page.screenshot({ path: `${OUT}/2_two_found.png` })
}
expect('이름표 5개 붙음', await page.evaluate((names) => names.every((n) => [...document.querySelectorAll('button')].some((x) => x.getAttribute('aria-label') === n)), names), true)
expect('모두 찾았어요', await has('모두 찾았어요!'), true)
expect('설명(병원성 미생물)', await has('위생 문제나 병을 일으켜요'), true)
expect('다 찾으면 다음 풀림', await nextDisabled(), false)
await sleep(400)
await page.screenshot({ path: `${OUT}/3_all_found.png` })
// 이름표가 그림 밖으로 안 나가는지
const clip = await page.evaluate(() => {
  const box = document.querySelector('img[alt^="확대한 흙탕물"]').getBoundingClientRect()
  return [...document.querySelectorAll('button[aria-label]')]
    .filter((x) => ['부유물질', '유기물', '영양염류', '화학 오염물질', '병원성 미생물'].includes(x.getAttribute('aria-label')))
    .filter((x) => {
      const r = x.getBoundingClientRect()
      return r.left < box.left || r.right > box.right
    }).length
})
expect('이름표 그림 밖 넘침 없음', clip, 0)
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1200)
expect('새로고침 후에도 풀림', await nextDisabled(), false)
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음')?.click())
await sleep(1200)
expect('다음 → 암호 1', await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step), 'q1')
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
