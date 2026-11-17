/*
  삼성 인터넷 다크 모드 대응 — "보색으로 칠하고 화면 전체를 한 번 뒤집기"

  왜: 삼성 인터넷 31 은 휴대폰이 다크 모드면 color-scheme(only light)을 무시하고 웹페이지를 강제로 어둡게 칠한다.
      게다가 페이지에는 '다크 아님'(prefers-color-scheme: light)이라고 알려서, 페이지가 알아챌 방법이 없다(2026-11-17 실기기 확인).
  어떻게: 삼성은 이미 어두운 배경·밝은 글자는 건드리지 않는다. 그래서 모든 색을 정반대(보색, 255-값)로 바꿔 칠하고
      html 에 filter: invert(1) 을 걸면 → 보이는 색은 원래와 똑같다.
      · 삼성이 어둡게 하려 해도 이미 어두워서 손댈 게 없음 → 뒤집혀서 밝게 보임
      · 삼성이 아무것도 안 해도(라이트 모드) → 보색 + 뒤집기 = 원래 색
      그림(img)·영상(video)은 색을 바꾸지 않았으므로 한 번 더 뒤집어 원래대로 둔다(삼성은 사진은 안 건드림).
  범위: 삼성 인터넷에서만 켠다(다른 브라우저는 only light 로 이미 밝게 나옴). 점검용으로 localStorage 'ecoup-inv-test'=1 이면 켬.
*/

const KEY = 'ecoup-inv-test'

