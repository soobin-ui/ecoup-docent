/*
  스탬프 QR — 작품 5개 + 체험 테이블 2개에 붙이는 QR 의 내용.
  QR 에는 이 사이트 주소 + ?s=코드 가 들어 있어서
    - 앱 안 스캐너로 찍으면 바로 스탬프,
    - 휴대폰 기본 카메라로 찍어도 같은 사이트가 열리며 스탬프(같은 브라우저일 때).
  인쇄용 QR 은 tools/make_stamp_qr.py 가 공통 코드 CONTEST·HANDS 로 만듭니다(코드를 바꾸면 둘을 같이 고칠 것).
*/
export const SITE = 'https://soobin-ui.github.io/ecoup-docent/'

export type StampKind = 'contest' | 'hands'

export const STAMP_CODES: { code: string; kind: StampKind; label: string }[] = [
  // 현장 인쇄용 공통 QR — 작품 5곳에 같은 CONTEST, 체험 테이블 2곳에 같은 HANDS(붙일 때 헷갈리지 않게)
  { code: 'CONTEST', kind: 'contest', label: '경진대회 · 작품 공통' },
  { code: 'HANDS', kind: 'hands', label: '체험 · 테이블 공통' },
  // 예전 작품별 QR(이미 뽑았거나 붙였을 수 있어 계속 인식)
  { code: 'CT1-CWRS', kind: 'contest', label: '경진대회 · CWRS' },
  { code: 'CT2-REPASS', kind: 'contest', label: '경진대회 · Re:PASS' },
  { code: 'CT3-CHACHA', kind: 'contest', label: '경진대회 · 다 함께 차차차' },
  { code: 'CT4-EKKONG', kind: 'contest', label: '경진대회 · 에꽁' },
  { code: 'CT5-BIOSPH', kind: 'contest', label: '경진대회 · 바이오스피어' },
  { code: 'HS1-LED', kind: 'hands', label: '체험 · 아크릴 무드등' },
  { code: 'HS2-FILTER', kind: 'hands', label: '체험 · 맑은 물 정수하기' },
]

/** QR 에서 읽은 글자 → 스탬프 종류(모르는 QR 이면 null) */
export function kindOf(text: string): StampKind | null {
  let code = text.trim()
  try {
    const u = new URL(code)
    code = u.searchParams.get('s') ?? ''
  } catch {
    /* 주소가 아니면 글자 그대로 */
  }
  const hit = STAMP_CODES.find((c) => c.code.toUpperCase() === code.toUpperCase())
  return hit?.kind ?? null
}
