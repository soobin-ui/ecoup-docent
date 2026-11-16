// 11/16 2차 수정 미리보기 — 힌트 글자·정답 문구·자연수 힌트·C1 버튼·C2 번호, 다크 모드(크롬 강제 어둡게 + 다크 설정)
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/fix1116b')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const errs = []
async function run(dark) {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: dark ? ['--force-dark-mode', '--enable-features=WebContentsForceDark'] : [],
  })
  const open = async (step, extra = {}, draft = {}) => {
    const p = await b.newPage()
    p.on('pageerror', (e) => errs.push(e.message))
    if (dark) await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    await p.goto(BASE, { waitUntil: 'networkidle0' })
    await p.evaluate(
      (step, extra, draft) => {
        localStorage.clear()
        localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'fix1116b-shot-device-1', step, maxStep: 24, solved: [false, false, false], stamps: [false, false, false], ...extra }))
        localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify(draft))
      },
      step,
      extra,
      draft,
    )
    await p.reload({ waitUntil: 'networkidle0' })
    await sleep(1500)
    return p
  }
  const tag = dark ? 'dark_' : ''
  if (!dark) {
    let p = await open('q1')
    await p.screenshot({ path: `${OUT}/1_q1_card.png` })
    // 정답 → 축하 화면
    await p.type('input[aria-label="정답 입력"]', '병원성')
    await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('정답 확인'))?.click())
    await sleep(2200)
    await p.screenshot({ path: `${OUT}/2_q1_correct.png` })
    p = await open('q3', { solved: [true, true, false] })
    await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('힌트보기'))?.click())
    await sleep(500)
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await sleep(400)
    await p.screenshot({ path: `${OUT}/3_q3_hint.png` })
    p = await open('c1', { solved: [true, true, false] })
    await p.evaluate(() => [...document.querySelectorAll('p')].find((x) => x.textContent.includes('우리 마을 물 지도'))?.scrollIntoView({ block: 'start' }))
    await sleep(500)
    await p.screenshot({ path: `${OUT}/4_c1.png` })
    p = await open('c2', { solved: [true, true, false] })
    await p.screenshot({ path: `${OUT}/5_c2.png` })
  }
  for (const [step, extra] of [
    ['howto', {}],
    ['register', { solved: [true, true, true], stamps: [true, true, true] }],
    ['b2', { solved: [true, false, false] }],
  ]) {
    const p = await open(step, extra)
    await p.screenshot({ path: `${OUT}/${tag}6_${step}.png` })
  }
  await b.close()
}
await run(false)
await run(true)
console.log('done', errs.length ? errs : 'no errors')
