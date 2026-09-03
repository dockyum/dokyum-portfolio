# Dokyum Kim Portfolio V2 Design

**Date:** 2026-09-02

**Status:** Approved direction, pending written-spec review

**Audience:** Korean-speaking recruiters, product leaders, founders, and hiring managers

**Primary action:** Send email to `snfltptkd91@gmail.com`

## 1. Objective

Rebuild the existing portfolio into a Korean-first editorial product portfolio that makes Dokyum Kim's core strength immediately legible: he finds bottlenecks outside the screen and redesigns the product and operating system together so the business can move.

The release must:

- retain one landing card for each of the six featured projects;
- make every project detail reachable from the global navigation;
- add a complete reverse-chronological career page based on the supplied resume;
- show a persisted, privacy-conscious visitor count;
- move the production deployment from OpenAI Sites to Vercel;
- create and publish a public GitHub repository at `dockyum/dokyum-portfolio`;
- preserve the email CTA and separate portfolio PDF download;
- remain usable on desktop, tablet, and mobile without scroll hijacking.

## 2. Product Thesis

The page is not a gallery of screens. It is evidence that Dokyum identifies the real constraint in a business system, chooses the smallest high-leverage intervention, and carries it through product and operations.

Primary Korean statement:

> 제품 밖의 병목까지 찾아, 사업이 흐르는 구조로 바꿉니다.

Supporting English label:

> BUILDING BEYOND THE PRODUCT

The English label acts as metadata, not the main message. The Korean statement remains the dominant claim.

## 3. Reference Interpretation

Northzone is a principle reference, not a page to copy. The stable qualities to preserve are:

- a masthead that establishes character before content;
- an editorial grid that organizes varied stories;
- a restrained palette with one controlled signal color;
- a clear contrast between expressive display type and precise metadata type;
- motion concentrated in one or two orchestrated moments;
- layouts tuned to the story rather than repeated SaaS-style cards;
- direct language that favors evidence over hype.

The current portfolio diverges in five consequential ways:

1. It compresses cards, claim, navigation, and controls into one viewport.
2. Its heavy condensed sans typography reads as a generic technology portfolio rather than editorial storytelling.
3. Its carousel hides five projects and requires a two-step click for inactive cards.
4. Its wheel handler converts vertical scrolling into project selection.
5. Its detail pages repeat the same numbered structure regardless of the shape of each project story.

## 4. Information Architecture

```text
/
├── Work dropdown
│   ├── /work/touchpoint
│   ├── /work/butlerlee
│   ├── /work/snode
│   ├── /work/coffeeting
│   ├── /work/matching-admin
│   └── /work/moum
├── /career
├── /dokyum-kim-portfolio.pdf
└── mailto:snfltptkd91@gmail.com
```

Legacy compatibility:

- `/work/snod` permanently redirects to `/work/snode`.
- Existing project routes remain stable.
- The old OpenAI Sites deployment is not deleted automatically; it ceases to be the canonical URL after Vercel production verification.

## 5. Global Navigation

### Desktop

The header is a fixed paper-colored bar without blur, glass effects, or pill-shaped navigation.

Left:

- `DOKYUM KIM` wordmark linking to `/`.

Right:

- `WORK` button with an accessible dropdown;
- `CAREER` link to `/career`;
- `PDF` download link;
- `EMAIL ↗` primary CTA.

The Work dropdown exposes all six projects in one view. Each row contains the project number, name, year or period, and a short outcome. Rows are real links and open the detail page on the first click. The dropdown supports pointer, keyboard, Escape-to-close, and visible focus states.

### Mobile

The header contains only the wordmark and `MENU`. The menu opens a full-viewport panel containing:

- all six project links;
- Career;
- portfolio PDF;
- email CTA.

The menu locks background scroll while open, returns focus to the trigger when closed, and respects the device safe area.

## 6. Visual System

### Color tokens

- `paper`: `#F3F3EF`
- `paper-raised`: `#FBFBF8`
- `ink`: `#0A0B0D`
- `muted`: `#686B67`
- `grid`: `#D8DAD6`
- `signal-blue`: `#173D73`
- `focus`: `#1F5EFF`

