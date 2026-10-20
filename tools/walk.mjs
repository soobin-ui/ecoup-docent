// 전 구간 자동 주행 + 화면별 캡처 + 가로 넘침 검사
// node tools/walk.mjs http://localhost:5181/ [폭] [높이]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const URL = process.argv[2] ?? 'http://localhost:5181/'
const W = Number(process.argv[3] ?? 375)
const H = Number(process.argv[4] ?? 812)
const OUT = path.resolve('tools/shots', `${W}x${H}`)
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--lang=ko-KR'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let n = 0
const problems = []
async function shot(name, full = true) {
  await sleep(700)
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (over > 0) problems.push(`${name}: 가로 넘침 ${over}px`)
  await page.screenshot({ path: path.join(OUT, `${String(++n).padStart(2, '0')}_${name}.png`), fullPage: full })
}
async function click(text, sel = 'button') {
  const ok = await page.evaluate(
    (text, sel) => {
      const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.replace(/\s+/g, ' ').includes(text) && !b.disabled)
      if (!el) return false
      el.click()
      return true
    },
    text,
    sel,
  )
  if (!ok) throw new Error(`버튼 없음: ${text}`)
  await sleep(450)
}

await page.goto(URL, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(3200)
await shot("intro", false)
await click('투어 시작하기')
await sleep(1600)
await shot('about')
await click('어떤 인재를 키우나요?')
await shot('talent')
await click('함께하는 곳 보기')
await shot('partners')
await click('전시 보러 가기')
await shot('s1_자연수')
await click('생활하수')
await shot('s1_생활하수')
await click('물속 오염물질 알아보기')
await shot('s1b')
await click('중금속')
await click('정답 확인')
await shot('s1b_오답힌트')
await click('음식물 찌꺼기')
await click('정답 확인')
await sleep(1800)
await shot('stamp1', false)
await click('섹션 2로 이동')
await shot('s2')
await click('먹어 치운다')
await click('정답 확인')
await sleep(1800)
await shot('stamp2', false)
await click('섹션 3으로 이동')
await shot('s3')
await click('반도체')
await shot('s3_팝업', false)
await click('닫기')
await click('초순수')
await click('정답 확인')
await sleep(1800)
await shot('stamp3', false)
await click('완료 화면 보기')
await shot('complete')
await click('체험 보러 가기')
await shot('handson')
await click('시간 고르기')
await shot('handson_시간')
await click('14:00')
await shot('handson_예약증')
await click('설문하고 기념품 받기')
await page.type('input', '맑은물방울')
await click('중·고등학생')
await click('잘 이해했어요')
await shot('survey1')
await click('다음')
await click('물의 변화')
await click('진로로 생각해 볼래요')
await click('단체 관람')
await shot('survey2')
await click('설문 제출하고')
await sleep(1200)
await shot('exchange')
// 스태프 확인: 길게 누르기 → 번호 0000
const btn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('스태프 확인')))
const box = await btn.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await sleep(1100)
await page.mouse.up()
await sleep(400)
await page.type('input[type=password]', '0000')
await shot('pin', false)
await click('교환 완료 처리')
await sleep(900)
await shot('exchange_완료')

// 이어하기: 새로 열면 '이어서 하기'
await page.evaluate(() => {
  const k = 'ecoup-docent-v1'
  const p = JSON.parse(localStorage.getItem(k))
  localStorage.setItem(k, JSON.stringify({ ...p, step: 'intro' }))
})
await page.reload({ waitUntil: 'networkidle0' })
await shot('intro_이어하기', false)

// 스태프 화면
await page.goto(URL + '#staff', { waitUntil: 'networkidle0' })
await page.type('input', '0000')
await click('들어가기')
const code = await page.evaluate(() => JSON.parse(localStorage.getItem('ecoup-docent-localdb')).rows[0].code)
await page.type('input', code)
await click('교환 처리')
await shot('staff_중복수령', false)
await click('회차 관리')
await click('13:00')
await shot('staff_회차')
await click('설문 · 엑셀')
await shot('staff_엑셀')

await browser.close()
console.log(`캡처 ${n}장 → ${OUT}`)
console.log(problems.length ? problems.join('\n') : '가로 넘침 없음')
console.log(errors.length ? '콘솔 오류:\n' + errors.join('\n') : '콘솔 오류 없음')
