import type { CaseStudy } from "./case-study";
import { butlerleeStory } from "./cases/butlerlee";
import { coffeetingStory } from "./cases/coffeeting";
import { matchingAdminStory } from "./cases/matching-admin";
import { moumStory } from "./cases/moum";
import { snodeStory } from "./cases/snode";
import { touchpointStory } from "./cases/touchpoint";

export type ProjectSlug =
  | "touchpoint"
  | "butlerlee"
  | "snode"
  | "coffeeting"
  | "matching-admin"
  | "moum";

export type ProjectKind = "career" | "independent";

export const projectKindLabels = {
  career: "CAREER",
  independent: "INDEPENDENT",
} as const satisfies Record<ProjectKind, string>;

export type Project = {
  slug: ProjectSlug;
  route: `/work/${ProjectSlug}`;
  name: string;
  kind: ProjectKind;
  category: string;
  /** Which problem the project solved; shown on the landing runway and neighbour links. */
  problemLine: string;
  /** Project traits shown as hashtags in the Work menu. */
  tags: readonly string[];
  role: string;
  period?: string;
  team: string;
  product: string;
  tools?: string;
  summary: string;
  media: {
    card: string;
    logo: string;
    alt: string;
    accent: string;
  };
  story: CaseStudy;
};

export const projects = [
  {
    slug: "snode",
    route: "/work/snode",
    name: "Snode",
    category: "FIELD APP · OPERATIONS",
    kind: "career",
    problemLine: "작업 기록의 오류로 추가 수주를 못하는 문제를 해결하는 앱·어드민 개발",
    tags: ["#0to1", "#E2E", "#운영프로세스개선", "#AI업무적용"],
    role: "PO · 기획 · 운영 관리",
    period: "2025.05–2026.02",
    team: "10명 · B.E. 2 · 현장 관리 4 · 운영 4",
    product: "앱 (현장용) · 웹 어드민 (사무실용)",
    tools: "Notion / Linear · Figma · Lovable / Claude Code",
    summary:
      "건설 현장의 작업 기록 오류와 관리 병목을 앱, 어드민, 체크리스트, 역할 체계로 함께 해결한 프로젝트입니다.",
    media: {
      card: "assets/projects/snode/card.jpg",
      logo: "assets/projects/snode/logo.png",
      alt: "건설 현장 사진 위에 겹친 Snode 앱의 작업 달력 화면",
      accent: "#f4c94b",
    },
    story: snodeStory,
  },
  {
    slug: "coffeeting",
    route: "/work/coffeeting",
    name: "Coffeeting",
    category: "MVP · PRODUCT MARKET LEARNING",
    kind: "career",
    problemLine: "고객 인터뷰와 MVP 테스트로 O2O 소개팅 서비스를 0to1 출시",
    tags: ["#0to1", "#E2E", "#고객가설검증", "#요구사항구조화"],
    role: "PM · 기획 · F.E. 개발",
    period: "2023.05–2023.10",
    team: "3명 · 개발자 2 · 운영 매니저 1",
    product: "앱 · 매칭 관리용 어드민",
    summary:
      "고객 인터뷰와 상품 판매 실험으로 O2O 소개팅의 핵심 비용을 찾고 5개월 만에 월매출 1,200만원을 만든 프로젝트입니다.",
    media: {
      card: "assets/projects/coffeeting/card.jpg",
      logo: "assets/projects/coffeeting/logo.png",
      alt: "Coffeeting 앱의 소개팅 신청과 매칭 안내 화면",
      accent: "#f67b91",
    },
    story: coffeetingStory,
  },
  {
    slug: "matching-admin",
    route: "/work/matching-admin",
    name: "Matching Admin",
    category: "BACK OFFICE · AUTOMATION",
    kind: "career",
    problemLine: "매칭 매니저 업무의 효율 증가를 목표로 업무 유형에 따라 자동화·최적화",
    tags: ["#백오피스E2E", "#업무자동화", "#운영효율화"],
    role: "PM · 기획 · 디자인 · 개발 관리",
    period: "2023.09–2024.11",
    team: "2명 · B.E. 개발 2",
    product: "매칭 관리용 웹 어드민 (모바일 대응)",
    summary:
      "수기 매칭과 일정 안내를 판단 업무와 반복 업무로 나누고, 매칭 처리 시간을 35분에서 4.15분으로 줄인 백오피스 프로젝트입니다.",
    media: {
      card: "assets/projects/matching-admin/card-anonymized.png",
      logo: "assets/projects/coffeeting/logo.png",
      alt: "Coffeeting 매칭 관리 어드민에서 후보자를 비교하는 화면",
      accent: "#9b83ee",
    },
    story: matchingAdminStory,
  },
  {
    slug: "moum",
    route: "/work/moum",
    name: "Moum",
    category: "FUNNEL · SUPPLY GROWTH",
    kind: "career",
    problemLine: "사용자가 관심 가는 클래스가 없어 낮았던 상품 클릭률을 개선",
    tags: ["#퍼널분석", "#전환율개선", "#고객리서치"],
    role: "PM · 기획 · 디자인 · F.E. 개발",
    period: "2022.10–2023.01",
    team: "3명 · 개발자 2 · 운영 매니저 1",
    product: "웹",
    summary:
      "데이터와 사용자 관찰로 낮은 상품 클릭률의 원인을 상품 부족에서 찾고 클릭률을 10%에서 29%로 높인 프로젝트입니다.",
    media: {
      card: "assets/projects/moum/card.png",
      logo: "assets/projects/moum/logo.png",
      alt: "Moum 웹사이트에서 다양한 원데이클래스 소개팅을 탐색하는 화면",
      accent: "#68bfae",
    },
    story: moumStory,
  },
  {
    slug: "butlerlee",
    route: "/work/butlerlee",
    name: "Butlerlee",
    category: "OWNED WEB · MEMBERSHIP",
    kind: "career",
    problemLine: "예약의 97%가 OTA에 집중된 구조를 자사 웹과 멤버십 중심으로 전환",
    tags: ["#자사웹전환", "#멤버십설계", "#OTA의존도개선", "#외주개발관리"],
    role: "PM · 웹 기획 · 운영 관리",
    period: "2022.03–2022.09",
    team: "디자이너 · 콘텐츠 마케터 · 컨시어지 · 외주 개발",
    product: "자사 예약 웹 · 멤버십",
    summary:
      "서촌과 북촌의 한옥 스테이 서비스가 OTA에 의존하던 예약 구조를 자사 웹과 멤버십 중심으로 전환한 프로젝트입니다.",
    media: {
      card: "assets/projects/butlerlee/card.png",
      logo: "assets/projects/butlerlee/logo.png",
      alt: "Butlerlee 한옥 스테이와 자사 예약 웹 화면",
      accent: "#d6b98b",
    },
    story: butlerleeStory,
  },
  {
    slug: "touchpoint",
    route: "/work/touchpoint",
    name: "Touchpoint",
    category: "0→1 PRODUCT · AI SYSTEM BUILD",
    kind: "independent",
    problemLine: "1인 개발의 처리량 한계를 AI 에이전트 하네스로 풀어 0→1 제품을 구축·운영",
    tags: ["#0to1", "#1인빌드", "#AI하네스", "#에이전트워크플로", "#일정결제통합"],
    role: "Founding Product Builder · PO · AI 시스템 설계 · 개발",
    period: "2026–NOW",
    team: "사람 1 · Hermes(PM 리뷰 에이전트) · Claude Code(구현 에이전트)",
    product: "프로필 링크 · 미팅 상품 · 대시보드 · 결제",
    tools: "Linear · Hermes · Claude Code · Codex CLI · Figma · Supabase · Vercel",
    summary:
      "기획, 디자인, 개발, 운영을 1인이 감당하기 위해 Hermes와 Claude Code로 PM 리뷰, 구현, 검수, 배포, 에러 트리아지가 순환하는 에이전트 하네스를 만들고, 그 위에서 유료 미팅 링크 제품 Touchpoint를 0→1로 구축한 프로젝트입니다.",
    media: {
      card: "assets/projects/touchpoint/card.jpg",
      logo: "assets/projects/touchpoint/logo.svg",
      alt: "Touchpoint 프로필과 미팅 상품 화면을 사용하는 장면",
      accent: "#ff6b5f",
    },
    story: touchpointStory,
  },
] as const satisfies readonly Project[];

export function getProjectsByKind(kind: ProjectKind): Project[] {
  return projects.filter((project) => project.kind === kind);
}

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
