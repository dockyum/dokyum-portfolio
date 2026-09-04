import type { CaseStudy } from "../case-study";

const media = {
  hero: {
    src: "assets/projects/matching-admin/card-anonymized.png",
    alt: "커피팅 매칭 관리 어드민의 매칭 만들기 화면 (샘플 데이터)",
    width: 1732,
    height: 908,
  },
  excelSheet: {
    src: "assets/projects/matching-admin/excel-sheet.png",
    alt: "엑셀로 관리하던 기존 매칭 관리 시트",
    width: 880,
    height: 350,
    caption: "기존 매칭 관리 시트 (엑셀)",
    span: 6,
  },
  figmaSchedule: {
    src: "assets/projects/matching-admin/figma-schedule.png",
    alt: "만남 조율, 안내, 비상 대응을 위한 매칭 목록 화면의 Figma 설계",
    width: 960,
    height: 870,
    caption: "만남 조율·안내·비상 대응 화면 (Figma MVP)",
    span: 6,
  },
  matchingUi: {
    src: "assets/projects/matching-admin/matching-ui.png",
    alt: "여성과 남성 프로필, 요청에 맞는 조건을 나란히 비교하는 남녀 매칭 화면",
    width: 1050,
    height: 760,
    caption: "남녀 매칭: 여·남 프로필과 요청 조건 비교",
    span: 6,
  },
  kakaoFlow: {
    src: "assets/projects/matching-admin/kakao-flow.png",
    alt: "신청부터 만남 후 OX 선택까지 단계별 카카오톡 자동 안내 흐름도",
    width: 1800,
    height: 297,
    caption: "카카오톡 자동 안내 흐름도: 신청 → 매칭 → 만남 전 → 만남 당일 → 만남 후 OX 선택",
  },
  filterExperiment: {
    src: "assets/projects/matching-admin/filter-experiment.png",
    alt: "직업, 지역, 나이 기본 필터를 비교한 후보 검색 화면 실험",
    width: 1590,
    height: 530,
    caption: "기본 필터 실험: 직업 19시간/80팀 → 지역 18시간/80팀 → 나이 16시간/80팀",
    span: 6,
  },
  compareExperiment: {
    src: "assets/projects/matching-admin/compare-experiment.png",
    alt: "상대 프로필 조건 표시 초안, 중요 3조건 비교표, 전체 조건 비교표를 비교한 실험",
    width: 1750,
    height: 530,
    caption: "비교 UI 실험: 초안 → 중요 3조건 비교표 14시간/80팀 → 전체 조건 비교표 12시간/80팀",
    span: 6,
  },
} as const;

