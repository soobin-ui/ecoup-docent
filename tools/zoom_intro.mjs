// 배포본 첫 화면을 찍어 아래쪽(섬~물) 부분만 확대 저장
import puppeteer from 'puppeteer-core'
const URL = process.argv[2] ?? 'https://soobin-ui.github.io/ecoup-docent/?inframe'
const [W, H] = [Number(process.argv[3] ?? 390), Number(process.argv[4] ?? 844)]
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto(URL + (URL.includes('?') ? '&' : '?') + 'v=' + Date.now(), { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))
await p.screenshot({ path: 'tools/shots/live_intro.png' })
const info = await p.evaluate(() => {
  const v = document.querySelector('video').getBoundingClientRect()
  return { video: [Math.round(v.top), Math.round(v.bottom), Math.round(v.left), Math.round(v.right)], bundle: [...document.scripts].map((s) => s.src).find((s) => s.includes('index-'))?.split('/').pop() }
})
console.log(JSON.stringify(info))
await b.close()
