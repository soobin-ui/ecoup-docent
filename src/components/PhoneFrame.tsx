/**
 * PC(넓은 화면)에서 열면 가운데에 휴대폰 틀을 두고 그 안에 실제 페이지를 띄웁니다.
 * 안쪽은 iframe(?inframe) 이라 폭 390px 휴대폰과 똑같이 동작합니다(vh·터치 레이아웃 그대로).
 * 실제 관람객은 휴대폰으로 열기 때문에 이 틀을 볼 일이 없습니다.
 */
export function PhoneFrame() {
  // ?s=코드(스탬프 QR) 같은 주소 뒤 정보를 틀 안 화면에 그대로 넘김
  const extra = location.search.replace(/^\?/, '')
  const src = `${location.pathname}?inframe${extra ? `&${extra}` : ''}${location.hash}`
  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto py-6" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #e3f8ff 0%, #9fe3f6 45%, #3cb6e3 100%)' }}>
      <div className="relative shrink-0 rounded-[54px] bg-[#0d1b26] p-[12px] shadow-[0_30px_80px_rgba(8,50,90,0.45)]" style={{ width: 414, height: Math.min(868, window.innerHeight - 48) }}>
        <div className="absolute left-1/2 top-[20px] z-10 h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-[#0d1b26]" />
        <iframe title="모바일 미리보기" src={src} className="h-full w-full rounded-[42px] border-0 bg-white" />
      </div>
    </div>
  )
}

/** 휴대폰 틀로 감쌀지: 넓은 화면 + 아직 틀 안이 아님 + 스태프 화면 아님 */
export function shouldFrame() {
  const inFrame = new URLSearchParams(location.search).has('inframe') || window.self !== window.top
  const desktop = window.matchMedia('(pointer: fine)').matches
  return !inFrame && desktop && window.innerWidth >= 460 && location.hash !== '#staff'
}