Project accent colors remain available but appear only in thin rules, card media details, and hover/focus feedback. They do not compete with the global signal blue.

### Typography

- Latin display and masthead: Instrument Serif.
- Korean display and body: Pretendard Variable.
- Labels, dates, counters, project indexes, and navigation metadata: Geist Mono.

The exact Northzone commercial faces are not embedded without a license. The selected fonts reproduce the role contrast legally: expressive editorial display, highly readable Korean, and exact utility metadata.

### Layout

- Twelve-column desktop grid with fluid side margins.
- Four-column mobile grid.
- Thin rules and visible alignment replace decorative borders.
- Corners stay square or use at most a 2px optical softening.
- No gradients, glass blur, floating shadows, or generic pill UI.

### Signature element

The signature is the **career runway**: project cards sit on a measured editorial grid and overlap only enough to imply accumulated experience. Each card remains directly reachable and readable. The same measurement line continues into the Career timeline, connecting selected work to the full chronology.

## 7. Landing Page

### Desktop sequence

```text
┌──────────────────────────────────────────────────────────────┐
│ DOKYUM KIM                         WORK CAREER PDF EMAIL ↗   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ DOKYUM KIM                                                   │
│              제품 밖의 병목까지 찾아,                        │
│              사업이 흐르는 구조로 바꿉니다.                  │
│                                                              │
│  ┌──────┐┌──────┐┌──────┐┌──────┐ …                       │
│  │media ││media ││media ││media │   career runway          │
│  │ logo ││ logo ││ logo ││ logo │                          │
│  └──────┘└──────┘└──────┘└──────┘                          │
└──────────────────────────────────────────────────────────────┘
```

Load sequence:

1. masthead appears;
2. Korean thesis resolves line by line;
3. the career runway enters as one coordinated movement.

No other ambient animations run after the sequence. Reduced-motion users receive the final state immediately.

### Project cards

- Six cards, one per featured project.
- Cards follow the resume order: resume-backed career work first (Snode, Coffeeting, Matching Admin, Moum, Butlerlee), then independent projects (Touchpoint) last.
- The runway index labels the active card `CAREER` or `INDEPENDENT` so employment work and independent projects stay distinguishable without adding text to the cards.
- Media-first 4:5 composition.
- Bottom band contains only the product logo, preserving the earlier requirement.
- Accessible name and outcome remain in the DOM for screen readers.
- A separate visible index above or beside the runway identifies the focused or hovered project.
- Every card is a direct link on first activation.
- Desktop cards may overlap shallowly but cannot obscure navigation or copy.
- Vertical wheel input scrolls the page normally.

### Mobile behavior

- Cards form a horizontal scroll-snap row with one card and part of the next visible.
- The user can swipe naturally; no custom pointer threshold or wheel lock is required.
- A compact `01 / 06` indicator follows the active snap position.
- The thesis uses `word-break: keep-all` and a size that fits without clipping at 320px.

## 8. Project Detail Pages

Each project keeps the same semantic data but receives an editorial composition rather than five identical rows.

Page order:

1. project index, category, logo, and period;
2. outcome-led title;
3. full-width or split hero media;
4. verified metrics band when metrics exist;
5. problem and context;
6. decisive product judgment;
7. execution and operating-system changes;
8. outcome and learning;
9. previous and next project navigation.

Layout rules:

- The main outcome takes the largest type.
- Metrics use large numerals and mono labels.
- Judgment sections receive more visual emphasis than generic process descriptions.
- Section labels align to the grid and may stick on large screens.
- A single image is not repeated to simulate depth; typography and spacing carry the story when no additional media exists.
- Project-specific accent color is limited to a rule, marker, or selected text.

## 9. Career Page

Route: `/career`

The page uses reverse chronology because recruiters scan the newest and most relevant work first. It contains a continuous year rail and linked project evidence. Resume-backed employment history comes first; independent projects follow in their own section, before education.

