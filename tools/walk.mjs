// 전 구간 자동 주행 + 화면별 캡처 + 가로 넘침 검사 (시안 v2 흐름)
// node tools/walk.mjs http://localhost:5181/ [폭] [높이]
// 가짜 카메라(tools/fixtures/fakecam.y4m: 작품 QR·체험 QR 번갈아)로 QR 스캐너까지 실제로 인식시킴
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
  args: ['--lang=ko-KR', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${path.resolve('tools/fixtures/fakecam.y4m')}`],
})
const ctx = browser.defaultBrowserContext()
await ctx.overridePermissions(new globalThis.URL(URL).origin, ['camera'])
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
      const all = [...document.querySelectorAll(sel)].filter((b) => !b.disabled)
      const t = (b) => b.textContent.replace(/\s+/g, ' ').trim()
      const el = all.find((b) => t(b) === text) ?? all.find((b) => t(b).includes(text))
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
/** 설문: 질문 카드(label) 안의 버튼(text) 누르기 */
async function pick(label, text) {
  const ok = await page.evaluate(
    (label, text) => {
      const card = [...document.querySelectorAll('div')].find((d) => d.firstElementChild?.textContent?.startsWith(label))
      const b = card && [...card.querySelectorAll('button')].find((x) => x.textContent.trim() === text)
      if (!b) return false
      b.click()
      return true
    },
    label,
    text,
  )
  if (!ok) throw new Error(`설문 버튼 없음: ${label} / ${text}`)
  await sleep(150)
}
async function answer(text) {
  await page.evaluate(() => (document.querySelector('input[aria-label="정답 입력"]').value = ''))
  await page.click('input[aria-label="정답 입력"]', { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type('input[aria-label="정답 입력"]', text)
}
async function waitFor(text, ms = 15000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: ms }, text)
  await sleep(400)
}

await page.goto(URL, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(3000)
await shot('intro', false)
await click('시작하기')
await shot('howto')
await click('투어 시작')
await shot('about')
await click('다음')
await shot('partners')
await click('투어 시작하기')
await shot('a1')
await click('다음')
await shot('q1')
await answer('병원균')
await click('정답 확인')
await shot('q1_오답')
await answer('병원성')
await click('정답 확인')
await sleep(1800)
await shot('q1_정답', false)
await click('다음 전시 보러 가기')
await shot('b1')
await click('다음')
await shot('b2')
await click('다음')
await answer('응집')
await click('정답 확인')
await sleep(1800)
await shot('q2_정답', false)
await click('다음 전시 보러 가기')
await shot('c1')
await click('다음')
await shot('c2')
await click('다음')
await shot('q3')
await answer('자 연 수')
await click('정답 확인')
await sleep(1800)
await click('전시 투어 스탬프 받기')
await sleep(1200)
await shot('stamp1', false)
await click('다음')
await shot('water')
await click('다음')
await shot('contest')
await click('작품 보러 가기')
await shot('works')
await click('QR코드 찍기')
await sleep(1200)
await shot('scan_contest', false)
await waitFor('경진대회 스탬프 획득')
await shot('stamp2', false)
await click('다음')
await shot('hands')
await click('QR코드 찍기')
await waitFor('스탬프 3개 완성')
await shot('complete', false)
await click('참가자 등록하고 선물 받기')
await click('다음')
await shot('register_오류')
await page.type('input[placeholder="홍길동"]', '홍길동')
await page.type('input[inputmode="numeric"]', '12345678')
await click('중·고등학생')
await click('동의합니다')
await shot('register')
await click('다음')
await pick('1.', '5')
await pick('2.', '4')
await pick('3.', '물의 변화')
await pick('3.', '경진대회 작품')
await pick('4.', '맑은 물 정수하기')
await pick('5.', '많이')
await shot('survey')
await click('등록 완료')
await sleep(1200)
await shot('ticket')
// 스태프: 길게 누르기 → 번호 0000
const btn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('지급 완료 처리')))
const box = await btn.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await sleep(1100)
await page.mouse.up()
await sleep(400)
await page.type('input[type=password]', '0000')
await click('지급 완료')
await sleep(1200)
await shot('ticket_사용완료')
const usedOk = await page.evaluate(() => document.body.innerText.includes('선물을') && document.body.innerText.includes('이미 사용한 티켓이에요'))
if (!usedOk) problems.push('지급 완료 후 티켓이 사용 완료로 바뀌지 않음')
await click('처음 화면으로')
await sleep(2500)
await shot('home', false)

// 스태프 화면
await page.goto(URL + '#staff', { waitUntil: 'networkidle0' })
await page.type('input', '0000')
await click('들어가기')
await page.type('input', '1')
await click('지급 완료')
await shot('staff_중복', false)
const dup = await page.evaluate(() => document.body.innerText.includes('이미 지급한 티켓'))
if (!dup) problems.push('스태프 화면에서 이미 지급한 티켓을 다시 지급 처리함')
await click('참가 현황')
await shot('staff_목록', false)

await browser.close()
console.log(`캡처 ${n}장 → ${OUT}`)
console.log(problems.length ? problems.join('\n') : '가로 넘침 없음')
console.log(errors.length ? '콘솔 오류:\n' + errors.join('\n') : '콘솔 오류 없음')
