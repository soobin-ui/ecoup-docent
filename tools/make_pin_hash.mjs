// 스태프 번호 → '암호처럼 바꾼 값'을 만들어 .env.production.local 에 저장(번호 자체는 어디에도 저장 안 함)
// 사용: ecoup-docent 폴더에서  node tools/make_pin_hash.mjs
// 입력한 번호는 화면에 * 로만 보임. Apps Script 의 STAFF_PIN 과 같은 번호를 넣을 것.
// 저장 뒤 다시 배포해야 앱에 반영됨. 스태프 번호를 바꾸면 이 도구를 다시 돌리고 다시 배포.
import { webcrypto as crypto } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const ITER = 100000
const ENV = path.resolve('.env.production.local')
const NOT_NEWLINE = new RegExp('[^\\r\\n]', 'g')

// 입력 한 줄씩 받기 — 질문 두 개를 한 입력 창으로(따로 만들면 두 번째 입력이 사라짐)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) })
let prompt = ''
rl._writeToOutput = (s) => rl.output.write(s.startsWith(prompt) ? prompt : s.replace(NOT_NEWLINE, '*'))
const lines = rl[Symbol.asyncIterator]()
async function askHidden(q) {
  prompt = q
  process.stdout.write(q)
  const { value } = await lines.next()
  process.stdout.write('\n')
  return String(value ?? '').trim()
}

const hex = (b) => Buffer.from(b).toString('hex')
async function pinHash(pin, salt, iter) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256))
}

const a = await askHidden('스태프 번호 4자리: ')
const b = await askHidden('한 번 더: ')
rl.close()
if (!/^\d{4}$/.test(a)) {
  console.log('숫자 4자리로 넣어 주세요. 저장하지 않았어요.')
  process.exit(1)
}
if (a !== b) {
  console.log('두 번 넣은 번호가 달라요. 저장하지 않았어요.')
  process.exit(1)
}
const salt = crypto.getRandomValues(new Uint8Array(16))
const line = `VITE_STAFF_PIN_HASH=${ITER}:${hex(salt)}:${await pinHash(a, salt, ITER)}`
const old = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : ''
const kept = old.split(/\r?\n/).filter((l) => l && !l.startsWith('VITE_STAFF_PIN_HASH='))
fs.writeFileSync(ENV, [...kept, line].join('\n') + '\n')
console.log('저장했어요 (.env.production.local). 이제 다시 배포하면 휴대폰에서 바로 확인돼요.')
