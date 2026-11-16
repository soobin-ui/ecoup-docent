// 2026-11-16 수정사항 미리보기 캡처 — 항목별 화면
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/fix1116')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const errs = []
async function open(step, draft = {}, query = '', extra = {}) {
  const p = await b.newPage()
  p.on('pageerror', (e) => errs.push(e.message))
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.goto(BASE, { waitUntil: 'networkidle0' })
  await p.evaluate(
    (step, draft, extra) => {
      localStorage.clear()
      localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'fix1116-shot-device-01', step, maxStep: 24, solved: [false, false, false], stamps: [false, false, false], ...extra }))
      localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify(draft))
    },
    step,
    draft,
    extra,
  )
  await p.goto(BASE + query, { waitUntil: 'networkidle0' })
  await sleep(1600)
  return p
}
const shot = async (p, name, full = false) => {
  await sleep(500)
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
}
const click = (p, t) => p.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.replace(/\s/g, '').includes(t))?.click(), t)

// 1) HOW TO
let p = await open('howto')
await shot(p, '01_howto', true)
// 2·6·7) 암호 힌트보기
for (const [k, step] of [
  [1, 'q1'],
  [2, 'q2'],
  [3, 'q3'],
]) {
  p = await open(step, {}, '', { solved: [k > 1, k > 2, false], stamps: [false, false, false] })
  await shot(p, `0${k + 1}_q${k}_before`)
  await click(p, '힌트보기')
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await shot(p, `0${k + 1}_q${k}_hint`)
}
// 3·4·5) 세 종류의 물
p = await open('b2', { 'b2-flip': [true, true, true, true], 'b2-tech': [true, true, true], 'b2-part': 2, 'b2-water': [true, true, true] }, '', { solved: [true, false, false] })
for (const w of ['자연수', '생활하수', '공장폐수']) {
  await p.evaluate((w) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().endsWith(w))?.click(), w)
  await sleep(900)
  await p.evaluate(() => [...document.querySelectorAll('p')].find((x) => x.textContent.includes('세 종류의 물'))?.scrollIntoView({ block: 'start' }))
  await shot(p, `05_water_${w}`)
}
// 8) 체험
p = await open('hands', {}, '', { solved: [true, true, true], stamps: [true, true, false] })
await shot(p, '08_hands')
// 9) 스탬프 3개 완성
p = await open('complete', {}, '', { solved: [true, true, true], stamps: [true, true, true] })
await sleep(1500)
await shot(p, '09_complete')
// 10) 로딩 — 스태프 화면(느린 서버 흉내 3초)
p = await b.newPage()
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto(BASE + '?mockdelay=3000#staff', { waitUntil: 'networkidle0' })
await sleep(800)
await p.type('input', '0000')
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('들어가기'))?.click())
await sleep(500)
await shot(p, '10_loading')
await b.close()
console.log('done', errs.length ? errs : 'no errors')