### Work chronology

1. `2025.05–2026.02` — 서우노드 — PM
   Linked project: Snode.
2. `2022.10–2024.11` — 커피팅주식회사 — Co-founder, CPO
   Linked projects: Coffeeting, Matching Admin, Moum.
3. `2022.03–2022.10` — 프라우들리 — PM
   Linked project: Butlerlee. `프릴리` is listed as additional work without a detail route.
4. `2021.06–2021.12` — 룩코 — Frontend Developer
   Work: data collection and coding generator; Feed social feature.
5. `2018.12–2020.10` — 올스케이프 — Founder/CEO, Frontend Developer
   Work: 시공간 nearby restaurant pre-order app.
6. `2016.10–2018.11` — 피그위 — Founder/CEO.

### Independent projects

1. `2026–NOW` — Touchpoint — Founding Product Builder
   Linked project: Touchpoint.

### Education and training

- `2020.12–2021.05` — FastCampus Data Science School.
- `2016.03–2017.12` — 멋쟁이사자처럼 coding community, 4th and 5th cohorts.
- `2011.03–2020.02` — University of Seoul, Bachelor of Architecture.

### Privacy

- The resume phone number is not published.
- The resume PDF is not copied into the public repository.
- The already-public portfolio email, GitHub profile, and LinkedIn profile may be linked.

## 10. Visitor Counter

The footer displays an all-time anonymous browser count in mono type:

```text
VISITORS 000123
```

### Definition

A visitor is one browser that has not received the portfolio's counted cookie during the previous 400 days. Clearing cookies or switching browsers can create another count. This is intentionally described as a simple all-time visitor counter, not a precise person-level identity metric.

### Storage

- Atomic counter stored in Upstash Redis.
- Redis key: `portfolio:visitor-count:v1`.
- Environment variables: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Only the integer total is stored.
- No IP address, user agent, fingerprint, email, or generated visitor ID is stored.

### Request flow

1. A client component sends `POST /api/visitors` after hydration.
2. The route checks the `dk_portfolio_visited_v1` HTTP-only cookie.
3. Without the cookie, Redis `INCR` atomically increments the total and the route sets the cookie.
4. With the cookie, Redis `GET` returns the existing total without incrementing.
5. The component formats the result with at least six digits.

Cookie attributes:

- `httpOnly: true`
- `sameSite: lax`
- `secure: true` in production
- `path: /`
- `maxAge: 34,560,000` seconds

### Failure behavior

- The route returns `{ "count": null }` with a 503 status when Redis is unavailable.
- The footer renders `VISITORS —` without blocking the page.
- Failed requests do not retry in a loop.
- Local tests inject an in-memory counter implementation; production uses Redis.

## 11. Vercel Migration

The codebase returns to native Next.js deployment.

Remove:

- Vinext runtime and scripts;
- Cloudflare and OpenAI Sites Vite plugins;
- Wrangler configuration and scripts;
- `vite.config.ts`;
- `.openai/hosting.json` after the Vercel project is linked and a production build passes.

Retain:

- Next.js App Router;
- Vitest and Testing Library;
- Playwright;
- the permanent Snode redirect.

Package scripts:

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `oxlint`
- `test`: `vitest run`
- `test:e2e`: `playwright test`
- `verify`: lint, unit tests, production build, and E2E in order.

Canonical metadata resolves from `NEXT_PUBLIC_SITE_URL` when explicitly set, otherwise from `VERCEL_PROJECT_PRODUCTION_URL`, and finally `http://localhost:3000` during local development. No OpenAI Sites hostname remains hard-coded.

## 12. GitHub and Deployment

### GitHub

- Create public repository `dockyum/dokyum-portfolio`.
- Use `main` as the default branch.
- Add a concise README with purpose, stack, local commands, project routes, and environment variables.
- Do not commit `.env*`, Vercel credentials, Redis credentials, phone numbers, or private source screenshots.
- Set the repository homepage to the verified Vercel production URL.

### Vercel

