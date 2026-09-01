# Dokyum Kim Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publicly deploy a Korean-first, Northzone-inspired portfolio for dokyum kim with six interactive project cards and six evidence-based detail pages.

**Architecture:** A Next.js App Router application statically generates the landing page and six project routes from one typed `projects` collection. A small client component owns only carousel interaction state; shared server components render detail content, navigation, metadata, and no-JavaScript fallbacks. All production media is stored locally, and the committed source is pushed, packaged, versioned, and deployed with OpenAI Sites.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS, `next/font`, Vitest, Testing Library, Playwright, OpenAI Sites

**Spec:** `docs/superpowers/specs/2026-09-01-portfolio-website-design.md`

## Global Constraints

- Use the exact canonical name `dokyum kim`; the visual wordmark may render it as `DOKYUM KIM`.
- Keep Korean as the primary content language.
- Use Inter for English utility text, Instrument Serif Italic for the eyebrow, Pretendard ExtraBold for Korean display text, and Roboto Condensed for English condensed display text.
- Do not load or imitate Marr Sans Condensed from an unlicensed font file.
- Keep project order fixed: Touchpoint, Butlerlee, Snode, Coffeeting, Matching Admin, Moum.
- Use `/work/snode` as canonical and permanently redirect `/work/snod` to it.
- Use `mailto:snfltptkd91@gmail.com` for the primary CTA.
- Keep the PDF download separate at `/dokyum-kim-portfolio.pdf`.
- Never hotlink expiring Figma assets; download them into `public/assets/projects/`.
- Do not invent Touchpoint traction, revenue, booking, or growth metrics.
- Provide previous and next links only when the corresponding neighbor exists.
- Support keyboard, touch, reduced motion, and 360px through wide-desktop layouts.
- Finish with passing unit tests, Playwright smoke tests, a successful production build, and a public Sites deployment.

---

## File Map

- `package.json` — scripts and runtime/test dependencies.
- `next.config.ts` — image behavior and permanent `/work/snod` redirect.
- `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs` — build and verification configuration.
- `src/content/projects.ts` — canonical project order, route copy, verified claims, media references, and neighbor lookup.
- `src/content/projects.test.ts` — validates slugs, order, claims, assets, and navigation boundaries.
- `src/app/layout.tsx` — Korean document shell, fonts, metadata defaults, and global header.
- `src/app/page.tsx` — landing composition.
- `src/app/work/[slug]/page.tsx` — static project routes and per-project metadata.
- `src/app/not-found.tsx` — unsupported-route fallback.
- `src/app/globals.css` — tokens, layout, card depth, responsive behavior, focus states, and reduced motion.
- `src/components/site-header.tsx` — identity, PDF, and email actions.
- `src/components/landing/project-carousel.tsx` — selection, drag/swipe, wheel, keyboard, and active copy.
- `src/components/landing/project-carousel.test.tsx` — carousel behavior and accessible semantics.
- `src/components/work/project-detail.tsx` — shared detail-page sections.
- `src/components/work/project-navigation.tsx` — previous/next footer.
- `src/components/work/project-navigation.test.tsx` — first, middle, and last boundaries.
- `public/assets/projects/**` — local card, hero, and logo assets.
- `public/dokyum-kim-portfolio.pdf` — separate source-portfolio download.
- `tests/e2e/portfolio.spec.ts` — production-like navigation smoke test.
- `.openai/hosting.json` — opaque Sites project binding created once by the Sites connector.

---

### Task 1: Bootstrap the Application and Typed Project Model

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/content/projects.test.ts`
- Create: `src/content/projects.ts`
- Create: `.gitignore`

**Interfaces:**
- Produces: `ProjectSlug`, `Project`, `projects`, `getProjectBySlug(slug)`, and `getProjectNeighbors(slug)`.
- Consumers: landing components, detail routes, metadata generation, and navigation tests.

- [ ] **Step 1: Add package and compiler configuration**

Create scripts with these exact responsibilities:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run lint && npm run test && npm run build && npm run test:e2e"
  }
}
```

