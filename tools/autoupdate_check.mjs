// 새 버전 자동 반영 점검: 옛 버전을 연 뒤 서버가 새 버전으로 바뀌면 → 다시 화면에 올 때 한 번 새로고침해 새 버전, 같은 버전에선 반복 없음
// node tools/autoupdate_check.mjs <빌드 폴더>
import puppeteer from 'puppeteer-core'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const ROOT = path.resolve(process.argv[2] ?? '../ecoup-inv-build')
const html0 = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const oldJs = /assets\/(index-[\w-]+\.js)/.exec(html0)[1]
const newJs = 'index-NEWVERSION1.js'
let served = 'old'
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'
  if (p === '/index.html') { r.writeHead(200, { 'content-type': T['.html'] }); return r.end(served === 'old' ? html0 : html0.replace(oldJs, newJs)) }
  if (p === '/assets/' + newJs) p = '/assets/' + oldJs
  const f = path.join(ROOT, p); fs.readFile(f, (e, d) => { if (e) return r.writeHead(404).end(); r.writeHead(200, { 'content-type': T[path.extname(f)] ?? 'application/octet-stream' }); r.end(d) })
}).listen(5293)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message))
let loads = 0; p.on('load', () => loads++)
await p.goto('http://localhost:5293/?s=TEST', { waitUntil: 'networkidle0' }); await sleep(1500)
const bundle = () => p.evaluate(() => [...document.scripts].map((s) => s.src.split('/').pop()).find((s) => s.startsWith('index-')))
const rows = []; const ok = (n, v) => rows.push({ 항목: n, 결과: v ? 'OK' : 'XX' })
ok('처음엔 옛 버전, 새로고침 없음', (await bundle()) === oldJs && loads === 1)
served = 'new'
await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')) })
await sleep(3000)
ok('새 버전 올라오면 한 번 새로고침', loads === 2)
ok('새로고침 뒤 새 버전 파일', (await bundle()) === newJs)
ok('주소의 ?s= 그대로', (await p.evaluate(() => location.search)) === '?s=TEST')
await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(2500)
ok('같은 버전에선 더 새로고침 안 함', loads === 2)
await b.close(); srv.close()
console.table(rows); console.log('errors:', errs.length ? errs : 'none')
