import type { ProjectSlug } from "./projects";

export type CareerEntry = {
  period: string;
  company: string;
  role: string;
  summary: string;
  highlights: readonly string[];
  projectSlugs: readonly ProjectSlug[];
};

export type EducationEntry = {
  period: string;
  institution: string;
  program: string;
};

export const careerEntries = [
  {
    period: "2026–NOW",
    company: "Touchpoint",
    role: "Independent Product Builder",
    summary: "전문가의 제안, 일정, 결제를 하나의 링크로 연결하는 제품을 직접 설계하고 구현합니다.",
    highlights: ["제품 기획", "디자인", "개발", "결제 구조 검증"],
    projectSlugs: ["touchpoint"],
  },
  {
    period: "2025.05–2026.02",
    company: "서우노드",
    role: "PM",
    summary: "건설 현장 작업 기록 앱과 운영 체계를 함께 재설계했습니다.",
    highlights: ["월 평균 현장 운영비 1,300만원 절감"],
    projectSlugs: ["snode"],
  },
  {
    period: "2022.10–2024.11",
    company: "커피팅주식회사",
    role: "Co-founder, CPO",
    summary: "소개팅 상품, 고객 앱, 매칭 어드민을 0→1로 만들고 운영했습니다.",
    highlights: ["월매출 1,200만원", "매칭 운영 효율 5배 이상"],
    projectSlugs: ["moum", "coffeeting", "matching-admin"],
  },
  {
    period: "2022.03–2022.10",
    company: "프라우들리",
    role: "PM",
    summary: "숙박 자사 웹과 멤버십, 신규 사업 랜딩을 기획했습니다.",
    highlights: ["OTA 수수료 월 약 800만원 절감", "프릴리 신규 사업 웹 개발"],
    projectSlugs: ["butlerlee"],
  },
  {
    period: "2021.06–2021.12",
    company: "룩코",
    role: "Frontend Developer",
    summary: "패션 데이터 수집 도구와 React Native 소셜 기능을 개발했습니다.",
    highlights: ["Python 데이터 수집", "React Native Feed"],
    projectSlugs: [],
  },
  {
    period: "2018.12–2020.10",
    company: "올스케이프",
    role: "Founder/CEO, Frontend Developer",
    summary: "주변 식당 선주문 앱 시공간을 기획하고 개발했습니다.",
    highlights: ["2019 예비창업패키지 선정"],
    projectSlugs: [],
  },
  {
    period: "2016.10–2018.11",
    company: "피그위",
    role: "Founder/CEO",
    summary: "첫 창업 경험을 통해 제품과 사업 운영의 전 과정을 익혔습니다.",
    highlights: [],
    projectSlugs: [],
  },
] as const satisfies readonly CareerEntry[];

export const educationEntries = [
  { period: "2020.12–2021.05", institution: "FastCampus", program: "Data Science School" },
  { period: "2016.03–2017.12", institution: "멋쟁이사자처럼", program: "코딩 교육 동아리 4기·5기" },
  { period: "2011.03–2020.02", institution: "서울시립대학교", program: "건축학 학사" },
] as const satisfies readonly EducationEntry[];