Use current stable releases of `next`, `react`, and `react-dom`; use TypeScript, ESLint, Vitest, jsdom, Testing Library, and Playwright as development dependencies. Configure Vitest for `jsdom`, the `@/` path alias, and `src/test/setup.ts`.

- [ ] **Step 2: Write the failing project-model tests**

```ts
import { describe, expect, it } from "vitest";
import { getProjectBySlug, getProjectNeighbors, projects } from "./projects";

describe("projects", () => {
  it("keeps the approved canonical order", () => {
    expect(projects.map(({ slug }) => slug)).toEqual([
      "touchpoint",
      "butlerlee",
      "snode",
      "coffeeting",
      "matching-admin",
      "moum",
    ]);
  });

  it("keeps every slug, route, and landing line unique", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(6);
    expect(new Set(projects.map(({ route }) => route)).size).toBe(6);
    expect(projects.every(({ activeLine }) => activeLine.length > 0)).toBe(true);
  });

  it("does not publish unverified Touchpoint traction", () => {
    const touchpoint = getProjectBySlug("touchpoint");
    expect(touchpoint?.verifiedMetrics).toEqual([]);
    expect(touchpoint?.sections.outcome.join(" ")).toContain("검증 전");
  });

  it("returns only existing neighbors", () => {
    expect(getProjectNeighbors("touchpoint").previous).toBeUndefined();
    expect(getProjectNeighbors("touchpoint").next?.slug).toBe("butlerlee");
    expect(getProjectNeighbors("snode")).toMatchObject({
      previous: { slug: "butlerlee" },
      next: { slug: "coffeeting" },
    });
    expect(getProjectNeighbors("moum").next).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run the content test and confirm the red state**

Run: `npm install && npm test -- src/content/projects.test.ts`

Expected: FAIL because `src/content/projects.ts` does not exist.

- [ ] **Step 4: Implement the minimal typed project model**

Define these public types and functions:

```ts
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
  activeLine: string;
  heroOutcome: string;
  role: string;
  period: string;
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

export function getProjectBySlug(slug: string): Project | undefined;
export function getProjectNeighbors(slug: ProjectSlug): {
  previous?: Project;
  next?: Project;
};
```

Export `projects` as `readonly Project[]` in this exact order, with these exact landing lines and metric constraints:

| Slug | Name | Active line | Verified metrics |
| --- | --- | --- | --- |
| `touchpoint` | `Touchpoint` | `결제와 일정 조율을 하나의 링크로 통합합니다` | `[]` |
| `butlerlee` | `Butlerlee` | `OTA 의존도를 97%에서 70%로 낮췄습니다` | `OTA 의존도 97% → 70%`, `월 약 800만원 수수료 절감` |
| `snode` | `Snode` | `현장 관리비 월 1,300만원 절감` | `월 평균 1,300만원 운영비 절감` |
| `coffeeting` | `Coffeeting` | `MVP 5개월 만에 월매출 1,200만원` | `월매출 1,200만원`, `1개월 재구매율 남성 58% · 여성 52%` |
| `matching-admin` | `Matching Admin` | `1팀 처리 35분 → 4.15분` | `1팀 처리 35분 → 4.15분`, `운영 효율 5배 이상` |
| `moum` | `Moum` | `4개월 만에 매출 3.9배` | `상품 클릭률 10% → 29%`, `4개월 매출 3.9배` |

Write all five narrative arrays for every entry from the design spec and source portfolio. Do not leave seed or filler strings. Touchpoint's outcome must explicitly say market response is still `검증 전` and describe the regulation/payment pivot as learning.

- [ ] **Step 5: Run tests and type checking**

Run: `npm test -- src/content/projects.test.ts && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit the model**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json next-env.d.ts eslint.config.mjs vitest.config.ts src/test/setup.ts src/content .gitignore
git commit -m "feat: add typed portfolio content model"
```

---

### Task 2: Acquire and Validate Production Assets

**Files:**
- Create: `public/assets/projects/touchpoint/card.jpg`
- Create: `public/assets/projects/touchpoint/logo.svg`
- Create: `public/assets/projects/butlerlee/card.png`
- Create: `public/assets/projects/butlerlee/logo.png`
- Create: `public/assets/projects/snode/card.png`
- Create: `public/assets/projects/snode/logo.png`
- Create: `public/assets/projects/coffeeting/card.png`
- Create: `public/assets/projects/coffeeting/logo.png`
- Create: `public/assets/projects/matching-admin/card-anonymized.png`
- Create: `public/assets/projects/moum/card.png`
- Create: `public/assets/projects/moum/logo.png`
- Create: `public/dokyum-kim-portfolio.pdf`
- Modify: `src/content/projects.test.ts`
- Modify: `src/content/projects.ts`

**Interfaces:**
- Consumes: `Project.media` paths from Task 1.
- Produces: every local file referenced by landing cards, detail heroes, metadata, and the PDF CTA.

- [ ] **Step 1: Add a failing local-asset validation test**

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";

it("ships every required project asset and the PDF locally", () => {
  for (const project of projects) {
    expect(existsSync(join(process.cwd(), "public", project.media.card))).toBe(true);
    expect(existsSync(join(process.cwd(), "public", project.media.hero))).toBe(true);
    expect(existsSync(join(process.cwd(), "public", project.media.logo))).toBe(true);
  }
  expect(existsSync(join(process.cwd(), "public/dokyum-kim-portfolio.pdf"))).toBe(true);
});
```

