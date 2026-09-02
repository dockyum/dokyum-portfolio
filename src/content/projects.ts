export type ProjectSlug =
  | "touchpoint"
  | "butlerlee"
  | "snode"
  | "coffeeting"
  | "matching-admin"
  | "moum";

export type ProjectSections = {
  overview: readonly string[];
  problem: readonly string[];
  judgment: readonly string[];
  execution: readonly string[];
  outcome: readonly string[];
};

export type Project = {
  slug: ProjectSlug;
  route: `/work/${ProjectSlug}`;
  name: string;
  category: string;
  activeLine: string;
  heroOutcome: string;
  role: string;
  period?: string;
  team: string;
  summary: string;
  verifiedMetrics: readonly string[];
  media: {
    card: string;
    hero: string;
    logo: string;
    alt: string;
    accent: string;
  };
  sections: ProjectSections;
};

export const projects = [
  {
    slug: "touchpoint",
    route: "/work/touchpoint",
    name: "Touchpoint",
    category: "0→1 PRODUCT BUILD",
    activeLine: "결제와 일정 조율을 하나의 링크로 통합합니다",
    heroOutcome: "전문가의 유료 미팅을 하나의 링크로 구조화한 0→1 제품 구축",
    role: "Founding Product Builder · PO · Design · Development",
    period: "2026–NOW",
    team: "기획·디자인·개발 1인",
    summary:
      "창작자와 전문가가 제안, 요청, 일정, 결제를 한 프로필 링크에서 관리하도록 설계한 0→1 제품입니다.",
    verifiedMetrics: [],
    media: {
      card: "assets/projects/touchpoint/card.jpg",
      hero: "assets/projects/touchpoint/card.jpg",
      logo: "assets/projects/touchpoint/logo.svg",
      alt: "Touchpoint 프로필과 미팅 상품 화면을 사용하는 장면",
      accent: "#ff6b5f",
    },
    sections: {
      overview: [
        "창작자와 전문가는 유료 상담이나 미팅을 열어도 소개, 신청, 일정 조율, 결제가 서로 다른 도구와 메시지에 흩어져 있었습니다.",
        "Touchpoint는 제공할 미팅과 신청 조건을 정리하고, 하나의 프로필 링크에서 요청부터 결제까지 이어지도록 만든 제품입니다.",
      ],
      problem: [
        "DM과 이메일로 요청을 받으면 필요한 정보가 빠지고, 일정과 가격을 다시 물으며, 결제 의사와 실제 참석 의사를 구분하기 어려웠습니다.",
        "요청자는 무엇을 준비해야 하는지 모르고, 제공자는 반복 조율과 노쇼 위험을 떠안는 구조였습니다.",
      ],
      judgment: [
        "프로필을 예쁘게 보여주는 것보다 제안, 요청, 일정, 결제의 순서를 하나의 흐름으로 묶는 것이 먼저라고 판단했습니다.",
        "미팅 조건을 쉽게 구성하고 결제를 의향 필터로 쓰면 제공자는 더 적은 대화로 준비된 요청을 받을 수 있다는 가설을 세웠습니다.",
      ],
      execution: [
        "프로필, 미팅 상품, 온보딩, 신청 폼, 대시보드, 일정, 결제, 다국어, 이벤트 측정을 직접 설계하고 구현했습니다.",
        "국내 C2C 결제 심사에서 제약을 확인한 뒤 결제를 억지로 우회하지 않고, 글로벌 법인과 Stripe를 전제로 시장과 결제 구조를 다시 설계하는 방향으로 전환했습니다.",
      ],
      outcome: [
        "요청부터 운영까지 연결되는 제품 전 범위를 실제로 구축했지만 시장 반응과 성장성은 아직 검증 전입니다.",
        "이번 단계의 성과는 숫자를 과장하는 대신, 결제 규제가 제품 범위와 시장 선택을 바꿀 수 있다는 점을 빠르게 확인하고 다음 검증 순서를 명확히 한 것입니다.",
      ],
    },
  },
  {
    slug: "butlerlee",
    route: "/work/butlerlee",
    name: "Butlerlee",
    category: "OWNED WEB · MEMBERSHIP",
    activeLine: "OTA 의존도를 97%에서 70%로 낮췄습니다",
    heroOutcome: "자사 웹과 멤버십을 다시 설계해 월 약 800만원의 수수료 절감",
    role: "PM · 웹 기획 · 운영 관리",
    period: "2022.03–2022.09",
    team: "디자이너 · 콘텐츠 마케터 · 컨시어지 · 외주 개발",
    summary:
      "서촌과 북촌의 한옥 스테이 서비스가 OTA에 의존하던 예약 구조를 자사 웹과 멤버십 중심으로 전환한 프로젝트입니다.",
    verifiedMetrics: ["OTA 의존도 97% → 70%", "월 약 800만원 수수료 절감"],
    media: {
      card: "assets/projects/butlerlee/card.png",
      hero: "assets/projects/butlerlee/card.png",
      logo: "assets/projects/butlerlee/logo.png",
      alt: "Butlerlee 한옥 스테이와 자사 예약 웹 화면",
      accent: "#d6b98b",
    },
    sections: {
      overview: [
        "Butlerlee는 서촌과 북촌에서 한옥 스테이를 운영했지만 예약의 약 97%가 OTA에 집중돼 있었습니다.",
        "고객과의 관계는 플랫폼에 남고, 재방문이 생겨도 수수료를 반복해서 부담하는 구조였습니다.",
      ],
      problem: [
        "기존 자사 웹은 숙소의 매력과 예약 이유를 충분히 전달하지 못했고, 고객을 다시 불러올 회원 관계도 없었습니다.",
        "채널 의존 문제는 화면만 고치는 것으로 풀리지 않았고 콘텐츠, 예약, 운영, 재방문을 함께 연결해야 했습니다.",
      ],
      judgment: [
        "OTA를 단숨에 없애기보다 자사 웹에서 예약할 이유를 만들고, 기존 고객의 재방문을 멤버십으로 축적하는 접근을 택했습니다.",
        "숙소 탐색부터 예약까지의 신뢰를 높이고 운영팀이 관리 가능한 흐름을 만들면 자사 예약 비중이 커질 것으로 판단했습니다.",
      ],
      execution: [
        "웹 정보 구조와 숙소 상세, 예약 흐름을 다시 기획하고 디자이너, 콘텐츠 마케터, 컨시어지팀, 외주 개발팀의 실행을 조율했습니다.",
        "멤버십 체계를 구축하고 자사 예약과 재방문을 운영에서 계속 관리할 수 있도록 정책과 업무 흐름을 함께 정리했습니다.",
      ],
      outcome: [
        "OTA 예약 의존도를 약 97%에서 70%로 낮추고 자사 웹 예약과 재방문 비중을 높였습니다.",
        "Airbnb 등 OTA 수수료로 나가던 비용을 월 약 800만원 절감하며, 자사 채널이 실제 손익 구조를 바꾸는 제품이 되도록 만들었습니다.",
      ],
    },
  },
  {
    slug: "snode",
    route: "/work/snode",
    name: "Snode",
    category: "FIELD APP · OPERATIONS",
    activeLine: "현장 관리비 월 1,300만원 절감",
    heroOutcome: "작업 기록 앱과 운영 체계를 함께 바꿔 월 평균 1,300만원 절감",
    role: "PO · 기획 · 운영 관리",
    period: "2025.05–2026.02",
    team: "백엔드 2 · 현장 관리 4 · 운영 4",
    summary:
      "건설 현장의 작업 기록 오류와 관리 병목을 앱, 어드민, 체크리스트, 역할 체계로 함께 해결한 프로젝트입니다.",
    verifiedMetrics: ["월 평균 1,300만원 운영비 절감"],
    media: {
      card: "assets/projects/snode/card.jpg",
      hero: "assets/projects/snode/card.jpg",
      logo: "assets/projects/snode/logo.png",
      alt: "건설 현장에서 Snode 앱으로 작업 기록을 관리하는 모습",
      accent: "#f4c94b",
    },
    sections: {
      overview: [
        "월매출 약 8억원 규모의 건설 인력 회사는 현장 기록의 변동성과 내부 관리 역량 부족 때문에 추가 수주를 받기 어려웠습니다.",
        "이미 외주 개발에 1억 5천만원 이상을 투입했지만 회사의 성장 병목과 맞지 않는 기능이 만들어지고 있었습니다.",
      ],
      problem: [
        "엑셀과 수기 중심의 작업 기록은 오류가 잦았고, 현장별 책임과 업무 기준이 정리되지 않아 관리자에게 일이 몰렸습니다.",
        "기록 신뢰가 낮아 공사 대금 증빙과 추가 물량 대응이 어려웠고, 성장 문제와 운영비 문제가 같은 원인에서 발생했습니다.",
      ],
      judgment: [
        "AI 도면 같은 특수 기능보다 매출 손실과 관리비를 줄이는 기록 시스템이 우선이라고 판단해 진행 중이던 외주 프로젝트를 중단했습니다.",
        "현장에 익숙하고 검증 가능한 앱과 운영 기준을 함께 제공하면 리스크가 줄고 더 많은 현장을 관리할 수 있다고 봤습니다.",
      ],
      execution: [
        "현장 관리자와 짧게 자주 확인할 수 있도록 AI로 프로토타입을 만들고 출근, 작업, 누적 공수, 생산성 리포트 흐름을 앱과 어드민으로 연결했습니다.",
        "시간대별 체크리스트, 업무 매뉴얼, 정기 교육, 역할과 책임까지 정리해 제품을 실제 운영 체계 안에 정착시켰습니다.",
      ],
      outcome: [
        "관리자가 현장 업무에 쓰던 비용을 기준으로 월 평균 1,300만원의 운영비를 절감했습니다.",
        "기능보다 사람과 책임을 정리하는 일이 더 어려웠고, 다른 직무의 문제를 풀려면 논리뿐 아니라 지속적인 설득과 신뢰가 필요하다는 점을 배웠습니다.",
      ],
    },
  },
  {
    slug: "coffeeting",
    route: "/work/coffeeting",
    name: "Coffeeting",
    category: "MVP · PRODUCT MARKET LEARNING",
    activeLine: "MVP 5개월 만에 월매출 1,200만원",
    heroOutcome: "고객의 낭비 비용을 줄인 50분 소개팅으로 MVP를 매출까지 연결",
    role: "PM · 기획 · 프런트엔드 개발",
    period: "2023.05–2023.10",
    team: "개발 2 · 운영 매니저 1",
    summary:
      "고객 인터뷰와 상품 판매 실험으로 O2O 소개팅의 핵심 비용을 찾고 5개월 만에 월매출 1,200만원을 만든 프로젝트입니다.",
    verifiedMetrics: ["월매출 1,200만원", "1개월 재구매율 남성 58% · 여성 52%"],
    media: {
      card: "assets/projects/coffeeting/card.jpg",
      hero: "assets/projects/coffeeting/card.jpg",
      logo: "assets/projects/coffeeting/logo.png",
      alt: "Coffeeting 앱의 소개팅 신청과 매칭 안내 화면",
      accent: "#f67b91",
    },
    sections: {
      overview: [
        "기존 모음 서비스는 재구매율이 낮고 광고를 멈추면 호스트가 이탈하는 구조여서 성장성이 제한적이었습니다.",
        "재구매가 가능한 소개팅으로 피벗하되, 이미 많은 앱이 실패한 이유부터 다시 확인했습니다.",
      ],
      problem: [
        "인터뷰에서 고객의 80%는 돈, 시간, 감정이 낭비될 것 같아 소개팅 서비스를 다시 이용하지 않는다고 답했습니다.",
        "상대를 찾고 약속을 잡고 원하지 않는 만남을 끝까지 이어가는 전 과정의 에너지가 재구매를 막고 있었습니다.",
      ],
      judgment: [
        "얼굴을 먼저 보여주는 것보다 원하는 조건에 맞는 상대를 찾아주고, 시간과 장소를 대신 정하며, 만남 시간을 제한하는 것이 핵심이라고 판단했습니다.",
        "고객이 쓰는 심리적·운영적 에너지를 줄이면 얼굴을 미리 보지 않아도 반복 구매가 가능하다는 가설을 세웠습니다.",
      ],
      execution: [
        "셀프 찾기, GPT 추천, 가격대, 조건 선택, 얼굴 공개 여부, 종료 시간 등 상품 변수를 실제 판매와 인터뷰로 검증했습니다.",
        "신청과 결제, 조건 입력, 주 1회 매칭, 카페와 시간 조율, 50분 대화 후 OX 선택까지를 하나의 서비스로 체계화했습니다.",
      ],
      outcome: [
        "MVP 유료 신청자 30명과 매출 60만원에서 시작해 5개월 만에 월매출 1,200만원을 달성했습니다.",
        "1개월 재구매율은 남성 58%, 여성 52%였고, 고객이 원하는 기능보다 피하고 싶은 비용을 먼저 찾는 것이 상품 설계의 출발점임을 확인했습니다.",
      ],
    },
  },
  {
    slug: "matching-admin",
    route: "/work/matching-admin",
    name: "Matching Admin",
    category: "BACK OFFICE · AUTOMATION",
    activeLine: "1팀 처리 35분 → 4.15분",
    heroOutcome: "사람의 판단은 빠르게, 반복 업무는 자동화해 운영 효율 5배 이상 향상",
    role: "PM · 기획 · 디자인 · 개발 관리",
    period: "2023.09–2024.11",
    team: "백엔드 개발 2",
    summary:
      "수기 매칭과 일정 안내를 판단 업무와 반복 업무로 나누고, 매칭 처리 시간을 35분에서 4.15분으로 줄인 백오피스 프로젝트입니다.",
    verifiedMetrics: ["1팀 처리 35분 → 4.15분", "운영 효율 5배 이상"],
    media: {
      card: "assets/projects/matching-admin/card-anonymized.png",
      hero: "assets/projects/matching-admin/card-anonymized.png",
      logo: "assets/projects/coffeeting/logo.png",
      alt: "Coffeeting 매칭 관리 어드민에서 후보자를 비교하는 화면",
      accent: "#9b83ee",
    },
    sections: {
      overview: [
        "신청자가 늘자 매칭, 시간과 장소 조율, 안내, 변경과 취소, 비상 대응을 엑셀과 전화로 처리하던 운영팀이 수요를 감당하지 못했습니다.",
        "개발자까지 NoSQL 데이터 입력에 투입됐고, 추가 채용은 주말 비정기 업무와 낮은 마진 때문에 지속 가능한 해법이 아니었습니다.",
      ],
      problem: [
        "사람이 사회적 배경과 얼굴을 함께 판단해주는 경험은 Coffeeting의 구매 이유라 매칭 자체를 단기간에 자동화할 수 없었습니다.",
        "반면 일정 안내와 상태 변경 같은 반복 업무까지 사람이 처리해 고객 안내가 늦고, 매칭을 받지 못한 신청자가 이탈했습니다.",
      ],
      judgment: [
        "매칭 만족도를 먼저 정교화하기보다 고객이 매칭 자체를 받지 못하는 병목을 해소하는 것이 우선이라고 판단했습니다.",
        "판단이 필요한 매칭은 더 빠르게 비교하도록 만들고, 반복되는 일정과 안내는 자동화하면 1인당 관리량을 크게 늘릴 수 있다고 봤습니다.",
      ],
      execution: [
        "3주 안에 매칭 생성, 조건 필터, 남녀 프로필 비교, 일정 수정, 안내 문자, 당일 대응을 포함한 모바일 대응 어드민을 기획했습니다.",
        "지역과 나이 기본 필터, 중요 조건 비교표, 전체 조건 비교, 로딩과 검색 개선, 프로필 점수 필터를 처리 시간 기준으로 반복 개선했습니다.",
      ],
      outcome: [
        "1팀 처리 시간은 약 35분에서 4.15분으로 줄어 운영 효율이 5배 이상 높아졌습니다.",
        "속도 개선과 함께 매칭 성사율이 낮아지는 부작용도 확인해, 핵심 지표뿐 아니라 사람의 피로도와 사이드 이펙트 지표까지 함께 봐야 한다는 점을 배웠습니다.",
      ],
    },
  },
  {
    slug: "moum",
    route: "/work/moum",
    name: "Moum",
    category: "FUNNEL · SUPPLY GROWTH",
    activeLine: "4개월 만에 매출 3.9배",
    heroOutcome: "UX가 아니라 상품 부족을 병목으로 다시 정의해 클릭률과 매출을 성장",
    role: "PM · 기획 · 디자인 · 프런트엔드 개발",
    period: "2022.10–2023.01",
    team: "개발 2 · 운영 매니저 1",
    summary:
      "데이터와 사용자 관찰로 낮은 상품 클릭률의 원인을 상품 부족에서 찾고 클릭률을 10%에서 29%로 높인 프로젝트입니다.",
    verifiedMetrics: ["상품 클릭률 10% → 29%", "4개월 매출 3.9배"],
    media: {
      card: "assets/projects/moum/card.png",
      hero: "assets/projects/moum/card.png",
      logo: "assets/projects/moum/logo.png",
      alt: "Moum 웹사이트에서 다양한 원데이클래스 소개팅을 탐색하는 화면",
      accent: "#68bfae",
    },
    sections: {
      overview: [
        "원데이클래스에서 3대3으로 만나는 데이팅 서비스에 합류해 마케팅으로 가입자를 늘렸지만 매출은 그대로였습니다.",
        "방문자를 더 데려오면 성장한다는 초기 판단이 틀렸고, 퍼널 안에서 실제로 멈추는 지점을 다시 찾아야 했습니다.",
      ],
      problem: [
        "방문에서 상품 클릭으로 넘어가는 비율이 약 10%로 가장 낮았고, 랜딩과 시간 정보 같은 UX A/B 테스트로는 변화가 없었습니다.",
        "인터뷰와 사용성 테스트에서 절반 이상이 관심 가는 클래스가 부족해 목록만 보고 나간다는 사실을 확인했습니다.",
      ],
      judgment: [
        "낯선 서비스의 초기 고객은 설명보다 흥미로운 클래스와 함께할 사람을 보고 신청한다고 판단했습니다.",
        "화면을 더 다듬는 대신 상품 공급과 참여자 정보를 늘리는 것이 클릭과 신청을 동시에 움직일 핵심 가설이었습니다.",
      ],
      execution: [
        "문토와 탈잉에서 호스트를 직접 영입하고 프로그램에 참여하며 30종 이상의 클래스를 새로 기획했습니다.",
        "후기 공개, 참여자 블러 이미지와 MBTI, 상세 페이지 참여자 정보로 다른 사람에 대한 궁금증을 제품 안에 반영했습니다.",
      ],
      outcome: [
        "상품 클릭률은 10%에서 29%로, 가입자는 12배로 늘었고 4개월 동안 매출은 3.9배 성장했습니다.",
        "인바운드 호스트 가이드처럼 당시 목표에 직접 닿지 않는 작업도 있었고, 모든 기능에 지표를 연결하지 않으면 무엇이 성장에 기여했는지 학습할 수 없다는 점을 배웠습니다.",
      ],
    },
  },
] as const satisfies readonly Project[];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectNeighbors(slug: ProjectSlug): {
  previous?: Project;
  next?: Project;
} {
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return {};
  }

  return {
    previous: projects[index - 1],
    next: projects[index + 1],
  };
}
