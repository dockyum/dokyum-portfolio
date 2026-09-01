# Portfolio V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Dokyum Kim's portfolio as a Northzone-informed Korean editorial experience with complete navigation, a resume-backed career timeline, a persisted visitor counter, a public GitHub repository, and a verified Vercel production deployment.

**Architecture:** Keep the Next.js App Router and typed static project content, replace the Sites/Vinext adapter with native Next.js, and split the interface into focused navigation, runway, career, case-study, and visitor modules. Store only an atomic anonymous browser count in Upstash Redis through a Route Handler, then deploy the reviewed `main` branch through GitHub-connected Vercel.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript 5.9, CSS, Vitest, Testing Library, Playwright, Upstash Redis, Vercel, GitHub CLI

**Spec:** `docs/superpowers/specs/2026-09-02-portfolio-v2-design.md`

## Global Constraints

- Korean is the primary language; English is limited to wordmarks, labels, roles, and metadata.
- The main CTA is `mailto:snfltptkd91@gmail.com`.
- The portfolio PDF remains a separate download at `/dokyum-kim-portfolio.pdf`.
- All six existing project routes remain stable and `/work/snod` redirects permanently to `/work/snode`.
- The public resume must not be added; the resume phone number must never enter source or deployed HTML.
- The GitHub repository is public at `dockyum/dokyum-portfolio`.
- The canonical deployment target is Vercel; the former OpenAI Sites project is preserved but removed from source configuration.
- The visitor counter stores only `portfolio:visitor-count:v1` and no identifying data.
- The page remains functional without client JavaScript except for menu state, runway position feedback, and visitor count enhancement.
- Every behavioral change follows RED → GREEN → REFACTOR.

---

## File Map

### Create

- `src/lib/site-url.ts` — resolve canonical origins across local and Vercel builds.
- `src/lib/site-url.test.ts` — verify explicit, Vercel, and local origin resolution.
- `src/content/career.ts` — typed career and education chronology.
- `src/content/career.test.ts` — verify order, coverage, and valid project links.
- `src/components/landing/project-runway.tsx` — direct-link editorial project runway.
- `src/components/landing/project-runway.test.tsx` — landing behavior contract.
- `src/components/career/career-timeline.tsx` — accessible career and education timeline.
- `src/components/career/career-timeline.test.tsx` — chronology rendering contract.
- `src/app/career/page.tsx` — Career route and metadata.
- `src/visitors/register-visit.ts` — pure visitor registration use case.
- `src/visitors/register-visit.test.ts` — increment, read, and failure contracts.
- `src/visitors/redis-store.ts` — Upstash implementation of the visitor store.
- `src/app/api/visitors/route.ts` — cookie-aware visitor Route Handler.
- `src/components/visitor-count.tsx` — non-blocking visitor count client.
- `src/components/visitor-count.test.tsx` — success and unavailable UI behavior.
- `src/components/site-footer.tsx` — global footer with visitor counter and primary links.
- `.env.example` — non-secret Redis and site URL variable names.
- `README.md` — public project documentation.

### Modify

- `package.json` — native Next.js scripts and dependencies.
- `pnpm-lock.yaml` — resolved dependency graph.
- `pnpm-workspace.yaml` — remove obsolete Worker build approvals.
- `.gitignore` — ignore Vercel and environment files while retaining `.env.example`.
- `playwright.config.ts` — run E2E against native Next dev server.
- `src/app/layout.tsx` — new font roles, Vercel-aware metadata, header, and footer.
- `src/app/page.tsx` — replace the carousel with the runway.
- `src/app/globals.css` — editorial design system and responsive layouts.
- `src/components/site-header.tsx` — accessible desktop dropdown and mobile menu.
- `src/components/site-header.test.tsx` — full GNB behavior.
- `src/components/work/project-detail.tsx` — outcome-led editorial case-study structure.
- `src/content/projects.ts` — add periods where the resume supplies them.
- `src/content/projects.test.ts` — keep project route and content guarantees.
- `e2e/portfolio.spec.ts` — desktop, mobile, career, navigation, metadata, and visitor coverage.
- `next.config.ts` — retain only React strict mode and redirect.

### Delete

- `vite.config.ts` — Sites/Vinext build adapter.
- `.openai/hosting.json` — OpenAI Sites project binding.
- `src/components/landing/project-carousel.tsx` — wheel-intercepting carousel.
- `src/components/landing/project-carousel.test.tsx` — obsolete carousel expectations.

## Task 1: Native Next.js Runtime and Canonical URL

**Files:**

- Create: `src/lib/site-url.ts`
- Create: `src/lib/site-url.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `pnpm-workspace.yaml`
- Modify: `playwright.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `e2e/portfolio.spec.ts`
- Delete: `vite.config.ts`

**Interfaces:**

- Produces: `resolveSiteUrl(env?: NodeJS.ProcessEnv): URL`.
- Consumed by: root metadata and all route metadata.

- [ ] **Step 1: Write the failing canonical-origin tests**

```ts
import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it("prefers the explicit public site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com",
        VERCEL_PROJECT_PRODUCTION_URL: "ignored.vercel.app",
      }),
    ).toEqual(new URL("https://portfolio.example.com"));
  });

  it("uses the Vercel production hostname when explicit URL is absent", () => {
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "dokyum-portfolio.vercel.app" }),
    ).toEqual(new URL("https://dokyum-portfolio.vercel.app"));
  });

  it("falls back to local development", () => {
    expect(resolveSiteUrl({})).toEqual(new URL("http://localhost:3000"));
  });
});
```

Replace the existing hard-coded production-origin E2E assertion with:

```ts
test("social metadata uses the configured local origin", async ({ page }) => {
  await page.goto("/work/touchpoint");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:4173/work/touchpoint",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^http:\/\/127\.0\.0\.1:4173\//,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /^http:\/\/127\.0\.0\.1:4173\//,
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm vitest run src/lib/site-url.test.ts
pnpm playwright test -g "configured local origin"
```

Expected: the unit test fails because `src/lib/site-url.ts` does not exist, and the E2E test fails because canonical and social metadata still point to the retired Sites hostname.

- [ ] **Step 3: Implement origin resolution**

```ts
export function resolveSiteUrl(env: NodeJS.ProcessEnv = process.env): URL {
  if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL);

  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return new URL("http://localhost:3000");
}
```

Replace the hard-coded Sites origin in `src/app/layout.tsx` with `resolveSiteUrl()`.