- [ ] **Step 2: Run the asset test and confirm the red state**

Run: `npm test -- src/content/projects.test.ts`

Expected: FAIL because the production asset files do not exist.

- [ ] **Step 3: Copy the two approved Touchpoint assets and the source PDF**

Use these exact sources and destinations:

```text
/Users/dockyum/Workspace/touchpoint/public/images/videos/main_video_2_poster.jpg
  -> public/assets/projects/touchpoint/card.jpg
/Users/dockyum/Workspace/touchpoint/public/logo.svg
  -> public/assets/projects/touchpoint/logo.svg
/Users/dockyum/Documents - kim/12. 이직준비 2026.02-06/2. 포트폴리오/260804_김도겸_포트폴리오_3.1.pdf
  -> public/dokyum-kim-portfolio.pdf
```

- [ ] **Step 4: Download Figma assets into the project**

Use the connected Figma file and store the current MCP assets at these stable local paths:

```text
Butlerlee card  fb13de5e-c71e-4a41-a4a2-a3bbdd6238bb.png -> butlerlee/card.png
Butlerlee logo  8e578049-7232-4f77-a2df-c7d4f0e0980a.png -> butlerlee/logo.png
Snode card      9fe0d21c-31d7-464a-915b-2fb698528d81.png -> snode/card.jpg
Snode logo      babe5ab7-d6cc-44a7-8dfe-403cb3101799.png -> snode/logo.png
Coffeeting card 6acc0061-9037-473c-bb57-b4ece4bf941c.png -> coffeeting/card.jpg
Coffeeting logo 14dfc716-f738-43df-9171-008827c714c3.png -> coffeeting/logo.png
Matching source 5fe54349-9461-40ba-b55a-1529cc6dc97e.png -> temporary private input only
Moum card        ec61f1f5-9feb-4103-b0d0-041c4d0c7862.png -> moum/card.png
Moum logo        455e001a-e83d-4b92-be26-095577f77dcb.png -> moum/logo.png
```

The Matching Admin source contains real profile information. Use it only as an ImageGen edit target, replace faces and identifying data with fictional samples, save only the result as `matching-admin/card-anonymized.png`, and keep no private source in the repository. Matching Admin intentionally references Coffeeting's local logo. Inspect each downloaded file's MIME type and dimensions, and reject HTML/error payloads masquerading as images.

- [ ] **Step 5: Point every project to local assets and rerun validation**