function wanted(): boolean {
  if (/SamsungBrowser\//.test(navigator.userAgent)) return true
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/* ---------- 색 하나 뒤집기 ---------- */
const hx = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
function out(r: number, g: number, b: number, a: number): string {
  const R = 255 - r,
    G = 255 - g,
    B = 255 - b
  if (a >= 1) return `#${hx(R)}${hx(G)}${hx(B)}`
  return `rgba(${Math.round(R)}, ${Math.round(G)}, ${Math.round(B)}, ${+a.toFixed(4)})`
}
function fromHex(h: string): [number, number, number, number] | null {
  let s = h.slice(1)
  if (s.length === 3 || s.length === 4) s = [...s].map((c) => c + c).join('')
  if (s.length !== 6 && s.length !== 8) return null
  const n = (i: number) => parseInt(s.slice(i, i + 2), 16)
  return [n(0), n(2), n(4), s.length === 8 ? n(6) / 255 : 1]
}
function num(t: string, max: number): number {
  t = t.trim()
  if (t === 'none') return 0
  return t.endsWith('%') ? (parseFloat(t) / 100) * max : parseFloat(t)
}
function fromRgb(args: string): [number, number, number, number] | null {
  const [main, alpha] = args.includes('/') ? args.split('/') : [args, '']
  const p = main.split(/[\s,]+/).filter(Boolean)
  if (p.length < 3) return null
  let a = alpha ? num(alpha, 1) : p.length >= 4 ? num(p[3], 1) : 1
  if (!isFinite(a)) a = 1
  const v = [num(p[0], 255), num(p[1], 255), num(p[2], 255)]
  if (v.some((x) => !isFinite(x))) return null
  return [v[0], v[1], v[2], a]
}
function fromHsl(args: string): [number, number, number, number] | null {
  const [main, alpha] = args.includes('/') ? args.split('/') : [args, '']
  const p = main.split(/[\s,]+/).filter(Boolean)
  if (p.length < 3) return null
  const h = (((parseFloat(p[0]) % 360) + 360) % 360) / 360
  const s = num(p[1], 1),
    l = num(p[2], 1)
  const a = alpha ? num(alpha, 1) : p.length >= 4 ? num(p[3], 1) : 1
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0) * 255, f(8) * 255, f(4) * 255, a]
}
const NAMED: Record<string, [number, number, number]> = { white: [255, 255, 255], black: [0, 0, 0] }

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(([^()]*)\)|(?<![\w-])(?:white|black)(?![\w-])/gi
function invertPlain(s: string): string {
  return s.replace(COLOR_RE, (m, args) => {
    const low = m.toLowerCase()
    let c: [number, number, number, number] | null = null
    if (m[0] === '#') c = fromHex(m)
    else if (low.startsWith('rgb')) c = fromRgb(args)
    else if (low.startsWith('hsl')) c = fromHsl(args)
    else if (NAMED[low]) c = [...NAMED[low], 1]
    return c ? out(...c) : m
  })
}
/* url(...) 안은 건드리지 않되, 그림 속 색(data:image/svg+xml 의 %23rrggbb)은 뒤집음 */
export function invertColors(v: string): string {
  const parts = v.split(/(url\((?:"[^"]*"|'[^']*'|[^)]*)\))/g)
  return parts
    .map((p, i) => {
      if (i % 2 === 0) return invertPlain(p)
      if (!/data:image\/svg\+xml/.test(p)) return p
      return p.replace(/%23([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (_, h) => {
        const c = fromHex('#' + h)!
        return '%23' + out(...c).slice(1)
      })
    })
    .join('')
}
const HAS_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|(?<![\w-])(?:white|black)(?![\w-])|%23[0-9a-fA-F]{3}/i

/* ---------- 스타일 선언 하나 뒤집기 ---------- */
function invertDecl(st: CSSStyleDeclaration) {
  const props: string[] = []
  for (let i = 0; i < st.length; i++) props.push(st[i])
  for (const p of props) {
    const v = st.getPropertyValue(p)
    if (!v || !HAS_COLOR.test(v)) continue
    const nv = invertColors(v)
    if (nv !== v) st.setProperty(p, nv, st.getPropertyPriority(p))
  }
}

/* ---------- 스타일시트 전체 ---------- */
const doneSheets = new WeakSet<CSSStyleSheet>()
const extra: string[] = []
function walk(rules: CSSRuleList) {
  for (const r of Array.from(rules)) {
    if ('style' in r && (r as CSSStyleRule).style) invertDecl((r as CSSStyleRule).style)
    // @property 의 처음 값(예: --tw-ring-offset-color: #fff)은 바꿀 수 없어서 우선순위 0 규칙으로 덮음
    if (typeof CSSPropertyRule !== 'undefined' && r instanceof CSSPropertyRule) {
      const iv = r.initialValue
      if (iv && HAS_COLOR.test(iv)) extra.push(`${r.name}:${invertColors(iv)}`)
    }
    if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules)
  }
}
function doSheet(sh: CSSStyleSheet) {
  if (doneSheets.has(sh)) return
  try {
    walk(sh.cssRules)
    doneSheets.add(sh)
  } catch {
    /* 다른 출처 시트는 읽을 수 없음 — 이 앱엔 없음 */
  }
}
function doAllSheets() {
  for (const sh of Array.from(document.styleSheets)) doSheet(sh)
  if (extra.length) {
    const s = document.createElement('style')
    s.dataset.inv = '1'
    s.textContent = `:where(html.inv-on) *, :where(html.inv-on) *::before, :where(html.inv-on) *::after{${extra.join(';')}}`
    extra.length = 0
    document.head.appendChild(s)
    if (s.sheet) doneSheets.add(s.sheet) // 이미 뒤집은 값 — 다시 뒤집지 않게
  }
}

/* ---------- 요소에 직접 붙은 색(style 속성·SVG fill/stroke 등) ---------- */
const ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color']
const mark = new WeakMap<Element, Map<string, string>>()
// '진한 배경+흰 글자' 되돌리기로 내가 넣은 style 속성: [속성, 원래 있던 값, 원래 우선순위, 내가 넣은 값]
type Own = [string, string, string, string][]
const own = new WeakMap<Element, Own>()
/* 내가 넣은 값을 거두고 원래 있던 값(React·뒤집힌 색)을 돌려놓음 — 그사이 React 가 바꾼 속성은 손대지 않음 */
function dropOwn(e: Element) {
  const list = own.get(e)
  if (!list) return
  const st = (e as HTMLElement).style
  for (const [p, prev, prio, mine] of list) {
    if (st.getPropertyValue(p) !== mine) continue
    if (prev) st.setProperty(p, prev, prio)
    else st.removeProperty(p)
  }
  own.delete(e)
}
function doEl(el: Element) {
  let m = mark.get(el)
  const s = el.getAttribute('style')
  if (s && HAS_COLOR.test(s) && m?.get('style') !== s) {
    const st = (el as HTMLElement).style
    dropOwn(el) // 되돌린 부분이면 일단 거두고 → 뒤집기 → 뒤에서 scanUn 이 다시 되돌림
    invertDecl(st)
    if (!m) mark.set(el, (m = new Map()))
    m.set('style', el.getAttribute('style') ?? '')
  }
  for (const a of ATTRS) {
    const v = el.getAttribute(a)
    if (!v || !HAS_COLOR.test(v) || m?.get(a) === v) continue
    const nv = invertColors(v)
    if (!m) mark.set(el, (m = new Map()))
    m.set(a, nv)
    if (nv !== v) el.setAttribute(a, nv)
  }
}
function doTree(root: Element) {
  doEl(root)
  root.querySelectorAll('[style],[fill],[stroke],[stop-color],[flood-color],[lighting-color]').forEach(doEl)
}

/* ---------- '진한 배경 + 흰 글자'는 원래 색으로 두고 그 부분만 한 번 더 뒤집기 ----------
   삼성은 글자를 무조건 밝게 만들어서, 보색(검정)으로 칠한 흰 글자는 결국 검정으로 보임 → 남색 버튼 위 검정 글자.
   이런 부분은 원래 색(남색 배경·흰 글자)으로 되돌리고 data-inv-un 을 붙여 한 번 더 뒤집는다.
   삼성은 진한 배경·흰 글자를 건드리지 않으므로 → 뒤집기 두 번 = 원래 모습. */
const UN = 'data-inv-un'
const PROPS = ['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'box-shadow', 'outline-color', 'text-decoration-color', 'fill', 'stroke', '-webkit-text-stroke-color']
function rgbOf(s: string): [number, number, number, number] | null {
  const m = /rgba?\(([^)]*)\)/.exec(s)
  return m ? fromRgb(m[1]) : null
}
const lum = (c: [number, number, number, number]) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255
function qualifies(el: Element): boolean {
  const cs = getComputedStyle(el)
  const fg = rgbOf(cs.color),
    bg = rgbOf(cs.backgroundColor)
  if (!fg || !bg || bg[3] < 0.5) return false
  // 지금 칠해진 색은 보색 → 원래 글자 밝음 = 지금 글자 어두움, 원래 배경 진함 = 지금 배경 밝음
  return lum(fg) < 0.35 && lum(bg) > 0.42
}
function clearOwn(root: Element) {
  const all = [root, ...Array.from(root.querySelectorAll('*'))]
  for (const e of all) {
    if (!own.has(e)) continue
    dropOwn(e)
    mark.get(e)?.set('style', e.getAttribute('style') ?? '')
  }
  root.removeAttribute(UN)
  root.querySelectorAll(`[${UN}]`).forEach((e) => e.removeAttribute(UN))
}
function scanUn(root: Element) {
  const box = root.closest(`[${UN}]`) ?? root
  clearOwn(box)
  const walkEl = (e: Element) => {
    if (e instanceof HTMLElement && qualifies(e)) {
      // 안쪽부터 원래 색을 읽어야 하므로: 먼저 전부 계산한 뒤 넣음
      const list = [e, ...Array.from(e.querySelectorAll('*'))]
      const vals = list.map((x) => {
        const cs = getComputedStyle(x)
        return PROPS.map((p) => [p, cs.getPropertyValue(p)] as const)
      })
      list.forEach((x, i) => {
        const st = (x as HTMLElement).style
        if (!st) return
        const set: Own = []
        for (const [p, v] of vals[i]) {
          if (!v || !HAS_COLOR.test(v)) continue
          const prev = st.getPropertyValue(p),
            prio = st.getPropertyPriority(p)
          st.setProperty(p, invertColors(v), 'important')
          set.push([p, prev, prio, st.getPropertyValue(p)])
        }
        if (set.length) {
          own.set(x, set)
          mark.get(x)?.set('style', x.getAttribute('style') ?? '')
        }
      })
      e.setAttribute(UN, '')
      return
    }
    for (const c of Array.from(e.children)) walkEl(c)
  }
  walkEl(box)
}
export function startInvert() {
  if (!wanted()) return
  const html = document.documentElement
  doAllSheets()
  doTree(html)
  html.classList.add('inv-on')
  const ob = new MutationObserver((list) => {
    let sheets = false
    const touched = new Set<Element>()
    for (const r of list) {
      if (r.type === 'attributes') {
        const el = r.target as Element
        if (r.attributeName !== 'class') doEl(el)
        // 움직임(transform·opacity)만 바뀌는 style 은 매 프레임 오므로 건너뜀 — 색이 있거나 되돌린 부분일 때만 다시 살핌
        if (r.attributeName === 'class' || HAS_COLOR.test(el.getAttribute(r.attributeName!) ?? '') || el.closest(`[${UN}]`)) touched.add(el)
      } else
        r.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return
          const el = n as Element
          if (el.tagName === 'STYLE' || el.tagName === 'LINK') {
            sheets = true
            if (el.tagName === 'LINK') el.addEventListener('load', () => doAllSheets(), { once: true })
          } else {
            doTree(el)
            touched.add(el)
          }
        })
    }
    if (sheets) doAllSheets()
    // 바뀐 곳만 다시 살핌(바깥쪽 하나로 묶음)
    const roots = [...touched].filter((e) => e.isConnected && ![...touched].some((o) => o !== e && o.contains(e)))
    roots.forEach(scanUn)
    ob.takeRecords() // 내가 바꾼 것으로 생긴 알림은 버림
  })
  scanUn(document.body)
  // 색이 서서히 바뀌는(transition) 버튼은 바뀌는 도중에 살피면 놓침 → 다 바뀐 뒤 한 번 더
  const again = (e: Event) => {
    const t = e.target as Element
    if (!(t instanceof Element) || !t.isConnected) return
    scanUn(t)
    ob.takeRecords()
  }
  document.addEventListener('transitionend', again, true)
  document.addEventListener('animationend', again, true)
  ob.observe(html, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', ...ATTRS] })
}
