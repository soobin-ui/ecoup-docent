/*
  도슨트 투어 문구 전부 — 기준: 클라이언트 시안 「에코업관 미션 웹 화면.pdf」(2026-11, 25화면)
  디자인은 우리 물 디자인을 유지하고 내용·흐름만 시안을 따릅니다.
  문장 안 **굵게** 는 강조색으로 표시됩니다.
*/

export const EVENT = {
  name: '2026 CO-SHOW',
  hall: '에코업 수처리 전시관',
  // 운영일 — 시안 기준 11/18~20 (티켓 발급 시각·스태프 화면 날짜 탭이 따름)
  days: ['2026-11-18', '2026-11-19', '2026-11-20'],
}

/* ── 01 첫 화면 ───────────────────────────────── */
export const INTRO = {
  eyebrow: '2026 CO-SHOW · 에코업(業)',
  title: ['에코업 수처리', '전시관 투어'],
  lead: ['스탬프 3개 모으고', '다양한 선물을 뽑아 보세요!'],
  bubble: '나 좀 맑게 해 줄래?',
  cta: '시작하기',
  resume: '이어서 하기',
  restart: '처음부터 다시',
}

/* ── 02 HOW TO ─────────────────────────────────── */
export const STAMPS = [
  { id: 'tour', name: '전시 투어', how: '도슨트와 함께 전시를 둘러보고 암호 3개 풀기' },
  { id: 'contest', name: '경진대회', how: '본선 작품 관람 후 작품 QR 찍기' },
  { id: 'hands', name: '체험', how: '정수·아크릴 체험 중 1개 참여 후 체험 테이블 QR 찍기' },
] as const

export const HOWTO = {
  eyebrow: 'HOW TO',
  title: ['스탬프 3칸을', '채워 주세요'],
  giftTitle: '선물뽑기 경품',
  gifts: [
    { id: 'speaker', name: 'JBL 스피커' },
    { id: 'battery', name: '보조배터리' },
    { id: 'bag', name: '폴딩 보스턴백' },
    { id: 'keyring', name: '키캡 키링' },
  ],
  giftNote: '외 다양한 경품 · 1인 1회',
  giftWhen: '11/18~20 운영 · 날짜별 수량 소진 시 마감',
  cta: '투어 시작',
}

/* ── 03 에코업 ─────────────────────────────────── */
export const ABOUT = {
  eyebrow: 'ABOUT · 에코업',
  title: ['환경을 ‘업(業)’으로', '키우는 에코업'],
  lead: '환경시설·측정기기·환경기술 서비스를 만드는 친환경 산업이에요.',
  fieldsTitle: '에코업 6대 분야',
  fields: [
    { id: 'carbon', name: '온실가스 감축' },
    { id: 'climate', name: '기후변화 적응' },
    { id: 'water', name: '물의 지속가능한 보전' },
    { id: 'circular', name: '자원 순환' },
    { id: 'pollution', name: '오염 방지·관리' },
    { id: 'bio', name: '생물 다양성 보전' },
  ],
  todayTag: '오늘 전시',
  todayLabel: '오늘의 전시 · 물의 지속가능한 보전',
  todayQ: '더러운 물은 어디로 갔지?',
  todaySteps: ['물의 이해', '물의 변화', '물의 미래'],
  cta: '다음',
}

/* ── 04 사업단 ─────────────────────────────────── */
export const PARTNERS = {
  eyebrow: 'ABOUT · 에코업 사업단',
  title: ['세종시와 5개 대학이', '함께해요'],
  city: { tag: '지자체 참여형', name: '세종특별자치시', logo: 'sejong' },
  lead_: { tag: '주관대학', name: '고려대학교 세종캠퍼스', logo: 'kus' },
  membersTag: '참여대학',
  members: [
    { name: '고려대학교', logo: 'ku' },
    { name: '건국대학교', logo: 'konkuk' },
    { name: '영남대학교', logo: 'yu' },
    { name: '전주비전대학교', logo: 'jvision' },
  ],
  cta: '투어 시작하기',
}