Use public-relative paths such as `assets/projects/snode/card.png` in `Project.media`. Reuse the card image as the hero when no separate approved hero exists.

Run: `npm test -- src/content/projects.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the assets**

```bash
git add public src/content/projects.ts src/content/projects.test.ts
git commit -m "feat: add portfolio media and downloadable PDF"
```

---

### Task 3: Build the Accessible Landing Page and Card Interaction

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/landing/project-carousel.tsx`
- Create: `src/components/landing/project-carousel.test.tsx`

**Interfaces:**
- Consumes: ordered `projects` and each project's route, active line, card image, logo, and alt text.
- Produces: `ProjectCarousel({ projects }: { projects: readonly Project[] })` and the visible landing experience.

- [ ] **Step 1: Write failing interaction tests**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { projects } from "@/content/projects";
import { ProjectCarousel } from "./project-carousel";

it("starts on Touchpoint and advances with ArrowRight", () => {
  render(<ProjectCarousel projects={projects} />);
  const carousel = screen.getByRole("region", { name: "프로젝트 둘러보기" });
  expect(screen.getByText(projects[0].activeLine)).toBeInTheDocument();
  fireEvent.keyDown(carousel, { key: "ArrowRight" });
  expect(screen.getByText(projects[1].activeLine)).toBeInTheDocument();
});

it("keeps every project reachable as a named link", () => {
  render(<ProjectCarousel projects={projects} />);
  for (const project of projects) {
    expect(screen.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
      "href",
      project.route,
    );
  }
});
```

- [ ] **Step 2: Run the landing test and confirm the red state**

Run: `npm test -- src/components/landing/project-carousel.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the semantic shell and staged copy**

Render:

```tsx
<main>
  <ProjectCarousel projects={projects} />
</main>
```

The carousel region must have `tabIndex={0}` and `aria-label="프로젝트 둘러보기"`. Render `BUILDING BEYOND THE PRODUCT`, the active project name and line, and the two-line headline `제품 밖의 병목까지,` / `사업이 흐르도록 다시 설계합니다.`. Keep all six cards in DOM order as links; use CSS transforms and `aria-current` for the active visual state.

- [ ] **Step 4: Implement bounded interaction state**

Implement pure index clamping and handlers for:

```ts
const select = (index: number) => setActiveIndex(Math.max(0, Math.min(index, projects.length - 1)));
const previous = () => select(activeIndex - 1);
const next = () => select(activeIndex + 1);
```

Add pointer capture for drag/swipe, a 48px selection threshold, left/right key handling, card click selection, Enter navigation through the active link, and wheel accumulation with one-card advancement per threshold. Do not call `preventDefault()` for ordinary wheel events.

- [ ] **Step 5: Add the editorial visual system**

Define CSS custom properties for background, foreground, muted text, card width, and transition duration. Create a centered active card, overlapping neighbors, image overlay, bottom logo plate, and z-index/scale/brightness states based on signed distance from the active index. Use `clamp()` for card and headline sizing. Add `@media (prefers-reduced-motion: reduce)` to remove transforms' animation and disable smooth scrolling.

- [ ] **Step 6: Add the header and CTAs**

`SiteHeader` must render `DOKYUM KIM`, a secondary same-origin PDF link with `download`, and a visually primary `mailto:snfltptkd91@gmail.com` link labeled `이메일로 연락하기`.

- [ ] **Step 7: Run component tests and build**

Run: `npm test -- src/components/landing/project-carousel.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 8: Commit the landing experience**

```bash
git add src/app src/components
git commit -m "feat: build interactive portfolio landing"
```

---

### Task 4: Build Static Detail Pages and Neighbor Navigation

**Files:**
- Create: `src/app/work/[slug]/page.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/components/work/project-detail.tsx`
- Create: `src/components/work/project-navigation.tsx`
- Create: `src/components/work/project-navigation.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `getProjectBySlug`, `getProjectNeighbors`, and the shared `Project` type.
- Produces: six statically generated pages, unique metadata, permanent typo redirect, and boundary-safe navigation.

