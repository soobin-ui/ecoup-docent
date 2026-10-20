/**
 * PC(넓은 화면)에서 열면 가운데에 휴대폰 틀을 두고 그 안에 실제 페이지를 띄웁니다.
 * 안쪽은 iframe(?inframe) 이라 폭 390px 휴대폰과 똑같이 동작합니다(vh·터치 레이아웃 그대로).
 * 실제 관람객은 휴대폰으로 열기 때문에 이 틀을 볼 일이 없습니다.
 */
export function PhoneFrame() {
  const src = `${location.pathname}?inframe${location.hash}`
  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto py-6" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #e3f8ff 0%, #9fe3f6 45%, #3cb6e3 100%)' }}>
      <div className="flex items-center gap-14">
        <div className="hidden w-[300px] text-sea lg:block">
          <p className="text-[14px] font-bold opacity-70">2026 CO-SHOW · 에코업 수처리 전시관</p>
          <h1 className="title-shadow mt-3 text-[44px] font-bold leading-[1.15]" style={{ ['--stroke' as never]: '7px' }}>
            <span className="stroke-title block text-white">한 방울이</span>
            <span className="stroke-title block text-lime">맑아지기까지</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed opacity-80">
            부스 QR 을 찍으면 관람객 휴대폰에서 열리는 도슨트 투어 화면입니다. 옆 휴대폰 화면을 직접 눌러 체험해 보세요.
          </p>
        </div>
        <div className="relative shrink-0 rounded-[54px] bg-[#0d1b26] p-[12px] shadow-[0_30px_80px_rgba(8,50,90,0.45)]" style={{ width: 414, height: Math.min(868, window.innerHeight - 48) }}>
          <div className="absolute left-1/2 top-[20px] z-10 h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-[#0d1b26]" />
          <iframe title="모바일 미리보기" src={src} className="h-full w-full rounded-[42px] border-0 bg-white" />
        </div>
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
