// 등록 순간 인터넷이 끊겼을 때: 임시 티켓 → 연결 회복 후 티켓 화면에서 자동 재전송되는지
// node tools/offline_check.mjs http://localhost:5182/ http://localhost:5199/
import puppeteer from 'puppeteer-core'
const URL = process.argv[2] ?? 'http://localhost:5182/'
const GAS = process.argv[3] ?? 'http://localhost:5199/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
let block = true
await page.setRequestInterception(true)
page.on('request', (r) => (block && r.url().startsWith(GAS) ? r.abort('internetdisconnected') : r.continue()))

await page.goto(URL, { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('ecoup-docent-v2', JSON.stringify({
    deviceId: 'offline-test-device-' + Date.now().toString(36),
    step: 'survey', maxStep: 20, solved: [true, true, true], stamps: [true, true, true],
    reg: { name: '오프라인테스트', phone8: '55556666', who: '일반 (대학원생 포함)', consent: true },
    survey: { sat: 4, understand: 4, best: ['물의 이해'], fun: ['맑은 물 정수하기'], career: '조금' },
  }))
  localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify({ survey: { sat: 4, understand: 4, best: ['물의 이해'], fun: ['맑은 물 정수하기'], career: '조금' } }))
})
await page.reload({ waitUntil: 'networkidle0' })
await sleep(800)
await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '등록 완료').click())
await sleep(2500)
const off = await page.evaluate(() => ({ text: document.body.innerText.includes('임시 티켓'), no: document.body.innerText.includes('임시'), t: JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket }))
console.log('1) 끊긴 상태에서 등록 →', off.text ? 'OK 임시 티켓 표시' : 'XX', JSON.stringify(off.t))

block = false
await sleep(12000) // 다시 열지 않고 그 화면에 그대로 있어도 자동 재시도로 정식 티켓이 되어야 함
const on = await page.evaluate(() => ({ t: JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket, txt: document.body.innerText.match(/No\. \d+/)?.[0] }))
console.log('2) 연결 회복 후 그 화면 그대로 →', on.t && on.t.no > 0 && !on.t.offline ? `OK 정식 티켓 ${on.txt}` : 'XX', JSON.stringify(on.t))
await b.close()