- [ ] **Step 1: Write failing navigation tests**

```tsx
import { render, screen } from "@testing-library/react";
import { getProjectNeighbors } from "@/content/projects";
import { ProjectNavigation } from "./project-navigation";

it("shows only next on the first project", () => {
  render(<ProjectNavigation {...getProjectNeighbors("touchpoint")} />);
  expect(screen.queryByText("이전 프로젝트")).not.toBeInTheDocument();
  expect(screen.getByText("다음 프로젝트")).toBeInTheDocument();
});

it("shows both directions in the middle", () => {
  render(<ProjectNavigation {...getProjectNeighbors("snode")} />);
  expect(screen.getByText("이전 프로젝트")).toBeInTheDocument();
  expect(screen.getByText("다음 프로젝트")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the detail navigation test and confirm the red state**

Run: `npm test -- src/components/work/project-navigation.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the reusable detail sections**

`ProjectDetail` renders semantic sections in this exact order: hero, overview, problem, judgment and hypothesis, execution, outcome and learning, project navigation. Display the verified metrics as a concise metric strip only when `verifiedMetrics.length > 0`; Touchpoint renders no empty metric strip.

- [ ] **Step 4: Implement static routes and metadata**

```ts
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.name} — dokyum kim`,
    description: project.summary,
    openGraph: { images: [`/${project.media.hero}`] },
  };
}
```

Resolve unknown slugs with `notFound()`. Add a permanent redirect from `/work/snod` to `/work/snode` in `next.config.ts`.

- [ ] **Step 5: Style the detail narrative and navigation**

Use a spacious editorial grid, sticky or anchored section labels only where they do not cover content, full-width evidence images, metric typography, and a two-column previous/next footer that collapses cleanly to one column on mobile.

- [ ] **Step 6: Run tests and generate all routes**

Run: `npm test -- src/components/work/project-navigation.test.tsx src/content/projects.test.ts && npm run build`

Expected: PASS, with all six routes statically generated.

- [ ] **Step 7: Commit the project pages**

```bash
git add src/app src/components/work next.config.ts
git commit -m "feat: add six portfolio case study pages"
```

---

### Task 5: Add Browser Smoke Tests and Complete Responsive Accessibility

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/portfolio.spec.ts`
- Modify: `src/app/globals.css`
- Modify: `src/components/landing/project-carousel.tsx`
- Modify: `src/components/site-header.tsx`

**Interfaces:**
- Consumes: production routes and accessible names from Tasks 3 and 4.
- Produces: repeatable end-to-end validation for the final build.

- [ ] **Step 1: Write the failing Playwright smoke test**

```ts
import { expect, test } from "@playwright/test";

test("landing, detail navigation, email, and PDF are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /제품 밖의 병목까지/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "이메일로 연락하기" })).toHaveAttribute(
    "href",
    "mailto:snfltptkd91@gmail.com",
  );
  await page.getByRole("link", { name: /Touchpoint/ }).click();
  await expect(page).toHaveURL(/\/work\/touchpoint$/);
  await page.getByRole("link", { name: /다음 프로젝트.*Butlerlee/ }).click();
  await expect(page).toHaveURL(/\/work\/butlerlee$/);
  const pdf = await page.request.get("/dokyum-kim-portfolio.pdf");
  expect(pdf.ok()).toBe(true);
});

for (const slug of ["touchpoint", "butlerlee", "snode", "coffeeting", "matching-admin", "moum"]) {
  test(`${slug} detail page loads`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.locator("main h1")).toBeVisible();
  });
}
```

- [ ] **Step 2: Run Playwright before adding its server configuration and confirm the red state**

Run: `npx playwright install chromium && npm run build && npm run start -- --hostname 127.0.0.1 --port 4173` in one terminal, then `npm run test:e2e` in another.

Expected: FAIL because `playwright.config.ts` and its web server have not been configured.

- [ ] **Step 3: Resolve responsive and accessibility mismatches**

