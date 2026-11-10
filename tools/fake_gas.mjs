// gas/Code.gs 를 그대로 돌려 보는 가짜 구글 환경(시트·잠금·속성·캐시) + HTTP 서버
// node tools/fake_gas.mjs [포트=5199]   ·  GET /__sheet 로 시트 내용 확인
import http from 'node:http'
import fs from 'node:fs'
import vm from 'node:vm'

const PORT = Number(process.argv[2] ?? 5199)

/* ── 가짜 시트 ── */
class Range {
  constructor(sh, r, c, nr = 1, nc = 1) {
    Object.assign(this, { sh, r, c, nr, nc })
  }
  getValues() {
    return Array.from({ length: this.nr }, (_, i) => Array.from({ length: this.nc }, (_, j) => this.sh.rows[this.r - 1 + i]?.[this.c - 1 + j] ?? ''))
  }
  getValue() {
    return this.getValues()[0][0]
  }
  setValue(v) {
    const row = (this.sh.rows[this.r - 1] ??= [])
    row[this.c - 1] = v
    return this
  }
  setFontWeight() {
    return this
  }
  setBackground() {
    return this
  }
  setNumberFormat() {
    return this
  }
}
class Sheet {
  rows = []
  getLastRow() {
    return this.rows.length
  }
  appendRow(v) {
    this.rows.push([...v])
  }
  getRange(r, c, nr, nc) {
    if (typeof r === 'string') return new Range(this, 1, 1)
    return new Range(this, r, c, nr, nc)
  }
  setFrozenRows() {}
  hideColumns() {}
}
const sheets = {}
const props = {}
const cache = {}
const ctx = {
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({ getSheetByName: (n) => sheets[n] ?? null, insertSheet: (n) => (sheets[n] = new Sheet()) }),
    flush() {},
  },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null, setProperty: (k, v) => (props[k] = v) }) },
  CacheService: { getScriptCache: () => ({ get: (k) => cache[k] ?? null, put: (k, v) => (cache[k] = v) }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: {
    formatDate: (d) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 19).replace('T', ' '),
  },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ s, setMimeType() { return this } }) },
  JSON,
  Math,
  String,
  Number,
  Object,
  Array,
  Date,
}
vm.createContext(ctx)
vm.runInContext(fs.readFileSync(new URL('../gas/Code.gs', import.meta.url), 'utf8'), ctx)
ctx.setup()

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') {
      // 진짜 Apps Script 는 사전 확인(preflight)을 받지 못함 — 앱이 이걸 부르면 실패해야 맞음
      res.writeHead(405)
      return res.end('preflight not supported')
    }
    if (req.method === 'GET' && req.url.startsWith('/__sheet')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      return res.end(JSON.stringify(sheets['참가자']?.rows ?? [], null, 1))
    }
    let body = ''
    req.on('data', (d) => (body += d))
    req.on('end', () => {
      const out = req.method === 'POST' ? ctx.doPost({ postData: { contents: body } }) : ctx.doGet()
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(out.s)
    })
  })
  .listen(PORT, () => console.log(`fake GAS http://localhost:${PORT}/`))