/* ── 05 A · 물의 이해 ──────────────────────────── */
export const A1 = {
  eyebrow: 'A · 물의 이해',
  title: ['모든 물은', '같은 물일까?'],
  waters: [
    { id: 'nature', name: '자연수', from: '하천·호수·지하수', has: ['흙', '부유물질', '조류', '미생물'], color: '#8ccfae' },
    { id: 'home', name: '생활하수', from: '씻기·세탁·화장실', has: ['세제', '음식물 찌꺼기', '질소·인', '병원성 미생물'], color: '#d8bf8c' },
    { id: 'factory', name: '공장폐수', from: '생산·세척·냉각', has: ['기름', '염류', '금속류', '산·알칼리'], color: '#8f9bad' },
  ],
  pollutantsTitle: '물속 오염물질 5가지',
  pollutants: [
    { name: '부유물질', desc: '물을 뿌옇게 하는 작은 입자' },
    { name: '유기물', desc: '분해되며 물속 산소를 줄여요' },
    { name: '영양염류', desc: '너무 많으면 녹조가 생겨요' },
    { name: '화학 오염물질', desc: '사람과 자연에 해로워요' },
    { name: '병원성 미생물', desc: '위생 문제나 병을 일으켜요' },
  ],
  cta: '다음',
}

/* ── 07 B · 물의 변화 ① ────────────────────────── */
export type TermGroup = { title: string; sub: string; items: { k: string; v: string }[] }
export const B1 = {
  eyebrow: 'B · 물의 변화 ①',
  title: ['더러워진 물은', '어떻게 깨끗해질까?'],
  groups: [
    {
      title: '물리적 처리',
      sub: '크기와 무게 차이로 분리',
      items: [
        { k: '스크리닝', v: '거름망으로 큰 쓰레기를 걸러요' },
        { k: '침전', v: '무거운 입자를 가라앉혀요' },
        { k: '여과', v: '필터로 작은 입자를 걸러요' },
        { k: '부상', v: '공기방울로 띄워서 제거해요' },
        { k: '막여과', v: '특수한 막으로 아주 작은 물질까지 걸러요' },
      ],
    },
    {
      title: '화학적 처리',
      sub: '작은 오염물질을 모아 제거',
      items: [
        { k: '응집·침전', v: '작은 먼지를 뭉쳐 가라앉혀요' },
        { k: '중화', v: '물의 pH를 조정해요' },
        { k: '인 제거', v: '녹조를 일으키는 인을 줄여요' },
        { k: '고도산화', v: '분해가 잘 되지 않는 물질도 줄여요' },
      ],
    },
  ] as TermGroup[],
  cta: '다음',
}

/* ── 08 B · 물의 변화 ② ────────────────────────── */
export const B2 = {
  eyebrow: 'B · 물의 변화 ②',
  title: ['미생물과', '미래 기술'],
  groups: [
    {
      title: '미생물 처리',
      sub: '눈에 보이지 않는 작은 청소부',
      items: [
        { k: '활성슬러지', v: '미생물이 오염물질을 먹고 분해' },
        { k: '질산화·탈질', v: '너무 많은 질소를 줄여요' },
        { k: '아나목스', v: '적은 산소로 질소 제거' },
        { k: '혐기성 소화', v: '처리하며 에너지 원료도 생산' },
      ],
    },
    {
      title: '미래 수처리 기술',
      sub: '더 작고 정밀하게',
      items: [
        { k: 'MBR', v: '미생물 + 정밀 필터' },
        { k: 'RO 분리막', v: '해수를 마시는 물로 (역삼투압)' },
        { k: 'UV 소독', v: '자외선으로 미생물 비활성화' },
      ],
    },
  ] as TermGroup[],
  flowTitle: '세 종류의 물은 이렇게 처리해요',
  flows: [
    { from: '자연수', to: '수돗물', steps: ['응집·침전', '여과', '소독', '수질검사'] },
    { from: '생활하수', to: '재이용수', steps: ['큰 오염물질', '미생물 처리', '고도처리', '소독·검사'] },
    { from: '공장폐수', to: '재이용수', steps: ['오염물질 분석', '중화·화학', '생물학처리', '정제·검사'] },
  ],
  cta: '다음',
}

/* ── 10 C · 물의 미래 ① ────────────────────────── */
export const C1 = {
  eyebrow: 'C · 물의 미래 ①',
  title: ['깨끗해진 물은', '어디까지 활용될까?'],
  lead: '우리가 쓴 물도 기술을 만나 새로운 자원이 돼요.',
  useTitle: '정화된 물의 활용',
  useSub: '깨끗하게 정화한 뒤 이런 곳에 다시 써요',
  uses: [
    { from: '자연수', to: ['수돗물', '농업용수', '산업용수', '하천유지용수'] },
    { from: '생활하수', to: ['공원·조경용수', '화장실 세정수', '도로 청소용수', '산업용 냉각수'] },
    { from: '공장폐수', to: ['공정 세척수', '냉각수', '공업용수', '고순도 공정용수'] },
  ],
  cta: '다음',
}

