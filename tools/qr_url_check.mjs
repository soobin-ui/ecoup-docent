// 폰 기본 카메라로 스탬프 QR 을 찍어 주소(?s=코드)로 들어온 경우 검사
// node tools/qr_url_check.mjs http://localhost:5181/
import puppeteer from 'puppeteer-core'
const URL = process.argv[2] ?? 'http://localhost:5181/'
const CASES = [
  { name: '전시 투어 끝, 작품 QR', step: 'works', stamps: [1, 0, 0], s: 'CT3-CHACHA', want: { stamps: '■■□', step: 'stamp2' } },
  { name: '전시 투어 끝, 체험 QR(순서 아님)', step: 'works', stamps: [1, 0, 0], s: 'HS1-LED', want: { stamps: '■□□', step: 'works' } },
  { name: '전시 투어 전, 작품 QR', step: 'a1', stamps: [0, 0, 0], s: 'CT1-CWRS', want: { stamps: '□□□', step: 'a1' } },
  { name: '경진대회 끝, 체험 QR', step: 'hands', stamps: [1, 1, 0], s: 'HS2-FILTER', want: { stamps: '■■■', step: 'complete' } },
  { name: '경진대회 끝, 작품 QR 다시', step: 'hands', stamps: [1, 1, 0], s: 'CT5-BIOSPH', want: { stamps: '■■□', step: 'hands' } },
  { name: '등록 중, 작품 QR 다시', step: 'register', stamps: [1, 1, 1], s: 'CT2-REPASS', want: { stamps: '■■■', step: 'register' } },
  { name: '등록 중, 체험 QR 다시', step: 'register', stamps: [1, 1, 1], s: 'HS1-LED', want: { stamps: '■■■', step: 'register' } },
  { name: '없는 코드', step: 'works', stamps: [1, 0, 0], s: 'FAKE-CODE', want: { stamps: '■□□', step: 'works' } },
  { name: '처음 여는 폰, 작품 QR', step: null, stamps: null, s: 'CT1-CWRS', want: { stamps: '□□□', step: 'intro' } },
]
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const rows = []
let bad = 0
for (const c of CASES) {
  const page = await b.newPage()
  if (process.env.DESKTOP !== '1') await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  await page.goto(URL, { waitUntil: 'networkidle0' })
  await page.evaluate((c) => {
    localStorage.clear()
    if (c.step) localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'qr-url-test-device-0001', step: c.step, maxStep: 20, solved: [true, true, true], stamps: c.stamps.map(Boolean), reg: c.step === 'register' ? null : undefined }))
  }, c)
  await page.goto(`${URL}?s=${c.s}`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1200))
  const frame = page.frames().find((f) => f.url().includes('inframe')) ?? page.mainFrame()
  const got = await frame.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('ecoup-docent-v2') ?? 'null')
    return { stamps: (p?.stamps ?? [false, false, false]).map((s) => (s ? '■' : '□')).join(''), step: p?.step ?? 'intro', url: location.search.replace(/^\?inframe=?$/, '') }
  })
  const pass = got.stamps === c.want.stamps && got.step === c.want.step && got.url === ''
  if (!pass) bad++
  rows.push({ 경우: c.name, QR: c.s, 기대: `${c.want.stamps} ${c.want.step}`, 결과: `${got.stamps} ${got.step}`, 주소정리: got.url === '' ? 'O' : got.url, 판정: pass ? 'OK' : 'XX' })
  await page.close()
}
await b.close()
console.table(rows)
console.log(bad ? `문제 ${bad}건` : `전부 정상 (${rows.length}건)`)
