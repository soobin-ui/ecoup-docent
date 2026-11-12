// 스탬프 QR 7장 + 관계없는 QR 2장을 앱 스캐너로 실제로 찍어 보는 검사
// 각 QR 마다 그 QR 만 비추는 가짜 카메라로 크롬을 띄우고, 경진대회·체험 화면에서 각각 'QR코드 찍기'
// node tools/qr_scan_check.mjs http://localhost:5181/
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const URL = process.argv[2] ?? 'http://localhost:5181/'
const QRS = ['CONTEST', 'HANDS', 'CT1-CWRS', 'CT2-REPASS', 'CT3-CHACHA', 'CT4-EKKONG', 'CT5-BIOSPH', 'HS1-LED', 'HS2-FILTER', '_START', '_OTHER']
const SCREENS = [
  { step: 'works', stamps: [true, false, false], ok: '경진대회 스탬프 획득', accept: (q) => q.startsWith('CT') || q === 'CONTEST' },
  { step: 'hands', stamps: [true, true, false], ok: '스탬프 3개 완성', accept: (q) => q.startsWith('HS') || q === 'HANDS' },
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rows = []
let bad = 0

for (const q of QRS) {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${path.resolve(`tools/fixtures/scan/${q}.y4m`)}`],
  })
  for (const sc of SCREENS) {
    const page = await browser.newPage()
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
    await page.goto(URL, { waitUntil: 'networkidle0' })
    await page.evaluate((sc) => {
      localStorage.clear()
      localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'qr-scan-test-device-0001', step: sc.step, maxStep: 20, solved: [true, true, true], stamps: sc.stamps }))
    }, sc)
    await page.reload({ waitUntil: 'networkidle0' })
    await sleep(800)
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('QR코드 찍기')).click())
    // 최대 8초 — 스탬프가 찍히거나, '이 스탬프용이 아니에요' 가 뜨면 끝
    let res = '반응 없음'
    for (let i = 0; i < 32; i++) {
      await sleep(250)
      const t = await page.evaluate(() => document.body.innerText)
      if (t.includes(sc.ok)) {
        res = '스탬프 찍힘'
        break
      }
      if (t.includes('이 QR은 이 스탬프용이 아니에요')) {
        res = '거절(다른 QR 안내)'
        await sleep(1500) // 거절 뒤에도 잘못 찍히지 않는지 더 지켜봄
        if ((await page.evaluate(() => document.body.innerText)).includes(sc.ok)) res = '거절 후 잘못 찍힘!'
        break
      }
    }
    const stampsNow = await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).stamps)
    const should = sc.accept(q)
    const pass = should ? res === '스탬프 찍힘' : res.startsWith('거절') && res !== '거절 후 잘못 찍힘!'
    if (!pass) bad++
    rows.push({ QR: q, 화면: sc.step === 'works' ? '경진대회' : '체험', 기대: should ? '찍혀야 함' : '안 찍혀야 함', 결과: res, 스탬프: stampsNow.map((s) => (s ? '■' : '□')).join(''), 판정: pass ? 'OK' : 'XX' })
    await page.close()
  }
  await browser.close()
}
console.table(rows)
console.log(bad ? `문제 ${bad}건` : `전부 정상 (${rows.length}건)`)
