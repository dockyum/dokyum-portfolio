import type { Metadata } from "next";

import { CareerTimeline } from "@/components/career/career-timeline";
import { careerEntries, educationEntries, independentEntries } from "@/content/career";

export const metadata: Metadata = {
  title: "커리어",
  description: "제품과 운영을 함께 설계해 온 dokyum kim의 커리어 타임라인입니다.",
  alternates: {
    canonical: "/career",
  },
};

export default function CareerPage() {
  return (
    <main className="career-page">
      <header className="career-hero">
        <p className="career-hero-kicker">CAREER / PRODUCT / OPERATIONS</p>
        <h1>2018 — NOW</h1>
        <p className="career-hero-summary">
          제품 밖의 병목까지 찾아, 사업이 성장하는 구조를 만들어 왔습니다.
        </p>
      </header>

      <CareerTimeline
        careers={careerEntries}
        independent={independentEntries}
        education={educationEntries}
      />

      <section className="career-cta" aria-labelledby="career-cta-heading">
        <p className="career-section-kicker">LET&apos;S WORK TOGETHER</p>
        <h2 id="career-cta-heading">함께 풀어볼 문제가 있나요?</h2>
        <a href="mailto:snfltptkd91@gmail.com">
          이메일로 연락하기 <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
