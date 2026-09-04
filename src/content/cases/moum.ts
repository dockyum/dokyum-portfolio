import type { CaseStudy } from "../case-study";

const media = {
  hero: {
    src: "assets/projects/moum/hero.png",
    alt: "모음 웹사이트 첫 화면: 시그널 배너와 지금 인기 있는 모음 목록",
    width: 1800,
    height: 1356,
    position: "50% 0%",
  },
  serviceMap: {
    src: "assets/projects/moum/service-map.png",
    alt: "고객이 클래스를 신청하고 호스트가 클래스를 관리·진행하는 모음 서비스 구조도",
    width: 1800,
    height: 1552,
    caption: "고객은 클래스를 신청해 참여하고, 호스트는 클래스를 관리·진행하는 구조",
    span: 7,
  },
  earlySite: {
    src: "assets/projects/moum/early-site.png",
    alt: "합류 당시 모음의 랜딩페이지와 클래스 목록 화면",
    width: 960,
    height: 820,
    caption: "합류 당시 랜딩페이지와 클래스 목록",
    span: 5,
  },
  solutions: {
    src: "assets/projects/moum/solutions.png",
    alt: "클래스 추가, 다른 참여자 보이기, 다른 참여자 후기 보이기 솔루션 화면",
    width: 1800,
    height: 661,
    caption: "클래스 추가 · 다른 참여자 보이기 · 다른 참여자 후기 보이게",
  },
  classes: {
    src: "assets/projects/moum/classes.png",
    alt: "호스트 섭외로 새로 기획한 클래스 카드 목록",
    width: 1420,
    height: 620,
    caption: "호스트 섭외로 새로 기획한 클래스들",
    span: 6,
  },
  hostGuide: {
    src: "assets/projects/moum/host-guide.png",
    alt: "좋은 모음을 만드는 5단계 가이드 영상과 호스트 가이드북",
    width: 1480,
    height: 660,
    caption: "호스트 가이드 영상과 가이드북",
    span: 6,
  },
  participants: {
    src: "assets/projects/moum/participants.png",
    alt: "찜한 사용자와 참여자 블러 이미지, MBTI가 노출된 클래스 카드",
    width: 880,
    height: 410,
    caption: "찜한 사용자, 참여자 블러 이미지와 MBTI 노출",
    span: 6,
  },
  growthChart: {
    src: "assets/projects/moum/growth-chart.png",
    alt: "9월부터 12월까지 신규 가입자 수, 열린 모임 수, 구매 수, 재구매율 성장 차트",
    width: 1800,
    height: 402,
    caption: "신규 가입자 수 12배 · 열린 모임 수 9.5배 · 구매 수 5.2배 · 재구매율 2.5배 (9월 → 12월)",
  },
} as const;

