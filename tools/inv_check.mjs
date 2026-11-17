// 삼성 강제 다크 대응(보색+뒤집기) 점검
// ① 기능 켬/끔 화면이 거의 같은지(픽셀 평균 차이) ② 크롬 강제 다크(only light 무시하게 만든 상태)에서 켜면 밝게 나오는지
// node tools/inv_check.mjs <빌드 폴더> [폭]
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const ROOT = path.resolve(process.argv[2] ?? '../ecoup-inv-build')
const W = Number(process.argv[3] ?? 390)
const OUT = path.resolve('tools/shots/inv')
fs.mkdirSync(OUT, { recursive: true })
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json' }
const srv = http
  .createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0])
    if (p.endsWith('/')) p += 'index.html'
    const f = path.join(ROOT, p)
    fs.readFile(f, (e, d) => {
      if (e) return r.writeHead(404).end()
      r.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' })
      r.end(d)
    })
  })
  .listen(5290)
const BASE = 'http://localhost:5290/'
const STEPS = ['intro', 'howto', 'about', 'partners', 'a1', 'q1', 'b1', 'b2', 'q2', 'c1', 'c2', 'q3', 'stamp1', 'water', 'contest', 'works', 'stamp2', 'hands', 'complete', 'register', 'survey', 'ticket']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function shoot(forceDark, inv) {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: forceDark ? ['--force-dark-mode', '--enable-features=WebContentsForceDark', '--blink-settings=forceDarkModeEnabled=true'] : [],
  })
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  await p.setViewport({ width: W, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (forceDark)
    // 삼성처럼 'only light' 를 무시하게 만듦
    await p.evaluateOnNewDocument(() => {
      new MutationObserver(() => {
        const m = document.querySelector('meta[name="color-scheme"]')
        if (m && m.content !== 'light') m.content = 'light'
        if (!document.getElementById('fd-test') && document.head) {
          const s = document.createElement('style')
          s.id = 'fd-test'
          s.textContent = 'html,:root{color-scheme:light !important}'
          document.head.appendChild(s)
        }
      }).observe(document, { subtree: true, childList: true })
    })
  await p.goto(BASE, { waitUntil: 'networkidle0' })
  const shots = {}
  for (const step of STEPS) {
    await p.evaluate(
      (step, inv) => {
        localStorage.clear()
        if (inv) localStorage.setItem('ecoup-inv-test', '1')
        localStorage.setItem(
          'ecoup-docent-v2',
          JSON.stringify({
            deviceId: 'inv-check-device-000001',
            step,
            maxStep: step === 'intro' ? 0 : 24,
            solved: [true, true, true],
            stamps: [true, true, step === 'complete' || step === 'ticket'],
            reg: { name: '홍길동', phone8: '12345678', who: '일반 (대학원생 포함)', consent: true },
            survey: {},
            ticket: step === 'ticket' ? { no: 12, issuedAt: '2026-11-18T01:00:00.000Z', usedAt: null } : null,
          }),
        )
      },
      step,
      inv,
    )
    await p.reload({ waitUntil: 'networkidle0' })
    await sleep(1500)
    const on = await p.evaluate(() => document.documentElement.classList.contains('inv-on'))
    if (on !== inv) errs.push(`${step}: inv-on=${on}`)
    const file = `${OUT}/${step}_${forceDark ? 'fd' : 'pl'}_${inv ? 'inv' : 'off'}.png`
    await p.screenshot({ path: file })
    shots[step] = file
  }
  await b.close()
  return { shots, errs }
}

// 픽셀 비교는 브라우저 캔버스로
async function diff(a, b2) {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const p = await b.newPage()
  const res = {}
  for (const k of Object.keys(a)) {
    const A = fs.readFileSync(a[k]).toString('base64')
    const B = fs.readFileSync(b2[k]).toString('base64')
    res[k] = await p.evaluate(
      async (A, B) => {
        const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + s })
        const [ia, ib] = await Promise.all([load(A), load(B)])
        const c = new OffscreenCanvas(ia.width, ia.height), x = c.getContext('2d')
        x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, ia.width, ia.height).data
        x.clearRect(0, 0, ia.width, ia.height); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, ia.width, ia.height).data
        let s = 0, big = 0, lum = 0
        for (let i = 0; i < da.length; i += 4) {
          const d = (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3
          s += d; if (d > 40) big++
          lum += (db[i] * 0.299 + db[i + 1] * 0.587 + db[i + 2] * 0.114)
        }
        const n = da.length / 4
        return { 평균차이: +(s / n).toFixed(2), 크게다른점: +((big / n) * 100).toFixed(2) + '%', 밝기: Math.round(lum / n) }
      },
      A,
      B,
    )
  }
  await b.close()
  return res
}

const normal = await shoot(false, false)
const invOn = await shoot(false, true)
const fdOff = await shoot(true, false)
const fdInv = await shoot(true, true)
srv.close()
const d1 = await diff(normal.shots, invOn.shots)
const d2 = await diff(normal.shots, fdOff.shots)
const d3 = await diff(normal.shots, fdInv.shots)
const rows = STEPS.map((s) => ({ 화면: s, '켬 vs 원래': d1[s].평균차이 + ' / ' + d1[s].크게다른점, '강제다크 끔 밝기': d2[s].밝기, '강제다크+켬 밝기': d3[s].밝기, '강제다크+켬 vs 원래': d3[s].평균차이 + ' / ' + d3[s].크게다른점 }))
console.table(rows)
console.log('errors:', [...normal.errs, ...invOn.errs, ...fdOff.errs, ...fdInv.errs].join(' | ') || 'none')