- Create or link Vercel project `dokyum-portfolio`.
- Connect the GitHub repository so future `main` pushes deploy automatically.
- Provision and link Upstash Redis through Vercel Marketplace when the CLI permits non-interactive completion.
- Add Redis variables to Production, Preview, and Development scopes.
- Deploy production only after `pnpm verify` passes.
- Verify the production hostname before updating metadata or the GitHub homepage.

If Marketplace provisioning requires a pricing or terms decision, all code and deployment work proceeds without the counter secret; the footer remains in its safe unavailable state until the resource is approved and linked.

## 13. Accessibility and Interaction Requirements

- Every interactive control is keyboard reachable.
- Focus indicators use `focus` blue and meet contrast requirements.
- Work dropdown and mobile menu expose `aria-expanded` and meaningful labels.
- The active page link uses `aria-current="page"`.
- Images keep useful Korean alternative text; decorative logos use empty alt text where the visible project name is adjacent.
- Text maintains at least WCAG AA contrast.
- Touch targets are at least 44px.
- `prefers-reduced-motion` removes entry transforms and smooth scrolling.
- The page remains understandable when JavaScript fails; project links and core content are server-rendered.

## 14. Performance Requirements

- Landing LCP media uses responsive `next/image` sizing and one prioritized asset.
- Remaining cards and detail media load lazily.
- Font files are self-hosted through packages already in the build.
- The navigation menu does not preload all full-resolution project media.
- The visitor request runs after initial content hydration and cannot block rendering.
- No WebGL, canvas scene, or continuous animation is introduced.

## 15. Testing Strategy

### Unit and component tests

- project data contains six unique stable routes;
- career data is reverse chronological and links only to valid project routes;
- desktop Work navigation exposes every project;
- mobile menu toggles, closes, and preserves primary actions;
- visitor registration increments only without the cookie;
- visitor registration returns the stored total with the cookie;
- Redis failure produces the nullable response contract;
- previous and next detail navigation still handles boundaries.

### End-to-end tests

- landing shows six direct project links;
- each GNB project link reaches its detail page in one activation;
- Career is reachable from desktop and mobile navigation;
- PDF and email CTA remain available;
- `/work/snod` redirects to `/work/snode`;
- `/career` renders every work entry from 2016 to now;
- mobile navigation has no horizontal page overflow at 320px and 390px;
- social metadata uses the final Vercel origin;
- visitor counter displays a number or the documented unavailable state;
- all public routes return successful production responses.

### Visual review

Review desktop and mobile screenshots against this checklist:

- masthead leads the hierarchy;
- thesis is readable before project controls;
- cards never obscure the GNB or thesis;
- project logos have consistent optical size;
- no header labels wrap;
- detail layouts feel editorial rather than like identical documentation pages;
- the Career rail remains scannable on mobile;
- motion is limited to the approved sequence.

## 16. Acceptance Criteria

The release is complete when:

1. all six projects are directly reachable from landing and GNB;
2. the Career page includes all seven work entries and three education entries defined above;
3. the visitor counter increments and persists through the production Redis store; if Marketplace terms or pricing require the owner's decision, the release is reported as blocked rather than complete;
4. local lint, unit tests, Next.js production build, and E2E tests pass;
5. the public GitHub repository contains the reviewed source without secrets or private resume data;
6. Vercel reports a successful production deployment;
7. production desktop and mobile screenshots pass the visual checklist;
8. canonical, Open Graph, Twitter, PDF, email, redirect, and all public routes are verified against the Vercel URL.

## 17. Explicit Assumptions

- The GitHub repository is public.
- The Vercel project name is `dokyum-portfolio` unless Vercel requires a unique suffix.
- No custom domain is required in this release.
- The displayed counter represents unique browsers over a 400-day cookie window.
- Touchpoint is shown as an independent project, separate from and after the resume-backed employment history, because it is not part of formal employment in the resume.
- Resume phone number and source PDF remain private.
- The portfolio PDF remains a separate public download.
- The prior OpenAI Sites deployment is preserved but is no longer canonical after Vercel verification.