/* ── 11 C · 물의 미래 ② ────────────────────────── */
export const C2 = {
  eyebrow: 'C · 물의 미래 ②',
  title: ['첨단산업을 움직이는', '환경공학 기술'],
  items: [
    { k: '반도체', color: '#4f5bd5', tag: '초순수', v: '칩을 만드는 데 아주 깨끗한 물이 필요해요', icon: 'chip' },
    { k: '이차전지', color: '#0f9f6e', tag: '금속 회수', v: '버려지는 물에서 자원을 다시 얻어요', icon: 'circular' },
    { k: 'AI 데이터센터', color: '#8b5cf6', tag: '냉각수 재이용', v: '뜨거운 서버를 식히며 물을 아껴요', icon: 'ai' },
    { k: '바이오·의약', color: '#e0527a', tag: '정제수', v: '깨끗한 물로 의약품을 만들어요', icon: 'bio' },
    { k: '에너지', color: '#f08a0c', tag: '바이오가스', v: '물을 처리하며 에너지도 얻어요', icon: 'energy' },
  ],
  cta: '다음',
}

/* ── 암호 3개 (그림 글자 맞히기) — 맞혀야만 다음으로 ─────────────── */
export type Riddle = {
  no: number
  section: string // 'A · 물의 이해'
  emojis: string[] // 그림 파일 이름(twemoji 코드)
  emojiAlt: string[]
  how: string // '소리로 읽기' / '소리 + 뜻'
  hint: string
  answer: string // 띄어쓰기 무시하고 채점
  cheer: [string, string]
  done: string
}
export const RIDDLES: Riddle[] = [
  {
    no: 1,
    section: 'A · 물의 이해',
    emojis: ['1f37e', '2b55', '1f3f0'],
    emojiAlt: ['병', '동그라미', '성'],
    how: '소리로 읽기',
    hint: '병을 일으키는 ○○○ 미생물',
    answer: '병원성',
    cheer: ['정답이에요!', '흙탕물이 조금 맑아졌어요'],
    done: '병 + 원(동그라미) + 성 = 병원성! 병을 일으키는 미생물은 ‘병원성 미생물’이에요.',
  },
  {
    no: 2,
    section: 'B · 물의 변화',
    emojis: ['1f44c', '1f3e0'],
    emojiAlt: ['응(오케이)', '집'],
    how: '소리로 읽기',
    hint: '작은 먼지를 뭉쳐 큰 덩어리로 만드는 처리',
    answer: '응집',
    cheer: ['정답이에요!', '점점 깨끗해지고 있어요'],
    done: '응(오케이) + 집 = 응집! 작은 먼지를 뭉쳐 가라앉히는 처리를 ‘응집’이라고 해요.',
  },
  {
    no: 3,
    section: 'C · 물의 미래',
    emojis: ['ruler', '1fab7', '1f4a7'],
    emojiAlt: ['자', '연꽃', '물(水)'],
    how: '소리 + 뜻',
    hint: '강·호수·지하수처럼 우리가 처음 얻는 물',
    answer: '자연수',
    cheer: ['정답이에요!', '드디어 맑은 물이 됐어요'],
    done: '자 + 연꽃 + 물 수(水) = 자연수! 강·호수·지하수처럼 처음 얻는 물은 ‘자연수’예요.',
  },
]
export const RIDDLE_UI = {
  title: ['암호를', '풀어 보세요!'],
  lead: '전시에서 본 단어가 숨어 있어요.',
  input: '정답 입력',
  placeholder: '글자를 입력해 주세요',
  check: '정답 확인',
  wrong: '거의 다 왔어요! 그림을 다시 소리 내어 읽어 보세요.',
  lock: '정답을 맞혀야 다음으로 넘어가요',
}

