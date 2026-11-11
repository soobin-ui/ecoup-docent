// gas/Code.gs 를 가짜 구글 환경에서 실행하는 모듈(fake_gas.mjs·gas_unit_check.mjs 공용)
import fs from 'node:fs'
import vm from 'node:vm'

export function makeGas() {
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
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, releaseLock() {} }) },
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

  return { ctx, sheets, call: (body) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).s) }
}
