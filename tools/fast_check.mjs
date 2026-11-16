// 설문 '등록 완료' → 기다림 없이 티켓 화면, 번호는 뒤에서 / 스태프 화면 들어가기 바로 확인 점검
// node tools/fast_check.mjs [http://localhost:5181/]   (개발 서버: 흉내 DB, 스태프 번호 0000 해시)
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const OUT = path.resolve('tools/shots/fast')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const rows = []
const expect = (name, got, want) => rows.push({ name, got, ok: got === want ? 'OK' : 'XX' })
const errs = []

// 1) 설문 제출
let p = await b.newPage()
p.on('pageerror', (e) => errs.push(e.message))
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto(BASE, { waitUntil: 'networkidle0' })
await p.evaluate(() => {
  localStorage.clear()
  localStorage.setItem(
    'ecoup-docent-v2',
    JSON.stringify({ deviceId: 'fast-check-device-0001', step: 'survey', maxStep: 23, solved: [true, true, true], stamps: [true, true, true], reg: { name: '빠른점검', phone8: '12341234', who: '일반 (대학원생 포함)', consent: true } }),
  )
  localStorage.setItem('ecoup-docent-draft-v2', JSON.stringify({ survey: { sat: 5, understand: 4, best: ['물의 변화'], fun: ['맑은 물 정수하기'], career: '많이' } }))
})
await p.reload({ waitUntil: 'networkidle0' })
await sleep(1200)
const t0 = Date.now()
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '등록 완료')?.click())
await p.waitForFunction(() => JSON.parse(localStorage.getItem('ecoup-docent-v2')).step === 'ticket', { timeout: 5000 }).catch(() => {})
const ms = Date.now() - t0
expect('등록 완료 → 티켓 화면 0.5초 안', ms < 500, true)
console.log('등록 완료 → 티켓 화면', ms, 'ms')
await p.waitForFunction(() => (JSON.parse(localStorage.getItem('ecoup-docent-v2')).ticket?.no ?? 0) > 0, { timeout: 8000 }).catch(() => {})
await sleep(500)
expect('번호 받아 옴(No.)', await p.evaluate(() => /No\. \d{4}/.test(document.body.innerText)), true)
expect('임시 안내 안 뜸', await p.evaluate(() => document.body.innerText.includes('임시 티켓')), false)
expect('시트(흉내 DB)에 설문까지 저장', await p.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-localdb-v2'))?.[0]?.name === '빠른점검'), true)
await p.screenshot({ path: `${OUT}/1_ticket.png` })
await p.close()

// 2) 스태프 화면 — 느린 서버(3초) 흉내에서도 들어가기는 바로
p = await b.newPage()
p.on('pageerror', (e) => errs.push(e.message))
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await p.goto(BASE + '?mockdelay=3000#staff', { waitUntil: 'networkidle0' })
await p.type('input', '0000')
const t1 = Date.now()
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.includes('들어가기'))?.click())
await p.waitForFunction(() => document.body.innerText.includes('참가 현황'), { timeout: 6000 }).catch(() => {})
const ms2 = Date.now() - t1
expect('스태프 화면 들어가기 0.5초 안', ms2 < 500, true)
console.log('스태프 들어가기', ms2, 'ms')
await p.close()
await b.close()
console.table(rows)
console.log(`${rows.filter((r) => r.ok === 'OK').length}/${rows.length} 통과`)
console.log('errors:', errs.length ? errs : 'none')