export const matchingAdminStory = {
  tagline: "매니저가 남녀 매칭부터 만남 조율, 안내, 비상 대응까지 처리하는 커피팅 운영 어드민",
  headline: "매칭 매니저 업무의 효율 증가를 목표로 업무 유형에 따라 자동화·최적화",
  facts: [
    {
      label: "책임",
      value: "운영 효율성 문제 정의부터 어드민 기획, 디자인, 개발 관리, 제품 개선 리드",
    },
    {
      label: "핵심 의사결정",
      value:
        "운영 효율성과 매칭 만족도 중 선택할 때, 고객이 매칭을 못 받는 게 핵심 문제고 매칭 만족도는 차차 개선 가능한 문제이기에 운영 효율 개선을 우선 목표로 개발",
    },
    { label: "성과", value: "운영 효율 5배 증가" },
    { label: "참여 인원", value: "2명 · B.E. 개발 2명" },
  ],
  hero: media.hero,
  chapters: [
    {
      label: "문제",
      title: "매칭 운영 업무가 효율이 낮아 신청자 증가를 감당 못 함, 성장 정체로 이어질 가능성 발견",
      quotes: ["챙겨주신다 해서 신청했는데 매칭도 안 되고 연락도 없네요. 탈퇴할게요. 환불해주세요."],
      groups: [
        {
          title: "원인 · 전 과정을 수기 관리",
          items: [
            "업무 범위: 남녀 매칭, 만남 시간/장소 약속 조율, 만남 일정 안내, 변경 및 취소 안내, 비상 대응",
            "업무 방식: 엑셀과 전화",
          ],
        },
        {
          title: "원인 · 시스템 없음",
          items: [
            "9월부터 신청자 수 증가로 매칭에 개발자도 투입",
            "매칭 데이터 관리는 제가 NoSQL DB에 직접 입력",
          ],
        },
        {
          title: "제약 1. 매칭은 자동화하기 어려움",
          items: [
            "커피팅 쓰는 이유가 ‘사람이 만남 관리해줘서’",
            "자동화를 고려했으나, 단기간 매칭 자동화 시 사회적 배경, 얼굴 등 고객 경험이 떨어질 문제가 있음",
          ],
        },
        {
          title: "제약 2. 추가 채용으로 해결 어려움",
          items: [
            "지각, 노쇼 등의 비상 상황 때문에 고객센터 대기로 토·일 근무",
            "비정기 업무, 인건비 지출 시 이익이 안 남아 채용으로 문제 해결 안 됨",
          ],
        },
        {
          title: "영향 · 고객 경험 떨어져 이탈 발생",
          items: [
            "매니저 시간 부족하여 매칭을 못 받음",
            "매칭 후 안내 부족하여 고객 당황",
            "주말 대기 인력이 만남 안내가 늦어져",
          ],
        },
      ],
      media: [media.excelSheet],
    },
    {
      label: "가설 및 목표",
      title: "운영 업무를 시스템화하면, 매니저 1인당 매칭 관리량 3배 이상 증가 가능",
      lead: "목표는 50팀/30시간 → 50팀/8시간. 근거: 3명이 하루 종일 하는 것을 1명이서 처리.",
      body: [
        "빠른 출시를 목표로 개발했습니다. 뛰어난 기능은 나중에, 사용자가 매일 같이 출근하니까 기능 개선은 차차 가능하다고 봤습니다. Figma로 MVP 디자인부터 개발까지 3주가 걸렸습니다.",
      ],
      groups: [
        {
          title: "매칭 생성 Flow",
          items: [
            "1. 여성 후보자 검색해 매칭할 여성 선택",
            "2. 여성 중요조건 필터 후 남성 후보자 검색해 비교해 볼 남성 선택",
            "3. 적합할 경우 매칭 생성, 아니면 다른 남성 선택",
          ],
        },
        {
          title: "만남 조율, 안내, 비상 대응",
          items: [
            "만남 시간 순 목록화",
            "만남 시간, 장소 수정",
            "수정 시 안내 문자 전송",
            "비상 대응: 웹서비스로 개발, 모바일 대응, 사용자 검색",
          ],
        },
      ],
      media: [media.figmaSchedule],
    },
    {
      label: "실행",
      title: "매니저의 판단이 필요한 업무는 효율화, 반복 업무는 자동화",
      lead: "목표) 50팀/8시간 → 결과) 50팀/14시간",
      groups: [
        {
          title: "매니저 판단 업무 · 1. 남녀 매칭",
          items: ["여·남 프로필과 중요조건을 나란히 비교하고, 요청에 맞는 점을 자동으로 계산해 표시"],
        },
        {
          title: "반복 업무 · 2. 매칭 관리",
          items: ["성사되면 만날 카페와 만남 시간 입력/수정"],
        },
        {
          title: "반복 업무 · 3. 소개팅 당일 관리",
          items: ["전날 참석 여부 확인, 안 된 목록 점검", "변동 사항 안내 문자 템플릿 기반 전송"],
        },
        {
          title: "반복 업무 · 4. 카카오톡 자동 안내",
          items: ["신청 → 매칭 → 만남 전 → 만남 당일 → 만남 후 OX 선택까지 단계별 자동 안내"],
        },
      ],
      media: [media.matchingUi, media.kakaoFlow],
    },
    {
      label: "도입 후 개선",
      title: "도입 후 개선 작업 진행",
      lead: "매칭 처리 속도 높이기 — 목표) 4.8분/1팀. 이유: 알바생 1명이 하루 100팀 처리 필요.",
      groups: [
        {
          title: "1) 필터로 프로필 빨리 거르기",
          items: [
            "근거: 매칭 매니저들이 남녀의 특정 조건이 안 맞으면 pass하는 것을 발견",
            "실험: 직업 19시간/80팀 → 지역 18시간/80팀 → 나이 16시간/80팀 → 알고리즘으로 기본 필터 추가",
          ],
        },
        {
          title: "2) 매니저가 남녀 비교를 더 빨리 할 수 있는 UI",
          items: [
            "근거: 매칭 생성 시 남녀 조건 비교하는 시간이 가장 오래 걸림",
            "실험: 상대 프로필에 맞는 조건 표시(초안) → 중요 3조건 비교표 추가 14시간/80팀 → 전체 조건 비교표 추가 12시간/80팀",
          ],
        },
        {
          title: "3) 그 외",
          items: ["데이터 로딩 속도 개선, 사용자 필터 기능 개선, 프로필 점수 기반 필터 추가"],
        },
      ],
      media: [media.filterExperiment, media.compareExperiment],
    },
  ],
  outcome: {
    title: "매칭 속도(1팀 처리 시간) 5배 이상 효율화",
    shift: {
      from: { label: "23년 9월", value: "약 35분/1팀 · (3명 × 8시간 = 24시간) / 41팀" },
      to: { label: "24년 11월", value: "약 4.15분/1팀 · (3명 × 6시간 = 18시간) / 260팀" },
    },
  },
  takeaways: [
    {
      title: "개선 우선순위는 ‘지표’ 기준으로 해야 함을 배웠습니다",
      body: ["운영팀과 대표의 요구가 산발적이고 충돌되었는데, 합의된 지표 기준으로 우선 진행하니 설득력이 생겼습니다."],
    },
    {
      title: "목표는 시스템 효율뿐 아니라 사람 변수까지 고려해 설정해야 함을 배웠습니다",
      body: [
        "매니저가 피로도/집중력이 떨어지는 문제, 정보의 가시성이 높아지니 고민이 느는 문제로 매칭 시간이 추가 소요됐습니다.",
      ],
    },
    {
      title: "사이드 이펙트 지표 추적이 필요합니다",
      body: ["매칭 속도는 더 빨라졌지만 매칭 성사율은 낮아졌습니다."],
    },
  ],
} as const satisfies CaseStudy;
