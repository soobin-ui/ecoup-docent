// 문장 끊김 점검 — 휴대폰 크기별로 모든 화면에서 '마지막 줄에 짧은 낱말 하나만 떨어진 글'(외톨이 줄)과 넘친 글을 찾음
// node tools/wrap_audit.mjs [http://localhost:5181/]
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2] ?? 'http://localhost:5181/'
const SIZES = [
  [320, 568],
  [360, 740],
  [375, 812],
  [390, 844],
  [412, 915],
  [430, 932],
]
const STEPS = ['intro', 'howto', 'about', 'partners', 'a1', 'q1', 'b1', 'b2', 'q2', 'c1', 'c2', 'q3', 'stamp1', 'water', 'contest', 'works', 'stamp2', 'hands', 'complete', 'register', 'survey', 'ticket']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const found = new Map() // 글 → 걸린 화면·폭
for (const [w, h] of SIZES) {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await p.goto(BASE, { waitUntil: 'networkidle0' })
  for (const step of STEPS) {
    await p.evaluate((step) => {
      localStorage.clear()
      const now = new Date().toISOString()
      localStorage.setItem(
        'ecoup-docent-v2',
        JSON.stringify({
          deviceId: 'wrap-audit-device-0001',
          step,
          maxStep: 24,
          solved: [true, true, true],
          stamps: [true, true, step === 'complete' || step === 'ticket'],
          reg: { name: '홍길동', phone8: '12345678', who: '일반 (대학원생 포함)', consent: true },
          survey: {},
          ticket: step === 'ticket' ? { no: 12, issuedAt: now, usedAt: null } : null,
        }),
      )
    }, step)
    await p.reload({ waitUntil: 'networkidle0' })
    await sleep(1400)
    // 접힌 내용도 보이게: 카드·힌트 열기
    await p.evaluate(() => {
      const t = (s) => [...document.querySelectorAll('button')].find((x) => x.textContent.includes(s))
      t('힌트보기')?.click()
      document.querySelectorAll('section .grid > button')[0]?.click()
      document.querySelectorAll('button[aria-label*="카드"]').forEach((x) => x.click())
    })
    await sleep(900)
    const hits = await p.evaluate(() => {
      const out = []
      const els = [...document.querySelectorAll('p, h1, h2, span, button, li, label')]
      for (const el of els) {
        // 글자가 바로 들어 있는 요소만
        const texts = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
        if (!texts.length) continue
        const cs = getComputedStyle(el)
        if (cs.whiteSpace.includes('nowrap') || el.closest('[aria-hidden="true"]')) continue
        const r = document.createRange()
        r.selectNodeContents(el)
        const rects = [...r.getClientRects()].filter((x) => x.width > 1 && x.height > 4)
        if (!rects.length) continue
        // 줄로 묶기
        const lines = []
        for (const x of rects) {
          const L = lines.find((l) => Math.abs(l.top - x.top) < x.height * 0.5)
          if (L) {
            L.left = Math.min(L.left, x.left)
            L.right = Math.max(L.right, x.right)
          } else lines.push({ top: x.top, left: x.left, right: x.right })
        }
        if (lines.length < 2) {
          const box = el.getBoundingClientRect()
          if (el.scrollWidth > el.clientWidth + 2 && cs.overflow === 'visible' && box.width > 0) out.push({ kind: '넘침', text: el.textContent.trim().slice(0, 40) })
          continue
        }
        lines.sort((a, z) => a.top - z.top)
        const last = lines[lines.length - 1]
        const prev = lines[lines.length - 2]
        const lw = last.right - last.left
        const pw = prev.right - prev.left
        // 마지막 줄이 앞줄의 1/4 보다 짧고, 낱말 하나(띄어쓰기 없음)면 외톨이 줄
        const full = el.innerText.trim()
        const words = full.split(/\s+/)
        const tail = words[words.length - 1]
        if (lw < pw * 0.28 && tail.length <= 4 && !full.includes('\n')) out.push({ kind: '외톨이 줄', text: full.slice(0, 48) })
      }
      return out
    })
    for (const x of hits) {
      const key = `${x.kind} · ${x.text}`
      if (!found.has(key)) found.set(key, new Set())
      found.get(key).add(`${step}@${w}`)
    }
  }
  await p.close()
}
await b.close()
if (!found.size) console.log('문장 끊김 문제 없음')
else for (const [k, v] of found) console.log(k, '→', [...v].join(' '))
console.log(`총 ${found.size}곳`)
