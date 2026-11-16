// 대표 휴대폰 크기별로 주요 화면을 찍어 화면마다 한 장(기종을 나란히)으로 묶음
// node tools/device_sheet.mjs [http://localhost:5181/]
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/devices')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// [이름, 폭, 높이(주소창 뺀 보이는 영역)]
export const DEVICES = [
  ['갤럭시 S24', 360, 780],
  ['아이폰 SE', 375, 667],
  ['아이폰 15', 393, 852],
  ['갤럭시 S24 울트라', 412, 915],
  ['아이폰 15 프로맥스', 430, 932],
]
const SCREENS = [
  ['1_첫화면', 'intro', {}, null],
  ['2_참여방법', 'howto', {}, null],
  ['3_더러워진물', 'b1', {}, 'b1open'],
  ['4_세종류의물', 'b2', { 'b2-flip': [true, true, true, true], 'b2-tech': [true, true, true], 'b2-part': 2 }, 'top3'],
  ['5_마을물지도', 'c1', {}, 'c1'],
  ['6_티켓', 'ticket', {}, null],
]
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
for (const [name, w, h] of DEVICES) {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.goto(BASE, { waitUntil: 'networkidle0' })
  for (const [file, step, draft, act] of SCREENS) {
    await p.evaluate(
      (step, draft) => {
        localStorage.clear()
        const now = new Date().toISOString()
        localStorage.setItem(
          'ecoup-docent-v2',
          JSON.stringify({
            deviceId: 'device-sheet-device-01',
            step,
            maxStep: step === 'intro' ? 0 : 24,
            solved: [true, true, step !== 'c1'],
            stamps: step === 'ticket' ? [true, true, true] : [false, false, false],
            reg: { name: '홍길동', phone8: '12345678', who: '일반 (대학원생 포함)', consent: true },
            survey: {},
            ticket: step === 'ticket' ? { no: 12, issuedAt: now, usedAt: null } : null,
          }),
        )
        localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify(draft))
      },
      step,
      draft,
    )
    await p.reload({ waitUntil: 'networkidle0' })
    await sleep(1700)
    if (act === 'b1open') {
      await p.evaluate(() => document.querySelectorAll('section .grid > button')[0].click())
      await sleep(1300)
    }
    if (act === 'top3') await p.evaluate(() => [...document.querySelectorAll('p')].find((x) => x.textContent.includes('세 종류의 물'))?.scrollIntoView({ block: 'start' }))
    if (act === 'c1') {
      await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('생활하수'))?.click())
      await sleep(1500)
      await p.evaluate(() => [...document.querySelectorAll('p')].find((x) => x.textContent.includes('우리 마을 물 지도'))?.scrollIntoView({ block: 'start' }))
    }
    await sleep(600)
    await p.screenshot({ path: `${OUT}/${file}__${w}x${h}.png` })
  }
  await p.close()
}
await b.close()
console.log('ok')
