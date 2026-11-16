// 세 종류의 물 버튼 · 물리/화학 단계 버튼 줄 — 390·320 캡처
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/pills')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const errs = []
for (const [w, h] of [
  [390, 844],
  [320, 640],
]) {
  const p = await b.newPage()
  p.on('pageerror', (e) => errs.push(e.message))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.goto(BASE, { waitUntil: 'networkidle0' })
  // 세 종류의 물(처음 들어온 상태)
  await p.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'pills-shot-device-0001', step: 'b2', maxStep: 7, solved: [true, false, false], stamps: [false, false, false] }))
    localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify({ 'b2-flip': [true, true, true, true], 'b2-tech': [true, true, true], 'b2-part': 2 }))
  })
  await p.reload({ waitUntil: 'networkidle0' })
  await sleep(1300)
  await p.evaluate(() => [...document.querySelectorAll('p')].find((x) => x.textContent.includes('세 종류의 물'))?.scrollIntoView({ block: 'start' }))
  await sleep(500)
  await p.screenshot({ path: `${OUT}/water_${w}.png` })
  // 물리적 처리 · 화학적 처리 단계 버튼
  await p.evaluate(() => {
    localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'pills-shot-device-0001', step: 'b1', maxStep: 6, solved: [true, false, false], stamps: [false, false, false] }))
    localStorage.setItem('ecoup-docent-draft-v2', '{}')
  })
  await p.reload({ waitUntil: 'networkidle0' })
  await sleep(1200)
  for (const k of [0, 1]) {
    await p.evaluate((k) => document.querySelectorAll('section .grid > button')[k].click(), k)
    await sleep(1200)
    await p.evaluate(() => document.getElementById('b1-stage')?.scrollIntoView({ block: 'start' }))
    await sleep(400)
    const rows = await p.evaluate(() => {
      const bs = [...document.querySelectorAll('#b1-stage button')].filter((x) => /^\d\./.test(x.textContent.trim()))
      const ys = [...new Set(bs.map((x) => Math.round(x.getBoundingClientRect().top)))]
      return ys.map((y) => bs.filter((x) => Math.round(x.getBoundingClientRect().top) === y).length).join('+')
    })
    console.log(w, k ? '화학' : '물리', '줄 구성', rows, '| 가로 넘침', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    await p.screenshot({ path: `${OUT}/b1_${k ? 'chem' : 'phys'}_${w}.png` })
  }
  await p.close()
}
await b.close()
console.log('errors', errs.length ? errs : 'none')
