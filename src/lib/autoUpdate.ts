/*
  새 버전 자동 반영 — GitHub Pages 는 첫 화면(index.html)을 휴대폰에 최대 10분 저장해 둠(Cache-Control: max-age=600).
  그래서 배포 직후·열어 둔 탭에선 옛 버전이 계속 보일 수 있음(2026-11-17 삼성 다크 보정이 안 보였던 원인으로 추정).
  앱이 열릴 때·다시 화면에 돌아올 때 최신 index.html 을 저장본 없이 받아 보고, 지금 돌고 있는 파일과 다르면 한 번 새로고침.
  진행 기록(localStorage)은 그대로라 이어서 하게 됨. 같은 버전으로는 한 번만 새로고침(무한 반복 방지).
*/
function currentBundle(): string | null {
  for (const s of Array.from(document.scripts)) {
    const m = /\/assets\/(index-[\w-]+\.js)/.exec(s.src)
    if (m) return m[1]
  }
  return null // 개발 서버(/src/main.tsx)에선 아무것도 안 함
}

async function check() {
  const cur = currentBundle()
  if (!cur) return
  try {
    const res = await fetch(`./?v=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const m = /assets\/(index-[\w-]+\.js)/.exec(await res.text())
    if (!m || m[1] === cur) return
    const key = 'ecoup-reloaded-' + m[1]
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      return // 저장이 안 되는 브라우저면 반복 위험 → 새로고침 안 함
    }
    location.reload()
  } catch {
    /* 인터넷 끊김 등 — 지금 버전 그대로 */
  }
}

export function startAutoUpdate() {
  void check()
  // 휴대폰을 잠갔다가 다시 켜거나 다른 앱에서 돌아올 때도 확인
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check()
  })
}
