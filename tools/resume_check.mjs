// 새로 불러와도(폰 잠금·앱 전환 후 브라우저가 다시 읽어도) 멈췄던 화면 그대로인지 검사
// node tools/resume_check.mjs http://localhost:5181/
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] ?? 'http://localhost:5181/'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 375, height: 700, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const ok = (name, cond, detail = '') => results.push(`${cond ? 'OK ' : 'XX '} ${name} ${detail}`)

async function startAt(step, extra = {}) {
  await page.goto(URL, { waitUntil: 'networkidle0' })
  await page.evaluate(
    (step, extra) => {
      localStorage.clear()
      localStorage.setItem('ecoup-docent-v2', JSON.stringify({ deviceId: 'resume-test-device-0001', step, maxStep: 20, ...extra }))
    },
    step,
    extra,
  )
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(900)
}
async function reload() {
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(1200)
}
const clickText = (t) =>
  page.evaluate((t) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t)?.click(), t)

// 1) 암호 칸에 쓰다 만 글자
await startAt('q1')
await page.type('input[aria-label="정답 입력"]', '병원')
await sleep(300)
await reload()
const boxes = await page.evaluate(() => [...document.querySelectorAll('span')].filter((s) => /^[가-힣]$/.test(s.textContent) && s.className.includes('rounded-2xl')).map((s) => s.textContent).join(''))
ok('암호 입력 유지', boxes === '병원', `→ '${boxes}'`)

// 2) 참가자 등록 쓰다 만 것
await startAt('register', { stamps: [true, true, true] })
await page.type('input[placeholder="홍길동"]', '김테스')
await page.type('input[inputmode="numeric"]', '1234')
await clickText('대학생')
await clickText('동의합니다')
await sleep(300)
await reload()
const reg = await page.evaluate(() => ({
  name: document.querySelector('input[placeholder="홍길동"]').value,
  phone: document.querySelector('input[inputmode="numeric"]').value,
  who: [...document.querySelectorAll('button[aria-pressed="true"]')].map((x) => x.textContent.trim()),
}))
ok('등록 입력 유지', reg.name === '김테스' && reg.phone === '1234' && reg.who.includes('대학생') && reg.who.includes('동의합니다'), JSON.stringify(reg))

// 3) 설문 고르다 만 것
await startAt('survey', { stamps: [true, true, true], reg: { name: '김테스', phone8: '12345678', who: '대학생', consent: true } })
await page.evaluate(() => {
  const card = [...document.querySelectorAll('div')].find((d) => d.firstElementChild?.textContent?.startsWith('1.'))
  ;[...card.querySelectorAll('button')].find((x) => x.textContent.trim() === '4').click()
})
await clickText('물의 미래')
await sleep(300)
await reload()
const sv = await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed="true"]')].map((x) => x.textContent.trim()))
ok('설문 선택 유지', sv.includes('4') && sv.includes('물의 미래'), JSON.stringify(sv))

// 4) 긴 화면 스크롤 위치
await startAt('b2')
await page.evaluate(() => window.scrollTo(0, 500))
await sleep(500)
const before = await page.evaluate(() => Math.round(window.scrollY))
await reload()
await sleep(300)
const after = await page.evaluate(() => Math.round(window.scrollY))
ok('스크롤 위치 유지', before > 300 && Math.abs(after - before) < 30, `${before} → ${after}`)

// 5) 단계·스탬프
await startAt('hands', { stamps: [true, true, false], solved: [true, true, true] })
await reload()
const st = await page.evaluate(() => ({ title: document.body.innerText.includes('직접'), stamp: document.body.innerText.includes('2/3') }))
ok('단계·스탬프 유지', st.title && st.stamp, JSON.stringify(st))

await b.close()
console.log(results.join('\n'))