export const moumStory = {
  tagline: "원데이 클래스에서 3:3 미팅하는 데이팅 서비스 (꽃꽂이 소개팅, 공방 소개팅, 산책 소개팅 등)",
  headline: "데이터 분석과 고객 인터뷰로 성장의 핵심 문제가 ‘상품 부족’임을 찾아 상품 클릭률을 개선",
  facts: [
    { label: "책임", value: "웹 기획, 개발, 호스트 영업 지원" },
    {
      label: "핵심 의사결정",
      value: "데이터 분석, 고객 인터뷰로 서비스 성장의 핵심 문제가 상품 부족임을 찾고 상품 추가에 집중",
    },
    { label: "성과", value: "4달간 매출 3.9배 증가" },
    { label: "참여 인원", value: "3명 · 개발자 2명, 운영 매니저 1명" },
  ],
  hero: media.hero,
  chapters: [
    {
      label: "배경",
      title: "MVP에 마케팅으로 고객 유입을 늘렸으나 성장 정체",
      lead: "방문자를 늘리면 성장할 거라 판단했으나 틀렸음을 확인했습니다.",
      groups: [
        {
          title: "1. MVP 웹사이트만 있는 모음에 공동창업자로 합류",
          items: [
            "모음: 원데이클래스에서 3:3 미팅하는 서비스. 구성원: 대표 1인",
            "제품: 신청 가능한 클래스 4개 있는 웹사이트",
          ],
        },
        {
          title: "2. 가입자가 늘어도 매출은 횡보",
          items: ["합류 후 마케팅 프로젝트를 진행하여 가입자는 늘었지만 매출은 횡보 (9월 일별 가입자 5~57명, 매출 0~30만원)"],
        },
      ],
      media: [media.serviceMap, media.earlySite],
    },
    {
      label: "문제",
      title: "왜 클릭을 안 할까? → 사용자가 관심 가는 클래스가 없어 상품 클릭률이 낮음",
      lead: "왜 신청 안 할까? → 지표 검토부터 시작했습니다.",
      quotes: [
        "(UT · 가입 안 한 사용자) 다들 재밌어 보이는데, 저는 관심 가는 게 없네요",
        "(전화 인터뷰 · 가입한 사용자) 운영하는 서비스인지 모르겠어서 네이버에 검색해봤어요",
        "(전화 인터뷰 · 이용한 사용자) 프로그램이 더 다양해야 할 것 같아요. 친구 추천했는데 재밌어 보이는 게 없대요",
      ],
      groups: [
        {
          title: "지표 검토 · 상품 클릭률이 가장 전환이 낮아 원인 파악 필요",
          items: [
            "1. 방문 → 상품 클릭: 약 10%",
            "2. 클릭 → 회원가입 완료: 약 45%",
            "3. 가입 완료 → 신청 버튼 클릭: 약 27%",
            "4. 신청 클릭 → 결제 완료: 약 62%",
          ],
        },
        {
          title: "클릭률 낮은 원인 찾기",
          items: [
            "1. UX 개선하여 A/B 테스트: 랜딩 개선, 프로그램 시간 추가 등 → 변화 없음",
            "2. 고객 만나기: 고객 인터뷰, UT → 50% 이상이 클래스 종류 부족 언급",
          ],
        },
      ],
    },
    {
      label: "가설 및 솔루션",
      title: "낯선 컨셉의 서비스는 신청하는 고객의 ‘흥미’를 끄는 요소가 있어야 한다",
      lead: "예측 가능한 서비스는 ‘특장점’이 있어야 하지만, 낯선 컨셉은 재미로 신청하는 고객이 초기 타겟이라 ‘흥미’가 중요한 것으로 판단했습니다.",
      groups: [
        {
          title: "1. 흥미로운 클래스",
          items: ["클래스 추가: 인바운드 호스트 모집 페이지 개발 (남의 집, 에어비앤비 호스트 모집 참조)"],
        },
        {
          title: "2. 흥미로운 다른 참여자",
          items: [
            "다른 참여자 보이기: 블러로 흐리게 프로필 보이기 (문토 UI/UX 참조)",
            "다른 참여자 후기 보이게: 다른 사용자가 남긴 후기 (언니의 인맥 후기 참조)",
          ],
        },
      ],
      media: [media.solutions],
    },
    {
      label: "액션",
      title: "문토, 탈잉에서 호스트를 영입하여 색다른 클래스와 흥미로운 참여자 추가",
      lead: "초기 서비스라 매력이 없기에 호스트의 프로그램에 직접 참가해서 1:1 영업했습니다.",
      groups: [
        {
          title: "1. 프로그램 30종 이상 추가",
          items: ["호스트 아웃바운드 섭외하여 호스트마다 클래스 신규 기획"],
        },
        {
          title: "2. 호스트 가이드 영상 제작",
          items: ["호스트가 클래스를 더 쉽게 많이 만들 수 있게"],
        },
        {
          title: "3. 참여자의 리뷰 볼 수 있게",
          items: ["서비스 후기 페이지 추가", "가입 없이도 후기 보이도록"],
        },
        {
          title: "4. 다른 참여자 보이게",
          items: ["찜한 사용자, 참여자 블러 이미지와 MBTI", "상세 페이지에도 노출, 참여자의 일부 정보 노출"],
        },
      ],
      media: [media.classes, media.hostGuide, media.participants],
    },
  ],
  outcome: {
    title: "4달간 매출 3.9배 증가",
    detail: ["클릭률 10% → 29%로 증가, 가입자 12배 증가"],
    note: "출처: 모음 IR 자료 (23년 1월)",
    media: [media.growthChart],
  },
  takeaways: [
    {
      title: "문제 발견을 위해선 고객 인터뷰와 UT가 꼭 필요합니다",
      body: [
        "A/B 테스트로 문제를 찾지 못했으나, UT를 해보니 사용자가 목록을 살펴보고만 있는 전혀 예상 못했던 상황을 보았습니다.",
        "고객을 짐작하는 것에는 한계가 있기에 관찰해야 합니다.",
      ],
    },
    {
      title: "호스트 가이드 영상을 만드는 일은 임팩트가 낮기에 하지 말았어야 했다고 생각합니다",
      body: [
        "인바운드 퍼널 구축을 목표로 했으나 당시 목표인 클래스 증가에는 아웃바운드 GTM이 더 효과적이었습니다.",
        "리소스가 많이 들었습니다. 페이지만 만들고 인바운드 추이를 지켜보기만 해도 괜찮았을 것 같습니다.",
      ],
    },
    {
      title: "지표 관리가 안 되면 임팩트 분석이 안 되어 학습이 안 되고 중구난방 개발을 합니다",
      body: [
        "여러 기능을 개발했으나 각각의 지표를 추적하지 않아 어떤 기능이 임팩트가 큰지 알지 못해 이후 중구난방의 개발을 하게 되었습니다.",
      ],
    },
  ],
} as const satisfies CaseStudy;