- [ ] **Step 4: Replace Sites/Vinext dependencies and scripts**

Run:

```bash
pnpm remove vinext react-server-dom-webpack @cloudflare/vite-plugin @cloudflare/workers-types @openai/sites-vite-plugin @vitejs/plugin-rsc wrangler
pnpm add next@16.3.3 @fontsource-variable/geist-mono @upstash/redis
```

Set scripts exactly:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "oxlint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "verify": "pnpm lint && pnpm test && pnpm build && pnpm test:e2e"
}
```

Set Playwright's web server to:

```ts
webServer: {
  command: "pnpm dev --hostname 127.0.0.1 --port 4173",
  url: "http://127.0.0.1:4173",
  env: { NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:4173" },
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
```

Remove `vite.config.ts`. Keep the Vitest Vite config and its React plugin. In `pnpm-workspace.yaml`, remove only the obsolete `workerd` build approval and preserve the approvals still needed by the native toolchain.

- [ ] **Step 5: Verify GREEN and native build**

Run:

```bash
pnpm vitest run src/lib/site-url.test.ts
pnpm build
pnpm playwright test -g "configured local origin"
```

Expected: 3 unit tests and the focused E2E test pass, and Next.js writes `.next/` successfully.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml pnpm-workspace.yaml playwright.config.ts src/app/layout.tsx src/lib/site-url.ts src/lib/site-url.test.ts e2e/portfolio.spec.ts vite.config.ts
git commit -m "build: migrate portfolio to native Next.js"
```

## Task 2: Resume-Backed Career Content

**Files:**

- Create: `src/content/career.ts`
- Create: `src/content/career.test.ts`
- Modify: `src/content/projects.ts`
- Modify: `src/content/projects.test.ts`

**Interfaces:**

- Produces: `CareerEntry`, `EducationEntry`, `careerEntries`, `educationEntries`.
- Consumes: `ProjectSlug` from `src/content/projects.ts`.
- Consumed by: Career timeline and GNB project metadata.

- [ ] **Step 1: Write failing chronology tests**

```ts
import { describe, expect, it } from "vitest";

import { projects } from "./projects";
import { careerEntries, educationEntries } from "./career";

describe("career content", () => {
  it("keeps the complete reverse chronology from 2016 to now", () => {
    expect(careerEntries.map(({ company }) => company)).toEqual([
      "Touchpoint",
      "서우노드",
      "커피팅주식회사",
      "프라우들리",
      "룩코",
      "올스케이프",
      "피그위",
    ]);
    expect(careerEntries[0].period).toBe("2026–NOW");
    expect(careerEntries.at(-1)?.period).toBe("2016.10–2018.11");
  });

  it("links only to canonical project slugs", () => {
    const slugs = new Set(projects.map(({ slug }) => slug));
    expect(
      careerEntries.flatMap(({ projectSlugs }) => projectSlugs).every((slug) =>
        slugs.has(slug),
      ),
    ).toBe(true);
  });

  it("keeps the three education entries", () => {
    expect(educationEntries).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `pnpm vitest run src/content/career.test.ts`

Expected: FAIL because `career.ts` does not exist.

- [ ] **Step 3: Implement the typed chronology**

```ts
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
```

Add periods supplied by the resume to missing project records:

- Touchpoint: `2026–NOW`
- Butlerlee: `2022.03–2022.09`
- Snode: `2025.05–2026.02`
- Moum: `2022.10–2023.01`

Do not change Coffeeting or Matching Admin periods without a new source because the project and employment windows may legitimately differ.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/content/career.test.ts src/content/projects.test.ts`

Expected: all career and project tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/content/career.ts src/content/career.test.ts src/content/projects.ts src/content/projects.test.ts
git commit -m "feat: add resume-backed career chronology"
```

## Task 3: Accessible Global Navigation

**Files:**

- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-header.test.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `e2e/portfolio.spec.ts`

**Interfaces:**

- Consumes: `projects` and current pathname.
- Produces: one desktop Work dropdown and one mobile full-screen menu with the same canonical links.

- [ ] **Step 1: Replace the header tests with failing navigation behavior**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { projects } from "@/content/projects";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/career" }));

describe("SiteHeader", () => {
  beforeEach(() => render(<SiteHeader />));

  it("exposes every project from Work in one interaction", () => {
    fireEvent.click(screen.getByRole("button", { name: "프로젝트 메뉴" }));
    for (const project of projects) {
      expect(screen.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
        "href",
        project.route,
      );
    }
  });

  it("keeps Career, PDF, and email globally available", () => {
    expect(screen.getByRole("link", { name: "커리어" })).toHaveAttribute("href", "/career");
    expect(screen.getByRole("link", { name: "포트폴리오 PDF" })).toHaveAttribute(
      "href",
      "/dokyum-kim-portfolio.pdf",
    );
    expect(screen.getByRole("link", { name: "이메일로 연락하기" })).toHaveAttribute(
      "href",
      "mailto:snfltptkd91@gmail.com",
    );
  });

  it("marks the current section and closes with Escape", () => {
    expect(screen.getByRole("link", { name: "커리어" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const trigger = screen.getByRole("button", { name: "프로젝트 메뉴" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("locks background scroll while the mobile menu is open", () => {
    const trigger = screen.getByRole("button", { name: "메뉴 열기" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");
    for (const project of projects) {
      expect(screen.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
        "href",
        project.route,
      );
    }
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });
});
```

Add a direct GNB navigation test to `e2e/portfolio.spec.ts`:

```ts
test("desktop Work navigation reaches every project in one activation", async ({ page }) => {
  const workLinks = [
    ["Touchpoint", "/work/touchpoint"],
    ["Butlerlee", "/work/butlerlee"],
    ["Snode", "/work/snode"],
    ["Coffeeting", "/work/coffeeting"],
    ["Matching Admin", "/work/matching-admin"],
    ["Moum", "/work/moum"],
  ] as const;

  for (const [name, route] of workLinks) {
    await page.goto("/");
    await page.getByRole("button", { name: "프로젝트 메뉴" }).click();
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
pnpm vitest run src/components/site-header.test.tsx
pnpm playwright test -g "desktop Work navigation"
```

Expected: both commands FAIL because Work and Career navigation do not exist.

- [ ] **Step 3: Implement one shared menu model**

Implement `SiteHeader` as a client component with:

```ts
const globalLinks = {
  career: { href: "/career", label: "커리어" },
  pdf: { href: "/dokyum-kim-portfolio.pdf", label: "포트폴리오 PDF" },
  email: { href: "mailto:snfltptkd91@gmail.com", label: "이메일로 연락하기" },
} as const;
```

State and behavior:

```ts
const [workOpen, setWorkOpen] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);
const workTriggerRef = useRef<HTMLButtonElement>(null);
const mobileTriggerRef = useRef<HTMLButtonElement>(null);
const pathname = usePathname();

useEffect(() => {
  const close = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (mobileOpen) {
      setMobileOpen(false);
      mobileTriggerRef.current?.focus();
    } else if (workOpen) {
      setWorkOpen(false);
      workTriggerRef.current?.focus();
    }
  };
  document.addEventListener("keydown", close);
  return () => document.removeEventListener("keydown", close);
}, [mobileOpen, workOpen]);

useEffect(() => {
  document.body.style.overflow = mobileOpen ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [mobileOpen]);
```

The Work trigger uses `aria-expanded`, `aria-controls="work-menu"`, and `aria-label="프로젝트 메뉴"`. The mobile trigger uses `aria-expanded`, `aria-controls="mobile-menu"`, and the closed label `메뉴 열기`. Keep both link collections server-rendered and toggle them with the HTML `hidden` attribute so the links remain present without client JavaScript. Render project links directly from `projects`, close both menus on pathname changes, and use `aria-current="page"` when `pathname` equals a project route or `/career`.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
pnpm vitest run src/components/site-header.test.tsx
pnpm playwright test -g "desktop Work navigation"
```

Expected: all header tests and the six-route navigation loop pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/site-header.tsx src/components/site-header.test.tsx src/app/layout.tsx e2e/portfolio.spec.ts
git commit -m "feat: add complete portfolio navigation"
```

## Task 4: Editorial Project Runway

**Files:**

- Create: `src/components/landing/project-runway.tsx`
- Create: `src/components/landing/project-runway.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `e2e/portfolio.spec.ts`
- Delete: `src/components/landing/project-carousel.tsx`
- Delete: `src/components/landing/project-carousel.test.tsx`

**Interfaces:**

- Consumes: `readonly Project[]`.
- Produces: six first-click project links and a mobile scroll-snap runway.

- [ ] **Step 1: Write failing runway tests**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";
import { ProjectRunway } from "./project-runway";

describe("ProjectRunway", () => {
  it("renders the Korean thesis and every direct project link", () => {
    render(<ProjectRunway projects={projects} />);
    expect(
      screen.getByRole("heading", {
        name: "제품 밖의 병목까지 찾아, 사업이 흐르는 구조로 바꿉니다.",
      }),
    ).toBeInTheDocument();
    for (const project of projects) {
      expect(screen.getByRole("link", { name: `${project.name} 프로젝트 보기` })).toHaveAttribute(
        "href",
        project.route,
      );
    }
  });

  it("keeps visible card bands free of descriptive text", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    expect(container.querySelectorAll(".project-card-logo")).toHaveLength(6);
    expect(container.querySelectorAll(".project-card-copy")).toHaveLength(0);
  });

  it("updates the separate runway index when a project receives focus", () => {
    render(<ProjectRunway projects={projects} />);
    fireEvent.focus(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" }));
    expect(screen.getByText("02 / 06")).toBeInTheDocument();
    expect(screen.getByText("Butlerlee")).toBeInTheDocument();
    expect(screen.getByText(projects[1].activeLine)).toBeInTheDocument();
  });
});
```

Add the first-activation landing navigation contract:

```ts
test("every landing card opens its project on the first activation", async ({ page }) => {
  const workLinks = [
    ["Touchpoint", "/work/touchpoint"],
    ["Butlerlee", "/work/butlerlee"],
    ["Snode", "/work/snode"],
    ["Coffeeting", "/work/coffeeting"],
    ["Matching Admin", "/work/matching-admin"],
    ["Moum", "/work/moum"],
  ] as const;

  for (const [name, route] of workLinks) {
    await page.goto("/");
    await page.getByRole("link", { name: `${name} 프로젝트 보기` }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
pnpm vitest run src/components/landing/project-runway.test.tsx
pnpm playwright test -g "every landing card"
```

Expected: the component test fails because `ProjectRunway` does not exist, and the E2E test fails when the old carousel intercepts a non-active card's first click.

- [ ] **Step 3: Implement direct-link cards**

`ProjectRunway` is a client component. It initializes `activeIndex` to zero, sets it from card pointer/focus events, and uses this native-scroll synchronizer:

```ts
const runwayRef = useRef<HTMLDivElement>(null);
const [activeIndex, setActiveIndex] = useState(0);

function syncActiveIndex() {
  const runway = runwayRef.current;
  if (!runway) return;
  const center = runway.scrollLeft + runway.clientWidth / 2;
  const cards = Array.from(runway.querySelectorAll<HTMLElement>(".project-card"));
  const closest = cards.reduce((best, card, index) => {
    const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Number.POSITIVE_INFINITY });
  setActiveIndex(closest.index);
}
```

It renders:

```tsx
<section className="landing-hero" aria-labelledby="landing-title">
  <p className="landing-masthead" aria-hidden="true">DOKYUM KIM</p>
  <div className="landing-thesis">
    <p>BUILDING BEYOND THE PRODUCT</p>
    <h1 id="landing-title">제품 밖의 병목까지 찾아, 사업이 흐르는 구조로 바꿉니다.</h1>
  </div>
  <div className="project-runway" aria-label="프로젝트 카드 목록">
    {projects.map((project, index) => (
      <a
        className="project-card"
        href={project.route}
        key={project.slug}
        aria-label={`${project.name} 프로젝트 보기`}
        onFocus={() => setActiveIndex(index)}
        onPointerEnter={() => setActiveIndex(index)}
        style={{ "--project-index": index } as CSSProperties}
      >
        <span className="sr-only">{project.name}: {project.activeLine}</span>
        <span className="project-card-image">
          <Image
            src={`/${project.media.card}`}
            alt={project.media.alt}
            fill
            preload={index === 0}
            sizes="(max-width: 767px) 78vw, (max-width: 1199px) 40vw, 24vw"
          />
        </span>
        <span className="project-card-logo" aria-hidden="true">
          <span className="project-card-logo-image">
            <Image src={`/${project.media.logo}`} alt="" fill sizes="180px" />
          </span>
        </span>
      </a>
    ))}
  </div>
  <div className="project-runway-meta" aria-live="polite">
    <p className="project-runway-count">
      {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
    </p>
    <p className="project-runway-name">{projects[activeIndex].name}</p>
    <p className="project-runway-outcome">{projects[activeIndex].activeLine}</p>
  </div>
</section>
```

Attach `ref={runwayRef}` and `onScroll={syncActiveIndex}` to `.project-runway`. Do not implement `onWheel`, pointer thresholds, card selection interception, or click prevention.

- [ ] **Step 4: Update the page and verify GREEN**

Replace `ProjectCarousel` with `ProjectRunway` in `src/app/page.tsx`.

Run:

```bash
pnpm vitest run src/components/landing/project-runway.test.tsx
pnpm playwright test -g "every landing card"
```

Expected: 3 component tests and the six-route landing navigation loop pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx e2e/portfolio.spec.ts src/components/landing/project-runway.tsx src/components/landing/project-runway.test.tsx src/components/landing/project-carousel.tsx src/components/landing/project-carousel.test.tsx
git commit -m "feat: replace carousel with editorial project runway"
```

## Task 5: Editorial Project Detail Structure

**Files:**

- Create: `src/components/work/project-detail.test.tsx`
- Modify: `src/components/work/project-detail.tsx`
- Modify: `src/components/work/project-navigation.tsx`

**Interfaces:**

- Consumes: `Project`.
- Produces: outcome-led hero, optional metrics, four evidence chapters, and neighbors.

- [ ] **Step 1: Write failing detail structure tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProjectBySlug } from "@/content/projects";
import { ProjectDetail } from "./project-detail";

describe("ProjectDetail", () => {
  it("puts the verified outcome before the supporting story", () => {
    const project = getProjectBySlug("butlerlee")!;
    const { container } = render(<ProjectDetail project={project} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(project.heroOutcome);
    expect(container.querySelector(".work-metrics")).toHaveTextContent("월 약 800만원");
    expect(screen.getByRole("heading", { name: "핵심 판단" })).toBeInTheDocument();
  });

  it("does not invent metrics for Touchpoint", () => {
    const project = getProjectBySlug("touchpoint")!;
    const { container } = render(<ProjectDetail project={project} />);
    expect(container.querySelector(".work-metrics")).toBeNull();
    expect(screen.getByText(/성장성은 아직 검증 전/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `pnpm vitest run src/components/work/project-detail.test.tsx`

Expected: FAIL because the new heading and metric emphasis contract is not met.

- [ ] **Step 3: Implement the editorial hierarchy**

Use exactly four evidence chapters after the hero:

```ts
const chapters = [
  { key: "problem", label: "문제와 맥락" },
  { key: "judgment", label: "핵심 판단" },
  { key: "execution", label: "실행과 운영 변화" },
  { key: "outcome", label: "성과와 학습" },
] as const;
```

Render `overview` in the hero summary area instead of as a fifth repeated chapter. Use semantic `article`, `section`, `h2`, `dl`, and `figure`. Keep `ProjectNavigation` behavior unchanged while replacing its visual labels with mono metadata.

- [ ] **Step 4: Verify GREEN and neighbor regression**

Run:

```bash
pnpm vitest run src/components/work/project-detail.test.tsx src/components/work/project-navigation.test.tsx
```

Expected: detail and neighbor tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/project-detail.tsx src/components/work/project-detail.test.tsx src/components/work/project-navigation.tsx
git commit -m "feat: reshape project stories as editorial case studies"
```

## Task 6: Career Timeline Page

**Files:**

- Create: `src/components/career/career-timeline.tsx`
- Create: `src/components/career/career-timeline.test.tsx`
- Create: `src/app/career/page.tsx`
- Modify: `e2e/portfolio.spec.ts`

**Interfaces:**

- Consumes: `careerEntries`, `educationEntries`, and `projects`.
- Produces: `/career` with reverse chronology and canonical work links.

- [ ] **Step 1: Write the failing timeline test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { careerEntries, educationEntries } from "@/content/career";
import { CareerTimeline } from "./career-timeline";

describe("CareerTimeline", () => {
  it("renders every career and education entry", () => {
    render(<CareerTimeline careers={careerEntries} education={educationEntries} />);
    for (const entry of careerEntries) {
      expect(screen.getByRole("heading", { name: entry.company })).toBeInTheDocument();
      expect(screen.getByText(entry.period)).toBeInTheDocument();
    }
    for (const entry of educationEntries) {
      expect(screen.getByText(entry.institution)).toBeInTheDocument();
    }
  });

  it("links career evidence to canonical project pages", () => {
    render(<CareerTimeline careers={careerEntries} education={educationEntries} />);
    expect(screen.getByRole("link", { name: "Snode 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/snode",
    );
    expect(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/butlerlee",
    );
  });
});
```

Add the route-level chronology check:

```ts
test("Career renders the complete work chronology", async ({ page }) => {
  await page.goto("/career");
  for (const company of [
    "Touchpoint",
    "서우노드",
    "커피팅주식회사",
    "프라우들리",
    "룩코",
    "올스케이프",
    "피그위",
  ]) {
    await expect(page.getByRole("heading", { name: company })).toBeVisible();
  }
  await expect(page.getByText("서울시립대학교")).toBeVisible();
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
pnpm vitest run src/components/career/career-timeline.test.tsx
pnpm playwright test -g "complete work chronology"
```

Expected: both commands FAIL because the timeline component and route do not exist.

- [ ] **Step 3: Implement the timeline and route**

Render each career entry as:

```tsx
<article className="career-entry">
  <p className="career-period">{entry.period}</p>
  <div className="career-entry-main">
    <h2>{entry.company}</h2>
    <p className="career-role">{entry.role}</p>
    <p className="career-summary">{entry.summary}</p>
    <ul className="career-highlights">
      {entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
    </ul>
    <div className="career-projects">
      {entry.projectSlugs.map((slug) => {
        const project = getProjectBySlug(slug)!;
        return <a href={project.route} key={slug} aria-label={`${project.name} 프로젝트 보기`}>{project.name} ↗</a>;
      })}
    </div>
  </div>
</article>
```

`src/app/career/page.tsx` exports Korean metadata and renders the `2016 — NOW` hero, timeline, education section, and email CTA. Do not render the phone number or source resume URL.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
pnpm vitest run src/components/career/career-timeline.test.tsx
pnpm playwright test -g "complete work chronology"
```

Expected: 2 component tests and the focused E2E test pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/career/page.tsx src/components/career/career-timeline.tsx src/components/career/career-timeline.test.tsx e2e/portfolio.spec.ts
git commit -m "feat: add complete career timeline"
```

## Task 7: Privacy-Conscious Persisted Visitor Counter

**Files:**

- Create: `src/visitors/register-visit.ts`
- Create: `src/visitors/register-visit.test.ts`
- Create: `src/visitors/redis-store.ts`
- Create: `src/app/api/visitors/route.ts`
- Create: `src/app/api/visitors/route.test.ts`
- Create: `src/components/visitor-count.tsx`
- Create: `src/components/visitor-count.test.tsx`
- Create: `src/components/site-footer.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `e2e/portfolio.spec.ts`

**Interfaces:**

- Produces: `VisitorStore`, `registerVisit`, `POST /api/visitors`, `VisitorCount`.
- Consumed by: footer and production Route Handler.

- [ ] **Step 1: Write failing pure use-case tests**

```ts
import { describe, expect, it, vi } from "vitest";

import { registerVisit, type VisitorStore } from "./register-visit";

describe("registerVisit", () => {
  it("increments a browser that has not been counted", async () => {
    const store: VisitorStore = {
      get: vi.fn(),
      increment: vi.fn().mockResolvedValue(42),
    };
    await expect(registerVisit(store, false)).resolves.toEqual({ count: 42, setCookie: true });
    expect(store.increment).toHaveBeenCalledOnce();
  });

  it("reads without incrementing a counted browser", async () => {
    const store: VisitorStore = {
      get: vi.fn().mockResolvedValue(42),
      increment: vi.fn(),
    };
    await expect(registerVisit(store, true)).resolves.toEqual({ count: 42, setCookie: false });
    expect(store.increment).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `pnpm vitest run src/visitors/register-visit.test.ts`

Expected: FAIL because `register-visit.ts` does not exist.

- [ ] **Step 3: Implement the store-neutral use case**

```ts
export type VisitorStore = {
  get(): Promise<number>;
  increment(): Promise<number>;
};

export async function registerVisit(
  store: VisitorStore,
  alreadyCounted: boolean,
): Promise<{ count: number; setCookie: boolean }> {
  if (alreadyCounted) {
    return { count: await store.get(), setCookie: false };
  }
  return { count: await store.increment(), setCookie: true };
}
```

- [ ] **Step 4: Implement the Upstash adapter**

```ts
import { Redis } from "@upstash/redis";
import type { VisitorStore } from "./register-visit";

const VISITOR_KEY = "portfolio:visitor-count:v1";

export function createRedisVisitorStore(): VisitorStore {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Visitor Redis is not configured");
  const redis = new Redis({ url, token });
  return {
    async get() {
      return (await redis.get<number>(VISITOR_KEY)) ?? 0;
    },
    increment() {
      return redis.incr(VISITOR_KEY);
    },
  };
}
```

- [ ] **Step 5: Write failing Route Handler tests**

```ts
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  store: { get: vi.fn(), increment: vi.fn() },
}));

vi.mock("@/visitors/redis-store", () => ({
  createRedisVisitorStore: () => mocks.store,
}));

import { POST } from "./route";

describe("POST /api/visitors", () => {
  beforeEach(() => vi.clearAllMocks());

  it("increments once and sets the 400-day cookie", async () => {
    mocks.store.increment.mockResolvedValueOnce(42);
    const response = await POST(new NextRequest("http://localhost/api/visitors", {
      method: "POST",
    }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ count: 42 });
    expect(response.headers.get("set-cookie")).toContain("dk_portfolio_visited_v1=1");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=34560000");
  });

  it("reads without incrementing when the cookie exists", async () => {
    mocks.store.get.mockResolvedValueOnce(42);
    const response = await POST(new NextRequest("http://localhost/api/visitors", {
      method: "POST",
      headers: { cookie: "dk_portfolio_visited_v1=1" },
    }));
    await expect(response.json()).resolves.toEqual({ count: 42 });
    expect(mocks.store.increment).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("returns the nullable 503 contract when Redis is unavailable", async () => {
    mocks.store.increment.mockRejectedValueOnce(new Error("unavailable"));
    const response = await POST(new NextRequest("http://localhost/api/visitors", {
      method: "POST",
    }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ count: null });
  });
});
```

- [ ] **Step 6: Run and verify Route Handler RED**

Run: `pnpm vitest run src/app/api/visitors/route.test.ts`

Expected: FAIL because the Route Handler does not exist.

- [ ] **Step 7: Implement the Route Handler**

```ts
import { NextRequest, NextResponse } from "next/server";
import { registerVisit } from "@/visitors/register-visit";
import { createRedisVisitorStore } from "@/visitors/redis-store";

const COOKIE = "dk_portfolio_visited_v1";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const result = await registerVisit(
      createRedisVisitorStore(),
      request.cookies.has(COOKIE),
    );
    const response = NextResponse.json({ count: result.count });
    if (result.setCookie) {
      response.cookies.set(COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 34_560_000,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ count: null }, { status: 503 });
  }
}
```

- [ ] **Step 8: Write failing visitor UI tests**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VisitorCount } from "./visitor-count";

describe("VisitorCount", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("formats a successful count with six digits", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 42 }) }));
    render(<VisitorCount />);
    await waitFor(() => expect(screen.getByText("000042")).toBeInTheDocument());
  });

  it("shows the documented unavailable state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<VisitorCount />);
    await waitFor(() => expect(screen.getByText("—")).toBeInTheDocument());
  });
});
```

Add the deterministic non-blocking failure-state E2E check:

```ts
test("visitor footer stays usable when Redis is unavailable", async ({ page }) => {
  await page.route("**/api/visitors", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: '{"count":null}' }),
  );
  await page.goto("/");
  await expect(page.locator(".site-visitor")).toContainText("VISITORS —");
});
```

- [ ] **Step 9: Run and verify UI RED**

Run:

```bash
pnpm vitest run src/components/visitor-count.test.tsx
pnpm playwright test -g "visitor footer"
```

Expected: both commands FAIL because `VisitorCount` and the footer do not exist.

- [ ] **Step 10: Implement the non-blocking client and footer**

`VisitorCount` starts with `null`, POSTs once in `useEffect`, validates `Number.isInteger(count) && count >= 0`, and renders `String(count).padStart(6, "0")`; any failed or invalid response renders `—` without retry.

`SiteFooter` renders:

```tsx
<footer className="site-footer">
  <p>© {new Date().getFullYear()} DOKYUM KIM</p>
  <p className="site-visitor"><span>VISITORS</span> <VisitorCount /></p>
  <a href="mailto:snfltptkd91@gmail.com">EMAIL ↗</a>
</footer>
```

Mount the footer after `{children}` in the root layout.

- [ ] **Step 11: Verify GREEN**

Run:

```bash
pnpm vitest run src/visitors/register-visit.test.ts src/app/api/visitors/route.test.ts src/components/visitor-count.test.tsx
pnpm playwright test -g "visitor footer"
```

Expected: 7 visitor tests and the focused E2E test pass.

- [ ] **Step 12: Commit**

```bash
git add src/visitors src/app/api/visitors/route.ts src/app/api/visitors/route.test.ts src/components/visitor-count.tsx src/components/visitor-count.test.tsx src/components/site-footer.tsx src/app/layout.tsx e2e/portfolio.spec.ts
git commit -m "feat: add persisted anonymous visitor counter"
```

## Task 8: Northzone-Informed Editorial Styling

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `e2e/portfolio.spec.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: semantic class names from Tasks 3–7.
- Produces: desktop, tablet, and mobile layouts with no horizontal page overflow.

- [ ] **Step 1: Add failing responsive E2E checks**

```ts
test("mobile layout keeps navigation and content inside the viewport", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await expect(page.getByRole("button", { name: "메뉴 열기" })).toBeVisible();
    await page.getByRole("button", { name: "메뉴 열기" }).click();
    await expect(page.getByRole("link", { name: /Touchpoint/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "커리어" })).toBeVisible();
    await expect(page.getByRole("link", { name: "이메일로 연락하기" })).toBeVisible();
    await page.getByRole("link", { name: "커리어" }).click();
    await expect(page).toHaveURL(/\/career$/);
  }
});

test("landing uses the approved editorial type roles", async ({ page }) => {
  await page.goto("/");
  const mastheadFont = await page.locator(".landing-masthead").evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  const labelFont = await page.locator(".landing-thesis > p").evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  expect(mastheadFont).toContain("Instrument Serif");
  expect(labelFont).toContain("Geist Mono");
});

test("landing entrance is staged and reduced-motion safe", async ({ page }) => {
  await page.goto("/");
  const delays = await Promise.all(
    [".landing-masthead", ".landing-thesis", ".project-runway"].map((selector) =>
      page.locator(selector).evaluate((element) => getComputedStyle(element).animationDelay),
    ),
  );
  expect(delays).toEqual(["0s", "0.16s", "0.36s"]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  for (const selector of [".landing-masthead", ".landing-thesis", ".project-runway"]) {
    await expect(page.locator(selector)).toHaveCSS("animation-duration", "0s");
  }
});
```

- [ ] **Step 2: Run the focused E2E checks and verify RED**

Run: `pnpm build && pnpm playwright test -g "mobile layout|approved editorial type|staged"`

Expected: FAIL because the new menu and typography classes are not styled.

- [ ] **Step 3: Replace the visual tokens and base styles**

Start `:root` exactly with:

```css
:root {
  --paper: #f3f3ef;
  --paper-raised: #fbfbf8;
  --ink: #0a0b0d;
  --muted: #686b67;
  --grid: #d8dad6;
  --signal-blue: #173d73;
  --focus: #1f5eff;
  --font-display: "Instrument Serif", serif;
  --font-korean: "Pretendard Variable", sans-serif;
  --font-mono: "Geist Mono Variable", monospace;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Base page rules:

```css
html { background: var(--paper); color: var(--ink); }
body {
  margin: 0;
  min-width: 320px;
  background-color: var(--paper);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 40px 40px;
  font-family: var(--font-korean);
}
a:focus-visible, button:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 4px;
}
```

Implement these layout contracts:

- `.site-header`: paper background, 1px grid rule, no blur, no rounded pill.
- `.landing-masthead`: Instrument Serif, `clamp(5rem, 14vw, 14rem)`, one line on desktop.
- `.landing-thesis h1`: Korean, `clamp(2.6rem, 6vw, 7rem)`, `word-break: keep-all`.
- `.project-runway`: horizontal grid, natural `overflow-x: auto`, `scroll-snap-type: x mandatory` under 768px.
- `.project-card`: 4:5 ratio, 2px maximum radius, shallow desktop overlap through negative inline margins only.
- `.project-card-logo-image`: project-specific CSS custom widths so Touchpoint no longer reads as a purple block.
- `.work-page`, `.career-page`: paper background with quiet grid; no dark full-page sections.
- `.work-story-section`: asymmetric 12-column placement with sticky label only above 1024px.
- `.career-entry`: period in mono, content aligned to a continuous left rail.
- `.site-footer`: mono metadata row with the visitor total.

Use one entrance keyframe only. Apply it to the masthead at `0s`, thesis at `0.16s`, and runway at `0.36s`, each with a single `0.72s` run using `var(--ease-out)` and `both` fill mode. Do not add looping, cursor-following, or ambient animation.

At `max-width: 767px`, enforce:

```css
.site-desktop-nav { display: none; }
.site-mobile-trigger { display: inline-flex; min-width: 44px; min-height: 44px; }
.landing-masthead { white-space: nowrap; font-size: clamp(4rem, 22vw, 6.4rem); }
.project-runway { grid-auto-columns: min(78vw, 21rem); gap: 0.75rem; padding-inline: 1rem; }
.project-card { margin: 0; scroll-snap-align: center; }
.work-hero, .work-story-section { grid-template-columns: 1fr; }
.career-entry { grid-template-columns: 1fr; }
```

Add `@media (prefers-reduced-motion: reduce)` that sets these entrance animations to `none`, disables smooth scrolling, and removes entry transforms and transitions.

- [ ] **Step 4: Import Geist Mono and remove obsolete font roles**

In `src/app/layout.tsx` import:

```ts
import "@fontsource-variable/geist-mono/wght.css";
```

Keep Instrument Serif and Pretendard. Remove Inter and Roboto Condensed imports once no CSS variable references them.

Remove their unused packages:

```bash
pnpm remove @fontsource-variable/inter @fontsource-variable/roboto-condensed
```

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm build
pnpm playwright test -g "mobile layout|approved editorial type|staged"
```

Expected: build succeeds and all three targeted E2E tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx e2e/portfolio.spec.ts package.json pnpm-lock.yaml
git commit -m "feat: apply the editorial portfolio design system"
```

## Task 9: Public Documentation and Secret Hygiene

**Files:**

- Create: `.env.example`
- Create: `README.md`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: the runtime and metadata behavior from Task 1.
- Produces: public setup documentation and a source tree safe to publish after the platform-binding switch.

- [ ] **Step 1: Run the public-documentation acceptance checks and verify RED**

```bash
test -f README.md
test -f .env.example
```

Expected: FAIL because the public README and environment example do not exist.

- [ ] **Step 2: Reconfirm the already-tested metadata contract**

Run:

```bash
pnpm vitest run src/lib/site-url.test.ts
pnpm playwright test -g "configured local origin"
```

Expected: the canonical-origin unit and E2E tests remain green before publication files are added.

- [ ] **Step 3: Add environment and README documentation**

`.env.example`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

`.gitignore` additions:

```gitignore
.vercel/
.env*
!.env.example
```

README sections, in order:

1. `# dokyum kim — Product Portfolio`
2. Live site `https://dokyum-portfolio.vercel.app` and primary purpose; if Vercel assigns a different production alias, Task 11 updates this line before final verification.
3. Stack.
4. Local setup commands.
5. Environment variables.
6. Routes.
7. Verification command.
8. Privacy note stating that the resume and phone number are not in the repository.

- [ ] **Step 4: Scan the future public source for secrets**

Run:

```bash
! rg -n "dock-y\.chatgpt\.site|010[.-]2398[.-]8398|UPSTASH_REDIS_REST_TOKEN=.+" src public README.md .env.example package.json next.config.ts playwright.config.ts
if pdftotext public/dokyum-kim-portfolio.pdf - | rg -n "010[.-]2398[.-]8398"; then exit 1; fi
```

Expected: no retired hostname, phone number, or populated Redis token in publishable runtime files, and no phone number in the downloadable portfolio PDF. The Sites project ID remains temporarily in `.openai/hosting.json` until Vercel is linked in Task 11 and is not pushed to GitHub.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
test -f README.md
test -f .env.example
pnpm build
```

Expected: both documentation files exist and the native Next build passes.

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore README.md
git commit -m "docs: prepare the portfolio for public Vercel hosting"
```

## Task 10: Full Verification and Spec Coverage Audit

**Files:**

- No source changes are planned. If an existing release test exposes a real behavior gap, first append a correction task to this plan that names the exact test and source files before editing them.

**Interfaces:**

- Consumes: all public routes and UI contracts.
- Produces: one repeatable local release gate and evidence that each approved behavior already has a test.

- [ ] **Step 1: Audit coverage before running the release gate**

Confirm the suite already covers these routes and behaviors:

```ts
const routes = [
  "/",
  "/career",
  "/work/touchpoint",
  "/work/butlerlee",
  "/work/snode",
  "/work/coffeeting",
  "/work/matching-admin",
  "/work/moum",
] as const;
```

- Project routes, PDF, mailto, redirect, and logos: `e2e/portfolio.spec.ts`.
- Direct Work links and Escape behavior: `src/components/site-header.test.tsx`.
- Mobile menu background lock and focus restoration: `src/components/site-header.test.tsx`.
- Runway focused/hovered index behavior: `src/components/landing/project-runway.test.tsx`.
- Full career coverage and valid links: career content and timeline tests.
- 320px and 390px overflow plus menu visibility: editorial styling E2E test.
- Visitor increment/read/cookie/503 contracts: visitor use-case and Route Handler tests.
- Visitor success and unavailable display: visitor component and E2E tests.

- [ ] **Step 2: Run every automated check**

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected: every command exits 0. If a command fails, do not continue to deployment.

- [ ] **Step 3: Handle any discovered gap with a fresh RED test**

For any uncovered or failing behavior, add the smallest regression test first, run it to observe the expected failure, implement only the missing behavior, and rerun the focused and full suites. Do not add new routes, animation systems, analytics products, or content beyond the approved spec.

- [ ] **Step 4: Run the full local release gate**

Run:

```bash
pnpm verify
git diff --check
```

Expected:

- oxlint exits 0;
- all Vitest files pass;
- native Next production build exits 0;
- all Playwright tests pass;
- no whitespace errors.

- [ ] **Step 5: Record the verified release commit**

If no correction was required, leave the tree clean and record the verified HEAD instead of creating an empty commit. If Step 3 exposed a gap, do not use a generic audit commit: append and execute a correction task with exact file paths, RED/GREEN commands, and its own scoped commit before repeating Steps 2 and 4.

## Task 11: GitHub Publication, Redis Provisioning, and Vercel Production

**Files:**

- Generated locally but ignored: `.vercel/`
- Delete after Vercel link: `.openai/hosting.json`
- Modify only if the assigned alias differs from the planned URL: `README.md`

**Interfaces:**

- Consumes: verified feature branch HEAD.
- Produces: public GitHub `main`, linked Vercel project, Redis-backed production visitor count, and final URL.

- [ ] **Step 1: Confirm clean verified source**

Run:

```bash
git status --short
git log -1 --oneline
pnpm verify
```

Expected: clean worktree and all checks green on the exact commit to publish.

- [ ] **Step 2: Link the Vercel project before removing the prior platform binding**

```bash
vercel link --yes --project dokyum-portfolio
vercel project inspect dokyum-portfolio
```

Expected: the local checkout is linked to an active Vercel project and `.vercel/` remains ignored.

- [ ] **Step 3: Remove the retired Sites source binding and reverify**

```bash
git rm .openai/hosting.json
git commit -m "chore: retire the Sites source binding"
pnpm verify
```

Expected: the exact post-removal commit is green and contains no `.openai/hosting.json`.

- [ ] **Step 4: Merge the feature branch into local main**

From the main repository root:

```bash
git checkout main
git merge --ff-only feature/portfolio-site
```

Run `pnpm verify` again on merged `main`. Do not remove the worktree until production verification finishes.

- [ ] **Step 5: Create the public GitHub repository and push main**

```bash
gh repo create dockyum/dokyum-portfolio --public --description "Product portfolio of dokyum kim — product, operations, and business systems."
git remote add github https://github.com/dockyum/dokyum-portfolio.git
git push -u github main
```

If the `github` remote already exists, verify its URL instead of replacing it. Confirm with:

```bash
gh repo view dockyum/dokyum-portfolio --json nameWithOwner,url,visibility,defaultBranchRef
```

- [ ] **Step 6: Connect the Vercel project to GitHub**

```bash
vercel git connect https://github.com/dockyum/dokyum-portfolio
```

Confirm project state with `vercel project inspect dokyum-portfolio`.

- [ ] **Step 7: Provision Upstash Redis**

Run:

```bash
vercel integration add upstash/upstash-kv
vercel env pull .env.development.local
vercel env ls
```

Confirm the pulled file contains one complete non-empty credential pair without printing values:

```bash
if rg -q '^UPSTASH_REDIS_REST_URL=.+$' .env.development.local && rg -q '^UPSTASH_REDIS_REST_TOKEN=.+$' .env.development.local; then
  true
elif rg -q '^KV_REST_API_URL=.+$' .env.development.local && rg -q '^KV_REST_API_TOKEN=.+$' .env.development.local; then
  true
else
  exit 1
fi
```

Use `vercel env ls` to confirm the linked variables cover Production, Preview, and Development without exposing their values.

If Vercel opens an Upstash sign-in, pricing, or terms screen, stop only this provisioning step, preserve the linked Vercel project, and report the exact screen the owner must approve. Do not substitute a public counter service or persist credentials in source.

- [ ] **Step 8: Deploy production**

```bash
vercel deploy --prod --yes
```

Capture the exact production URL. If the canonical hostname differs from `VERCEL_PROJECT_PRODUCTION_URL`, set `NEXT_PUBLIC_SITE_URL` through Vercel and deploy the same commit again.

If the assigned alias differs from `https://dokyum-portfolio.vercel.app`, update the README live-site line with that exact captured URL using `apply_patch`, run `pnpm verify`, commit `README.md` as `docs: record the production portfolio URL`, push `main`, then run:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production --value "$PRODUCTION_URL" --yes --force
vercel deploy --prod --yes
```

Capture the promoted URL again before continuing.

- [ ] **Step 9: Verify production behavior**

For the captured `PRODUCTION_URL`, verify:

```bash
test "$(curl -sS -o /dev/null -w '%{http_code}' "$PRODUCTION_URL/")" = "200"
test "$(curl -sS -o /dev/null -w '%{http_code}' "$PRODUCTION_URL/career")" = "200"
for route in touchpoint butlerlee snode coffeeting matching-admin moum; do
  test "$(curl -sS -o /dev/null -w '%{http_code}' "$PRODUCTION_URL/work/$route")" = "200"
done
SNOD_HEADERS="$(mktemp -t dokyum-snod-headers)"
PDF_HEADERS="$(mktemp -t dokyum-pdf-headers)"
curl -sS -I "$PRODUCTION_URL/work/snod" > "$SNOD_HEADERS"
curl -sS -I "$PRODUCTION_URL/dokyum-kim-portfolio.pdf" > "$PDF_HEADERS"
rg '^HTTP/.* (301|308)' "$SNOD_HEADERS"
rg -i '^location: .*/work/snode' "$SNOD_HEADERS"
rg '^HTTP/.* 200' "$PDF_HEADERS"
rg -i '^content-type: application/pdf' "$PDF_HEADERS"
VISITOR_HEADERS="$(mktemp -t dokyum-visitor-headers)"
FIRST_VISIT_JSON="$(curl -sS -D "$VISITOR_HEADERS" -X POST -c /tmp/dokyum-visitor-cookie "$PRODUCTION_URL/api/visitors")"
RETURN_VISIT_JSON="$(curl -sS -X POST -b /tmp/dokyum-visitor-cookie "$PRODUCTION_URL/api/visitors")"
rg -F 'dk_portfolio_visited_v1=1' "$VISITOR_HEADERS"
node -e 'const a=JSON.parse(process.argv[1]).count; const b=JSON.parse(process.argv[2]).count; if(!Number.isInteger(a)||a<0||a!==b) process.exit(1)' "$FIRST_VISIT_JSON" "$RETURN_VISIT_JSON"
PRODUCTION_HTML="$(mktemp -t dokyum-portfolio-html)"
curl -sS "$PRODUCTION_URL/work/touchpoint" > "$PRODUCTION_HTML"
rg -o '<link[^>]+>' "$PRODUCTION_HTML" | rg 'rel="canonical"' | rg -F "href=\"$PRODUCTION_URL/work/touchpoint\""
rg -o '<meta[^>]+>' "$PRODUCTION_HTML" | rg 'property="og:image"' | rg -F "$PRODUCTION_URL/"
rg -o '<meta[^>]+>' "$PRODUCTION_HTML" | rg 'name="twitter:image"' | rg -F "$PRODUCTION_URL/"
```

Expected:

- `/`, `/career`, and all six canonical work routes: 200;
- `/work/snod`: permanent redirect to `/work/snode`;
- PDF: 200 and `application/pdf`;
- first visitor POST: integer count and Set-Cookie;
- second POST with cookie: same integer count;
- canonical, Open Graph, and Twitter metadata contain the Vercel production origin;
- no secrets appear in response bodies or HTML.

If Step 7 was blocked by Marketplace approval, replace only the visitor persistence commands with a request that asserts HTTP 503 and body `{ "count": null }`, verify the footer renders `VISITORS —`, and report the production release as blocked on that exact approval. Do not weaken the persistence acceptance criterion.

Delete the temporary cookie, redirect header, PDF header, visitor header, and HTML files with a recoverable trash operation after verification.

- [ ] **Step 10: Perform browser visual QA**

Inspect production at desktop, 390×844, and 320×700:

- landing hierarchy;
- Work dropdown/mobile menu;
- direct project navigation;
- Career rail;
- Touchpoint and one metrics-heavy case study;
- previous/next navigation;
- visitor footer;
- reduced-motion behavior.

Mark the verified Vercel tab as the deliverable.

- [ ] **Step 11: Set the GitHub homepage and report final state**

```bash
gh repo edit dockyum/dokyum-portfolio --homepage "$PRODUCTION_URL"
```

Report:

- Vercel production URL;
- GitHub repository URL;
- Redis counter verification result;
- test counts and build result;
- any single external approval still required.

Do not delete the old Sites deployment or feature worktree without a separate cleanup decision.