Verify 360x800, 768x1024, and 1440x900. Keep the active card and headline unclipped, keep both CTAs reachable, preserve 44px touch targets, expose visible focus, ensure decorative cards do not disturb reading order, and confirm reduced-motion mode removes animated transforms.

- [ ] **Step 4: Run the complete local verification suite**

Run: `npm run lint && npm test && npm run build && npm run test:e2e`

Expected: all commands exit 0.

- [ ] **Step 5: Commit the verified UI**

```bash
git add playwright.config.ts tests src
git commit -m "test: verify responsive portfolio flows"
```

---

### Task 6: Visual Review in the In-App Browser

**Files:**
- Modify only files directly implicated by observed visual defects.

**Interfaces:**
- Consumes: the locally built site.
- Produces: a visually reviewed implementation matching the approved landing direction.

- [ ] **Step 1: Start the local application and open it in the in-app browser**

Run: `npm run dev -- --hostname 127.0.0.1` and note the assigned port. Open `/`, all six detail routes, and `/work/snod`.

- [ ] **Step 2: Compare the implementation against the approved design**

Check the real product imagery and logos, central-card scale, neighboring overlap, typography hierarchy, staged active line, header spacing, CTA priority, and project footer navigation. Confirm the Northzone reference is visible as inspiration without copying its branded content.

- [ ] **Step 3: Fix only verified defects and rerun focused tests**

For each defect, modify the smallest responsible component or CSS rule and rerun its unit test plus the relevant Playwright test.

- [ ] **Step 4: Run final local verification and commit**

Run: `npm run verify`

Expected: PASS.

```bash
git add src tests
git commit -m "fix: polish final portfolio presentation"
```

Skip the commit when visual review requires no source change.

---

### Task 7: Create, Push, Version, and Deploy the Site

**Files:**
- Create: `.openai/hosting.json`
- Create outside repo: `/tmp/dokyum-portfolio-site.tar.gz`

**Interfaces:**
- Consumes: the verified committed `main` branch.
- Produces: a Sites project ID, pushed source commit, saved version ID, deployment ID, and public production URL.

- [ ] **Step 1: Confirm deployment preconditions**

Run:

```bash
git status --short
git rev-parse HEAD
npm run verify
```

Expected: clean source tree, one exact HEAD SHA, and all checks passing.

- [ ] **Step 2: Create the Sites project exactly once**

Read `.openai/hosting.json` first. When it has no `project_id`, call Sites `create_site` with:

```json
{
  "title": "Dokyum Kim — Product Portfolio",
  "slug": "dokyum-kim-portfolio",
  "description": "제품 밖의 병목까지 다시 설계하는 PO/PM dokyum kim의 포트폴리오"
}
```

Immediately write the returned opaque `id` unchanged to `.openai/hosting.json` as `project_id`. Never call `create_site` again for this local site.

- [ ] **Step 3: Commit the hosting binding and push the exact source state**

```bash
git add .openai/hosting.json
git commit -m "chore: connect portfolio to Sites"
git rev-parse HEAD
```

Use the short-lived source repository credential returned by Sites, or request one for the stored project ID. Configure authentication only for the push command, add the Sites remote without embedding the token, and push `main`. Never print or persist the token.

- [ ] **Step 4: Package the successful build and save a version**

Build from the pushed HEAD. This session does not expose the Sites hosting packaging helper required to produce a supported OpenNext/vinext archive, so use Sites' remote-build fallback and omit the archive rather than uploading either `.next` or the source tree. Call `save_site_version` with the stored project ID and exact pushed HEAD SHA.

- [ ] **Step 5: Deploy the saved version publicly**

Call `deploy_site_version` with the exact project ID and saved version ID. The user's original request explicitly authorizes public deployment. If the initial status is `pending`, `building`, or `publishing`, poll `get_deployment_status` with the deployment ID until `succeeded` or `failed`.

- [ ] **Step 6: Verify production and report the URL**

Open the returned production URL and verify `/`, one middle detail page, `/work/snod`, the email CTA, and the PDF response. Report the production URL and the final Git commit SHA.
