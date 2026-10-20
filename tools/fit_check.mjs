// 첫 화면이 여러 기종에서 '스크롤 없이 한 화면'인지 검사 + 캡처
// node tools/fit_intro.mjs http://localhost:5181/
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const URL = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/fit')
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

// [이름, 폭, 높이] — 높이는 브라우저 주소창을 뺀 실제 보이는 영역 기준
const DEVICES = [
  ['iPhone SE(1세대)', 320, 568],
  ['갤럭시 S8급', 360, 640],
  ['iPhone SE(2·3세대)', 375, 667],
  ['카톡 인앱(SE)', 375, 600],
  ['갤럭시 S20/A', 360, 740],
  ['갤럭시 S2x', 360, 780],
  ['iPhone 13 mini', 375, 812],
  ['iPhone 14/15', 390, 844],
  ['iPhone 15 Pro', 393, 852],
  ['갤럭시 S24+', 384, 832],
  ['갤럭시 울트라', 412, 915],
  ['iPhone Pro Max', 430, 932],
  ['폴드 커버', 344, 882],
]

// 검사할 화면(한 화면 고정 대상)
const STEPS = (process.argv[3] ?? 'intro,about,talent,partners').split(',')

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const rows = []
for (const step of STEPS)
for (const [name, w, h] of DEVICES) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(URL, { waitUntil: 'networkidle0' })
  await page.evaluate((step) => {
    localStorage.clear()
    if (step !== 'intro') localStorage.setItem('ecoup-docent-v1', JSON.stringify({ step, maxStep: 3 }))
  }, step)
  await page.reload({ waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 2200))
  const m = await page.evaluate(() => {
    const vh = innerHeight
    const main = document.querySelector('main')
    // 잘린 내용: main 또는 그 안 flex-1 영역에서 넘친 높이
    let clip = main.querySelector('[data-crop]') ? 0 : Math.max(0, main.scrollHeight - main.clientHeight)
    for (const el of main.querySelectorAll('.flex-1:not([data-crop])')) clip = Math.max(clip, el.scrollHeight - el.clientHeight)
    const btns = [...main.querySelectorAll('button')].filter((b) => b.offsetParent && b.getBoundingClientRect().height > 40)
    const btn = btns[btns.length - 1].getBoundingClientRect()
    const title = document.querySelector('h1').getBoundingClientRect()
    return {
      clip,
      scrollX: document.documentElement.scrollWidth - innerWidth,
      btnGap: Math.round(vh - btn.bottom),
      titleTop: Math.round(title.top),
      titlePx: Math.round(parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)),
      zoom: document.querySelector('[data-zoom]')?.dataset.zoom ?? '-',
    }
  })
  const ok = m.clip <= 1 && m.scrollX <= 0 && m.btnGap >= 10 && m.titleTop >= 4
  rows.push({ step, name, size: `${w}x${h}`, ok: ok ? 'OK' : 'XX', ...m })
  await page.screenshot({ path: path.join(OUT, `${step}_${String(rows.length).padStart(2, '0')}_${w}x${h}.png`) })
  await page.close()
}
await browser.close()
console.table(rows.filter((r) => r.ok !== 'OK' || (r.zoom !== '-' && Number(r.zoom) < 0.9)))
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