/* ── 스탬프 획득 · 워터 스테이션 ─────────────────── */
export const STAMP_GET = [
  { label: 'STAMP 1 / 3', title: '전시 투어 스탬프 획득!', next: '워터 스테이션에서 잠시 쉬어가요~' },
  { label: 'STAMP 2 / 3', title: '경진대회 스탬프 획득!', next: '체험 즐기러 출발~' },
  { label: 'MISSION COMPLETE', title: '스탬프 3개 완성!', next: '' },
]
export const WATER_STATION = {
  title: ['WATER', 'STATION'],
  head: '잠시 쉬어가요',
  body: ['전시 투어 끝!', '경진대회로 가기 전에 물 한 병 챙겨 가세요~!'],
  cta: '다음',
}

/* ── 경진대회 ─────────────────────────────────── */
export const CONTEST = {
  tag: 'CONTEST',
  title: ['2026 에코업 ZERO-WASTE', '혁신기술 아이디어 경진대회'],
  body: '에코업 6대 분야를 바탕으로 대학생들이 ZERO-WASTE 혁신기술 아이디어를 겨뤄요.',
  finalists: '본선 진출 5팀',
  ask: ['어떤 아이디어들이 치열하게', '겨루고 있는지 보러 갈까요?'],
  cta: '작품 보러 가기',
  worksEyebrow: 'STAMP 2 · 경진대회',
  worksTitle: ['본선에 오른', '5팀의 아이디어'],
  teams: [
    { team: 'CWRS', color: '#0e9f8e', school: '고려대학교 세종캠퍼스', logo: 'kus', idea: '동남아시아 농업부산물 매체를 적용한 3단 인공습지 기반 그레이워터 재활용 시스템' },
    { team: 'Re:PASS', color: '#2563eb', school: '고려대학교 서울캠퍼스', logo: 'ku', idea: '메콩강을 살리는 왕겨재 지역순환형 PASS 정화 인프라' },
    { team: '다 함께 차차차', color: '#f0750f', school: '건국대학교', logo: 'konkuk', idea: '광진구 발생 폐기물의 바이오차 제조 및 활용 가능성 평가' },
    { team: '에꽁', color: '#16a34a', school: '영남대학교', logo: 'yu', idea: '꽁초의 두 번째 쓰임 : 담배꽁초 회수 케이스' },
    { team: '바이오스피어', color: '#8b5cf6', school: '전주비전대학교', logo: 'jvision', idea: '태양광발전원 기반 수조·식물 융합형 친환경 공기정화 가습 장치 개발' },
  ],
  qrTitle: 'QR코드를 꼭 찍어 주세요!',
  qrBody: '각 작품 오른쪽 위 QR코드를 찍으면 스탬프가 찍혀요!',
  qrCta: 'QR코드 찍기',
  scanTitle: ['작품 오른쪽 위', 'QR을 찍어 주세요'],
}

/* ── 체험 ─────────────────────────────────────── */
export const HANDS = {
  eyebrow: 'STAMP 3 · 체험',
  title: ['직접', '만들어 볼까요?'],
  lead: '두 체험 중 하나만 해도 돼요.',
  programs: [
    { id: 'led', color: '#9b5cf6', soft: '#f1eafe', name: '아크릴 무드등 만들기', desc: '나만의 아크릴 LED 무드등을 꾸며요.', gift: '선물 · 완성한 무드등', icon: 'lamp' },
    { id: 'filter', color: '#0b9fd0', soft: '#e3f6fc', name: '맑은 물 정수하기', desc: '흙탕물을 직접 걸러 깨끗한 물을 만들어요.', gift: '선물 · 정수기 만들기 키트', icon: 'filter' },
  ],
  qrTitle: 'QR코드를 꼭 찍어 주세요!',
  qrBody: '체험이 끝나면 체험 테이블 위에 있는 QR코드를 찍어야 스탬프가 찍혀요.',
  qrCta: 'QR코드 찍기',
  scanTitle: ['체험 테이블의', 'QR을 찍어 주세요'],
}

export const SCAN = {
  guide: 'QR을 사각형 안에 맞춰 주세요',
  auto: 'QR이 인식되면 자동으로 스탬프가 찍혀요',
  close: '닫기',
  wrongCode: '이 QR은 이 스탬프용이 아니에요',
  noCamera: '카메라를 쓸 수 없어요. 아래 ‘스태프 확인’을 눌러 주세요.',
  staff: '카메라가 안 되나요? 스태프 확인',
  staffLead: '스태프 번호 4자리를 넣으면 스탬프를 대신 찍어 드려요',
}

