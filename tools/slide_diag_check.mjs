// B2 밀어서 비교 — 손가락이 비스듬히(위아래로 흔들리며) 움직일 때 중간에 끊기는지 + 화면 다시 그리기 횟수
// node tools/slide_diag_check.mjs <주소1> [주소2 ...]
import puppeteer from 'puppeteer-core'
const urls = process.argv.slice(2)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
for (const url of urls) {
  const res = []
  for (const tilt of [0, 25, 60]) {
    const page = await b.newPage()
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'slide-diag-0001', step: 'b2', maxStep: 7, solved: [true, false, false], stamps: [false, false, false] }))
      localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify({ 'b2-flip': [true, true, true, true], 'b2-part': 1 }))
    })
    await page.reload({ waitUntil: 'networkidle0' })
    await sleep(1500)
    const area = await page.$('.touch-pan-y.aspect-\\[3\\/2\\]')
    await area.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await sleep(500)
    const bx = await area.boundingBox()
    // 처리 후 그림의 style 이 몇 번 바뀌는지(=화면 다시 그리기) 셈
    await page.evaluate(() => {
      window.__m = 0
      const img = document.querySelectorAll('.touch-pan-y.aspect-\\[3\\/2\\] img')[1]
      new MutationObserver((l) => (window.__m += l.length)).observe(img.parentElement, { attributes: true, subtree: true, childList: true, characterData: true })
    })
    const y0 = bx.y + bx.height / 2
    const sx = bx.x + bx.width * 0.12 // 손잡이에서 시작
    await page.touchscreen.touchStart(sx, y0)
    const N = 30
    for (let i = 1; i <= N; i++) await page.touchscreen.touchMove(sx + bx.width * 0.8 * (i / N), y0 + tilt * (i / N))
    await page.touchscreen.touchEnd()
    await sleep(500)
    const r = await page.evaluate(() => {
      const img = document.querySelectorAll('.touch-pan-y.aspect-\\[3\\/2\\] img')[1]
      const m = (img.style.clipPath || getComputedStyle(img).clipPath).match(/inset\(0(?:px)? ([\d.]+)%/)
      return { covered: m ? Math.round(100 - Number(m[1])) : -1, muts: window.__m }
    })
    res.push(`위아래 ${tilt}px: 끝까지 ${r.covered}% (DOM 변경 ${r.muts}번)`)
    await page.close()
  }
  console.log(url, '\n  ' + res.join('\n  '))
}
await b.close()
