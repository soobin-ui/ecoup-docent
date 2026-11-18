// go-live 다크 모드 확인(실제 사이트, 쓰기 없음): 휴대폰 다크(prefers-color-scheme: dark)+크롬 강제 다크, 삼성 UA 에선 보정 꺼짐
import puppeteer from 'puppeteer-core'
const URL = 'https://soobin-ui.github.io/ecoup-docent/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const cases = [
  ['크롬·카톡(다크+강제 어둡게)', ['--force-dark-mode', '--enable-features=WebContentsForceDark'], null],
  ['아이폰 사파리처럼(다크 신호만)', [], 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'],
  ['삼성 인터넷(UA) — 보정 꺼져야', [], 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/31.0 Chrome/148.0.0.0 Mobile Safari/537.36'],
]
for (const [name, args, ua] of cases) {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args })
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  if (ua) await p.setUserAgent(ua)
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
  const lums = []
  for (const step of ['intro', 'b2', 'survey', 'ticket']) {
    await p.goto(URL + '?t=' + Date.now(), { waitUntil: 'networkidle0' })
    await p.evaluate((step) => { localStorage.clear(); localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'golive-dark-check-0001', step, maxStep: 24, solved: [true, true, true], stamps: [true, true, step === 'ticket'], reg: { name: '홍길동', phone8: '12345678', who: '대학생', consent: true }, survey: {}, ticket: step === 'ticket' ? { no: 1, issuedAt: '2026-11-18T01:00:00.000Z', usedAt: null } : null })) }, step)
    await p.reload({ waitUntil: 'networkidle0' }); await sleep(1500)
    const png = await p.screenshot({ encoding: 'base64' })
    const lum = await p.evaluate(async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = new OffscreenCanvas(i.width, i.height), x = c.getContext('2d'); x.drawImage(i, 0, 0); const d = x.getImageData(0, 0, i.width, i.height).data; let t = 0; for (let k = 0; k < d.length; k += 16) t += d[k] * 0.299 + d[k + 1] * 0.587 + d[k + 2] * 0.114; return Math.round(t / (d.length / 16)) }, png)
    lums.push(step + ':' + lum)
    if (step === 'intro') await p.screenshot({ path: `tools/shots/golive_dark_${lums.length}_${name.slice(0, 2)}.png` })
  }
  const inv = await p.evaluate(() => document.documentElement.classList.contains('inv-on'))
  console.log(name, '| 밝기(0~255)', lums.join(' '), '| 뒤집기 보정', inv ? '켜짐!' : '꺼짐', '| 오류', errs.length ? errs : '없음')
  await b.close()
}