/* ── 완주 · 등록 · 설문 · 티켓 ─────────────────── */
export const COMPLETE = {
  giftHead: '선물뽑기 기회 획득!',
  giftBody: ['에코업 수처리 전시관 투어를 모두 마쳤어요.', '참가자 등록 후 안내데스크에서 선물을 뽑아요.'],
  cta: '참가자 등록하고 선물 받기',
}

export const REGISTER = {
  eyebrow: '참가자 등록 1 / 2',
  title: ['선물을 받으려면', '참가자 등록을 해 주세요'],
  name: { label: '1. 이름', placeholder: '홍길동' },
  phone: { label: '2. 휴대폰 번호', note: '010 뒤 번호 8자리만 입력해 주세요', placeholder: '숫자 8자리 (예: 12345678)' },
  who: { label: '3. 구분', options: ['초등학생', '중·고등학생', '대학생', '일반 (대학원생 포함)'] },
  consent: {
    title: '개인정보 수집·이용 동의 (필수)',
    lines: ['수집 항목 · 이름, 휴대폰 번호, 구분', '이용 목적 · 선물 지급 확인 및 결과 보고', '보유 기간 · 행사 종료 후 파기'],
    agree: '동의합니다',
  },
  next: '다음',
  errName: '이름을 적어 주세요',
  errPhone: '010 뒤 숫자 8자리를 적어 주세요',
  errWho: '구분을 골라 주세요',
  errConsent: '개인정보 수집·이용에 동의해 주세요',
}

export type SurveyQ = { id: string; label: string; kind: 'scale' | 'multi' | 'single'; options?: string[]; low?: string; high?: string }
export const SURVEY = {
  eyebrow: '참가자 등록 2 / 2',
  title: ['에코업 수처리 전시관은', '어땠나요?'],
  qs: [
    { id: 'sat', label: '1. 전체 만족도', kind: 'scale', low: '아쉬워요', high: '최고예요' },
    { id: 'understand', label: '2. 전시 내용이 얼마나 이해됐나요?', kind: 'scale', low: '어려웠어요', high: '잘 이해했어요' },
    { id: 'best', label: '3. 가장 기억에 남는 전시', kind: 'multi', options: ['물의 이해', '물의 변화', '물의 미래', '경진대회 작품'] },
    { id: 'fun', label: '4. 가장 재미있었던 프로그램', kind: 'multi', options: ['도슨트 투어 (전시 · 경진대회)', '아크릴 무드등 만들기', '맑은 물 정수하기'] },
    { id: 'career', label: '5. 에코업 분야에 관심이 생겼나요?', kind: 'single', options: ['아니요', '조금', '많이', '진로로 생각해 볼래요'] },
  ] as SurveyQ[],
  multiNote: '중복 선택 가능',
  submit: '등록 완료',
  needAll: '아직 고르지 않은 질문이 있어요',
}

export const TICKET = {
  eyebrow: 'GIFT',
  title: ['선물 교환 티켓이', '발급됐어요!'],
  lead: '안내데스크 스태프에게 이 화면을 보여 주세요.',
  doneTitle: ['선물을', '받았어요!'],
  doneLead: '에코업 수처리 전시관에 와 주셔서 고마워요.',
  label: 'GIFT TICKET',
  ok: '사용 가능',
  used: '사용 완료',
  name: '선물 교환 티켓',
  what: '안내데스크에서 선물뽑기 1회',
  order: (n: number) => `투어 완주 ${n}번째 참가자`,
  fName: '이름',
  fPhone: '휴대폰',
  fNo: '티켓 번호',
  fIssued: '발급',
  fUsed: '사용',
  paid: '지급 완료',
  staffNote: '스태프 전용 · 뽑기를 마친 뒤 눌러 주세요',
  staffBtn: '지급 완료 처리',
  usedBtn: '이미 사용한 티켓이에요',
  pinTitle: '스태프 확인',
  pinLead: '스태프 번호 4자리를 넣어 주세요',
  offline: '연결이 불안정해 임시 티켓으로 표시했어요. 스태프에게 보여 주세요.',
  home: '처음 화면으로',
}

export const STAFF = {
  title: '스태프 화면',
  pin: '스태프 번호',
  enter: '들어가기',
  tabs: ['티켓 지급', '참가 현황'],
}
