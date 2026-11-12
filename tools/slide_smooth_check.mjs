// B2 밀어서 비교 — 휴대폰 느린 CPU(4배 느리게)에서 손가락 밀기 동안 프레임이 얼마나 끊기는지 비교
// node tools/slide_smooth_check.mjs <주소1> [주소2 ...]
import puppeteer from 'puppeteer-core'
const urls = process.argv.slice(2)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
for (const url of urls) {
  const page = await b.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'slide-smooth-0001', step: 'b2', maxStep: 7, solved: [true, false, false], stamps: [false, false, false] }))
    localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify({ 'b2-flip': [true, true, true, true], 'b2-part': 1 }))
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(1500)
  const area = await page.$('.touch-pan-y.aspect-\\[3\\/2\\]')
  await area.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await sleep(500)
  const bx = await area.boundingBox()
  await page.emulateCPUThrottling(4)
  const cdp = await page.createCDPSession()
  await cdp.send('Performance.enable')
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]))
  await page.evaluate(() => {
    window.__f = []
    let last = performance.now()
    const loop = (t) => {
      window.__f.push(t - last)
      last = t
      if (window.__f.length < 400) requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  })
  const y = bx.y + bx.height / 2
  await page.touchscreen.touchStart(bx.x + bx.width * 0.1, y)
  for (let k = 0; k < 3; k++) {
    for (let i = 1; i <= 40; i++) await page.touchscreen.touchMove(bx.x + bx.width * (0.1 + 0.8 * (i / 40)), y + (i % 7) - 3)
    for (let i = 39; i >= 0; i--) await page.touchscreen.touchMove(bx.x + bx.width * (0.1 + 0.8 * (i / 40)), y + (i % 7) - 3)
  }
  await page.touchscreen.touchEnd()
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]))
  const d = (k) => ((m1[k] - m0[k]) * 1000).toFixed(0)
  console.log('   자바스크립트', d('ScriptDuration'), 'ms | 스타일 계산', d('RecalcStyleDuration'), 'ms | 배치 계산', d('LayoutDuration'), 'ms | 배치 횟수', m1.LayoutCount - m0.LayoutCount)
  const f = await page.evaluate(() => window.__f.slice(5))
  await page.emulateCPUThrottling(1)
  const slow = f.filter((d) => d > 34).length
  const avg = f.reduce((a, c) => a + c, 0) / f.length
  console.log(url, `| 프레임 ${f.length}개 평균 ${avg.toFixed(1)}ms | 끊김(34ms 넘는 프레임) ${slow}개 | 가장 긴 ${Math.max(...f).toFixed(0)}ms`)
  await page.close()
}
await b.close()
