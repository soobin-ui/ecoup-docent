// 배포 사이트 전 화면 열어 보기(시트에 쓰지 않음) — 빠진 파일(404)·콘솔 오류·가로 넘침·느린 첫 화면 확인
// node tools/live_smoke.mjs https://soobin-ui.github.io/ecoup-docent/
import puppeteer from 'puppeteer-core'
const URL = process.argv[2] ?? 'https://soobin-ui.github.io/ecoup-docent/'
const STEPS = ['intro', 'howto', 'about', 'partners', 'a1', 'q1', 'b1', 'b2', 'q2', 'c1', 'c2', 'q3', 'stamp1', 'water', 'contest', 'works', 'stamp2', 'hands', 'complete', 'register', 'survey']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.setCacheEnabled(false)
const bad = []
const errs = []
page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`))
page.on('requestfailed', (r) => bad.push(`실패 ${r.url()} ${r.failure()?.errorText}`))
page.on('pageerror', (e) => errs.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))

const t0 = Date.now()
await page.goto(URL + '?v=' + Date.now(), { waitUntil: 'networkidle0' })
const firstLoad = Date.now() - t0
const bundle = await page.evaluate(() => [...document.scripts].map((s) => s.src).find((s) => s.includes('index-'))?.split('/').pop())
const video = await page.evaluate(async () => {
  await new Promise((r) => setTimeout(r, 1500))
  const v = document.querySelector('video')
  return v ? { playing: !v.paused, ready: v.readyState } : null
})
const over = []
for (const step of STEPS) {
  await page.evaluate((step) => {
    localStorage.clear()
    localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'live-smoke-readonly-0001', step, maxStep: 21, solved: [true, true, true], stamps: [true, true, step === 'complete'] }))
  }, step)
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(500)
  const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (o > 0) over.push(`${step} ${o}px`)
}
// 스캐너용 QR 판독기·그림 글자 파일
const jsqr = await page.evaluate(async () => (await fetch('./vendor/jsQR.js')).status)
await b.close()
console.log('배포 번들', bundle, '· 첫 화면 로딩', firstLoad + 'ms')
console.log('첫 화면 영상', JSON.stringify(video))
console.log('QR 판독기 파일', jsqr)
console.log('화면', STEPS.length + '개', over.length ? '가로 넘침: ' + over.join(', ') : '가로 넘침 없음')
console.log(bad.length ? '빠진/실패 파일:\n' + [...new Set(bad)].join('\n') : '빠진 파일 없음')
console.log(errs.length ? '콘솔 오류:\n' + [...new Set(errs)].join('\n') : '콘솔 오류 없음')
