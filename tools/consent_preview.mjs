// 참가자 등록 화면(동의 상자) 미리보기 — 흉내 빌드 폴더를 직접 띄워 320·390 폭 캡처
// node tools/consent_preview.mjs ../ecoup-golive-mock
import puppeteer from 'puppeteer-core'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const ROOT = path.resolve(process.argv[2] ?? '../ecoup-golive-mock')
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm' }
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); fs.readFile(f, (e, d) => { if (e) return r.writeHead(404).end(); r.writeHead(200, { 'content-type': T[path.extname(f)] ?? 'application/octet-stream' }); r.end(d) }) }).listen(5294)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
for (const [w, h] of [[390, 844], [320, 568]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:5294/', { waitUntil: 'networkidle0' })
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'consent-preview-0001', step: 'register', maxStep: 24, solved: [true, true, true], stamps: [true, true, true] })) })
  await p.reload({ waitUntil: 'networkidle0' }); await sleep(1500)
  const info = await p.evaluate(() => { const el = [...document.querySelectorAll('p')].find((x) => x.textContent.includes('거부할 수 있으며')); el?.scrollIntoView({ block: 'center' }); return { text: el?.textContent, lines: el ? Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)) : 0, overflow: document.documentElement.scrollWidth - innerWidth } })
  await sleep(500)
  console.log(w, JSON.stringify(info), errs.length ? errs : '')
  await p.screenshot({ path: `tools/shots/consent_${w}.png` })
  await p.close()
}
await b.close(); srv.close()
