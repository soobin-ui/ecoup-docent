// 보색+뒤집기: 움직이는 「눌러 보세요」·설문 선택·C1 물 버튼(선택 시 진한 배경+흰 글자) 빠른 점검 — 강제 다크 켬
import puppeteer from 'puppeteer-core'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const ROOT = path.resolve(process.argv[2] ?? '../ecoup-inv-build')
const OUT = path.resolve('tools/shots/inv'); fs.mkdirSync(OUT, { recursive: true })
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' }
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); fs.readFile(f, (e, d) => { if (e) return r.writeHead(404).end(); r.writeHead(200, { 'content-type': T[path.extname(f)] ?? 'application/octet-stream' }); r.end(d) }) }).listen(5292)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--force-dark-mode', '--enable-features=WebContentsForceDark'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', (e) => errs.push(e.message))
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.evaluateOnNewDocument(() => { new MutationObserver(() => { const m = document.querySelector('meta[name="color-scheme"]'); if (m && m.content !== 'light') m.content = 'light'; if (!document.getElementById('fd-test') && document.head) { const s = document.createElement('style'); s.id = 'fd-test'; s.textContent = 'html,:root{color-scheme:light !important}'; document.head.appendChild(s) } }).observe(document, { subtree: true, childList: true }) })
await p.goto('http://localhost:5292/', { waitUntil: 'networkidle0' })
const go = async (step, draft = {}) => { await p.evaluate((step, draft) => { localStorage.clear(); localStorage.setItem('ecoup-inv-test', '1'); localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify(draft)); localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'inv-quick-device-000001', step, maxStep: 24, solved: [true, true, false], stamps: [true, true, true], reg: { name: '홍길동', phone8: '12345678', who: '대학생', consent: true }, survey: {}, ticket: null })) }, step, draft); await p.reload({ waitUntil: 'networkidle0' }); await sleep(1500) }
const rows = []
const ok = (n, v) => rows.push({ 항목: n, 결과: v ? 'OK' : 'XX' })
// C1 배지: 몇 초 움직인 뒤에도 주황 배경 + 되돌림 표시
await go('c1'); await sleep(3000)
const badge = await p.evaluate(() => [...document.querySelectorAll('span')].filter((s) => s.textContent.trim() === '눌러 보세요').map((s) => ({ un: s.hasAttribute('data-inv-un'), bg: getComputedStyle(s).backgroundColor, c: getComputedStyle(s).color })))
console.log('badge', JSON.stringify(badge))
ok('C1 배지 3개 원래 색(주황·흰 글자)으로 되돌림', badge.length === 3 && badge.every((x) => x.un && x.bg === 'rgb(232, 89, 12)' && x.c === 'rgb(255, 255, 255)'))
await p.screenshot({ path: `${OUT}/q_c1_badge.png`, clip: { x: 0, y: 330, width: 390, height: 120 } })
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('생활하수'))?.click()); await sleep(1500)
const water = await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('생활하수')); return { un: x.hasAttribute('data-inv-un'), bg: getComputedStyle(x).backgroundColor, c: getComputedStyle(x).color } })
console.log('water', JSON.stringify(water))
ok('C1 고른 물 버튼(진한 배경+흰 글자) 되돌림', water.un && water.c === 'rgb(255, 255, 255)')
await p.screenshot({ path: `${OUT}/q_c1_pick.png`, clip: { x: 0, y: 330, width: 390, height: 460 } })
// 설문: 답 하나 고르면 진한 배경+흰 글자
await go('survey'); await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '4')?.click()); await sleep(800)
const sv = await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '4'); return { un: x.hasAttribute('data-inv-un'), bg: getComputedStyle(x).backgroundColor, c: getComputedStyle(x).color } })
console.log('survey', JSON.stringify(sv))
ok('설문 고른 답 되돌림', sv.un)
await p.screenshot({ path: `${OUT}/q_survey.png`, clip: { x: 0, y: 200, width: 390, height: 300 } })
// 다시 다른 답 고르면 이전 답은 원래대로(보색)로
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '2')?.click()); await sleep(800)
const sv2 = await p.evaluate(() => ['4', '2'].map((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t).hasAttribute('data-inv-un')))
ok('다른 답 고르면 이전 답 되돌림 풀림', !sv2[0] && sv2[1])
// 정지 상태에서 매 프레임 계산이 도는지(성능): 2초간 MutationObserver 콜백 수 대신 style 변경 수
const perf = await p.evaluate(async () => { let n = 0; const o = new MutationObserver((l) => (n += l.length)); o.observe(document.documentElement, { subtree: true, attributes: true }); await new Promise((r) => setTimeout(r, 2000)); o.disconnect(); return n })
console.log('2초 동안 속성 변경 수', perf)
await b.close(); srv.close()
console.table(rows); console.log('errors:', errs.length ? errs : 'none')
