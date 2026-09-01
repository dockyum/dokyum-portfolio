# Dokyum Kim Portfolio Website Design

## 1. Purpose

Build and publicly deploy a Korean-first portfolio website for **dokyum kim**, aimed primarily at recruiters and PO/PM leaders. The site should make his strongest differentiator immediately legible: he identifies the business bottleneck behind a feature request, then redesigns the product and the surrounding operation until the business can move again.

The visual direction is inspired by Northzone's dark, editorial landing page and overlapping case cards. The implementation must be original rather than a pixel-for-pixel reproduction.

## 2. Success Criteria

- The first viewport communicates dokyum kim's positioning without relying on generic PM language.
- Six cards each represent one project and lead to a dedicated Korean detail page.
- Every card uses a recognizable product or marketing image and the actual product logo.
- Every detail page presents the business problem, judgment, execution, outcome, and learning without inventing results.
- The main call to action opens an email to `snfltptkd91@gmail.com`.
- The original portfolio PDF is available through a separate download action.
- The site works with mouse, keyboard, touch, reduced-motion preferences, and common mobile and desktop viewport widths.
- The production build passes automated tests and is deployed to a public URL.

## 3. Scope

### Included

- A Northzone-inspired landing page with an overlapping, interactive six-card carousel.
- Six statically generated project detail pages.
- Local copies of approved Figma and Touchpoint assets.
- A separate PDF download.
- Responsive design, keyboard navigation, accessible labels, focus states, and reduced-motion behavior.
- Automated component, route, navigation, and browser smoke tests.
- Deployment through OpenAI Sites to its default production URL.

### Excluded

- A CMS, database, contact form backend, analytics dashboard, authentication, blog, or separate About page.
- Fabricated Touchpoint traction, revenue, or booking metrics.
- A custom domain; it can be attached later without changing the site architecture.
- The commercial Marr Sans Condensed font, because no webfont license or font file is available.

## 4. Information Architecture

Project order is fixed and controls the landing card sequence and previous/next navigation:

1. `/work/touchpoint`
2. `/work/butlerlee`
3. `/work/snode`
4. `/work/coffeeting`
5. `/work/matching-admin`
6. `/work/moum`

Other public paths:

- `/` — landing page
- `/dokyum-kim-portfolio.pdf` — downloadable source portfolio

The old `/work/snod` spelling is not canonical. It permanently redirects to `/work/snode`.

## 5. Brand and Copy System

The presentation is Korean-first. Product names and the editorial eyebrow remain in English where they are part of the product identity or visual language.

### Identity

- Display name: `DOKYUM KIM`
- Canonical spelling in metadata and copy: `dokyum kim`
- Email: `snfltptkd91@gmail.com`
- Main CTA label: `이메일로 연락하기`
- Secondary CTA label: `포트폴리오 PDF`

### Landing Copy

- Editorial eyebrow: `BUILDING BEYOND THE PRODUCT`
- Main headline:
  - `제품 밖의 병목까지,`
  - `사업이 흐르도록 다시 설계합니다.`

The active project line changes with the selected card:

| Project | Active line |
| --- | --- |
| Touchpoint | 결제와 일정 조율을 하나의 링크로 통합합니다 |
| Butlerlee | OTA 의존도를 97%에서 70%로 낮췄습니다 |
| Snode | 현장 관리비 월 1,300만원 절감 |
| Coffeeting | MVP 5개월 만에 월매출 1,200만원 |
| Matching Admin | 1팀 처리 35분 → 4.15분 |
| Moum | 4개월 만에 매출 3.9배 |

The headline stays constant while the selected project name, outcome line, image, and logo transition together.

## 6. Visual System

### Typography

- English body, navigation, and utility text: Inter.
- Editorial italic eyebrow: Instrument Serif Italic.
- Korean body: Pretendard.
- Korean display headline: Pretendard ExtraBold with tight tracking, compact line height, and a deliberately narrow text column to approximate the density of Northzone's headline without distorting glyphs.
- English condensed display text: Roboto Condensed.

Marr Sans Condensed is not loaded, linked, or imitated through an unlicensed font file. Because it does not provide the Korean headline treatment required here, the Korean headline uses the licensed/open fallback above.

### Color and Surface

- Near-black page background with warm off-white type.
- Project-specific image color supplies most of the visual variation.
- Thin low-contrast rules and compact uppercase utility labels support the editorial hierarchy.
- Cards keep a restrained radius and minimal shadow; depth comes primarily from scale, overlap, and brightness.

### Card Media

Each card contains one meaningful app, website, field, or marketing image. Its lower area contains the actual product logo only, not a typed product-name caption.

| Project | Primary media | Logo treatment |
| --- | --- | --- |
| Touchpoint | Public marketing poster from the local Touchpoint repository, prioritizing the poster that shows the product UI in context | Local `public/logo.svg` |
| Butlerlee | Website or hanok-stay marketing image from Figma | Butlerlee logo from Figma |
| Snode | Field-service or app image from Figma | Snode logo from Figma |
| Coffeeting | App marketing image from Figma | Coffeeting logo from Figma |
| Matching Admin | Admin product screenshot from Figma | Coffeeting product logo, because the admin belongs to that product |
| Moum | Website or marketing image from Figma | Moum logo from Figma |

All remote Figma assets are downloaded into the project during implementation. Expiring Figma MCP asset URLs are never used directly in production. Only public marketing assets are copied from the Touchpoint repository; source code, environment files, customer data, caches, and private operational data remain out of scope.

## 7. Landing Interaction

- Touchpoint is selected on first load.
- The active card is centered, larger, brighter, and above neighboring cards.
- Adjacent cards remain partially visible and overlap in perspective, creating a continuous stack rather than a conventional flat carousel.
- Users can change the active card by dragging, swiping, using the mouse wheel while the pointer is over the carousel, clicking a visible card, or pressing the left/right arrow keys.
- Selecting a card updates the project name, active outcome line, card depth, and logo as one coordinated state change.
- Clicking or pressing Enter on the active card opens its detail page.
- Motion uses restrained transforms and opacity. With `prefers-reduced-motion: reduce`, movement is removed and state changes use a short opacity transition or no transition.
- The carousel does not trap page scrolling. It accumulates wheel delta, advances at most one card per threshold with a short lockout, and does not cancel the browser's normal vertical scroll.

### Responsive Behavior

- At 1200px and wider, the full cinematic overlapping stack is visible.
- From 768px to 1199px, card size and overlap reduce while preserving two neighboring card peeks.
- Below 768px, the selected card occupies most of the viewport width and one partial card edge is visible on each side when space allows.
- Header actions remain reachable without covering the card or headline. On narrow screens, the PDF action stays a secondary compact text link while the email CTA remains visually primary.
- Text is allowed to reflow naturally; no Korean glyph is compressed with CSS transforms.

## 8. Detail Page Template

Every detail page uses the same semantic structure while allowing project-specific evidence and imagery:

1. Hero: product logo, project title, role, timeframe, team, primary visual, and one verified headline outcome.
2. Overview: the business context and the constraint that made the project necessary.
3. Problem: evidence, operating friction, and why the existing approach failed.
4. Judgment and hypothesis: the decision dokyum kim made, alternatives considered, and the expected mechanism.
5. Execution: product changes plus any admin, checklist, education, manual operation, job-role, or sales-process changes that were part of the solution.
6. Outcome and learning: verified results, limits of the evidence, and what changed in the next decision.
7. Project navigation: previous and next project links based on the fixed order.

The first project shows only `다음 프로젝트`; the last shows only `이전 프로젝트`; all middle projects show both. Each link includes the destination product name and remains keyboard accessible.

### Project-Specific Narrative Guardrails

- **Touchpoint:** Present it as a hands-on 0→1 product build for creators and experts to combine offering, request, scheduling, and payment in one shareable profile link. Cover the working product, onboarding, dashboard, payment, internationalization, and instrumentation. State clearly that market traction is not yet validated. Explain the payment/regulatory constraint and global payment pivot as learning, not as a growth result.
- **Butlerlee:** Focus on the owned-web redesign and membership system for the Seochon/Bukchon hanok-stay service. Verified outcome: OTA dependence reduced from about 97% to 70%, with about KRW 8 million in monthly commission savings.
- **Snode:** Focus on app/admin launch and field-operation redesign. Verified outcome: about KRW 13 million in average monthly operating-cost reduction.
- **Coffeeting:** Focus on the MVP and learning loop. Verified outcome: KRW 12 million monthly revenue within five months; repurchase rates of 58% for men and 52% for women may appear only where their original context is explained.
- **Matching Admin:** Focus on operational throughput. Verified outcome: handling time reduced from 35 minutes per team to 4.15 minutes per team, described as roughly fivefold throughput only where the calculation and baseline are clear.
- **Moum:** Focus on the click and revenue funnel improvements. Verified outcomes: click rate increased from 10% to 29% and revenue reached 3.9 times the starting level within four months.

## 9. Application Architecture

The project is a new Next.js application using the App Router and TypeScript. Content is stored as typed local data, not embedded separately in each page.

### Primary Units

- `src/content/projects.ts` owns project order, routes, landing copy, metrics, narrative sections, image references, and previous/next relationships.
- `src/components/landing/` owns the card stack, interaction controls, staged copy, and responsive behavior.
- `src/components/work/` owns the shared detail-page sections and previous/next navigation.
- `src/app/page.tsx` composes the landing page from project data.
- `src/app/work/[slug]/page.tsx` statically generates the six project pages and returns `notFound()` for unsupported slugs.
- `src/app/layout.tsx` owns metadata, font loading, global header, and document structure.
- `public/images/` contains optimized local project media and logos.
- `public/dokyum-kim-portfolio.pdf` contains the downloadable PDF.

Project data is the single source of truth. The landing carousel and detail routing consume the same ordered array, preventing card order, copy, and previous/next links from drifting apart.

### State and Data Flow

- The server-rendered landing page provides the ordered project data to a small client-side carousel component.
- The carousel stores only the selected project index and transient pointer/gesture state.
- The selected index derives the active media, logo, copy, link, and accessibility label.
- Detail pages receive a slug from the route, resolve it against the typed project collection, and render shared stateless sections.
- No runtime API calls are required after deployment.

### Failure Behavior

- Unknown project slugs render the standard 404 page.
- Missing required media or duplicate slugs fail automated content validation before deployment.
- Images define intrinsic dimensions or aspect ratios to prevent layout shift; meaningful images receive Korean alt text, while decorative imagery uses an empty alt attribute.
- Email uses a standard `mailto:` link, so it remains usable without JavaScript.
- The PDF uses a normal same-origin link with the `download` attribute and remains reachable if JavaScript fails.

## 10. Accessibility and Metadata

- All interactive cards are real links or buttons with visible focus states.
- Arrow-key behavior is announced through an accessible carousel label; status copy updates without creating noisy repeated announcements.
- Touch targets are at least 44 by 44 CSS pixels.
- Color contrast meets WCAG AA for body copy and controls.
- Heading hierarchy is linear on landing and detail pages.
- Korean page titles and descriptions are unique per project.
- Open Graph metadata uses the project's primary image and verified outcome copy.
- Decorative overlap does not change DOM reading order.

## 11. Testing and Verification

### Automated

- Vitest and Testing Library verify project-data validation, the initial active project, keyboard selection, reduced-motion class behavior, email CTA, PDF link, and previous/next boundaries.
- Route-generation tests verify that exactly the six approved slugs are emitted and that `snode` is canonical.
- Playwright smoke tests load the landing page and all six detail routes, activate a card, follow a detail link, traverse previous/next navigation, open the email link, and confirm the PDF response.
- `next build` completes with no TypeScript or static-generation errors.

### Manual Visual Review

- Review at 360x800, 768x1024, 1440x900, and one wide desktop viewport.
- Confirm every card image communicates its product before reading supporting copy.
- Confirm each card footer uses the correct logo and contains no typed product-name substitute.
- Confirm no carousel state clips the name, outcome line, headline, email CTA, or PDF action.
- Confirm keyboard focus order, hover states, touch swiping, ordinary page scrolling, and reduced-motion mode.
- Confirm Touchpoint includes no unverified traction claim and every numeric result matches the source portfolio or Figma evidence.

## 12. Deployment

- Create the new project in the current workspace and keep the final application source in this repository.
- Configure OpenAI Sites hosting for the Next.js project.
- Run the full test suite and production build before publishing.
- Deploy a production version and return its public URL to the user.
- No custom domain is required for the initial launch.

## 13. Source Material

- Portfolio PDF supplied by the user.
- Figma file `t7pbwiRt9lybon3TVmUcZG`, including the Butlerlee additions.
- Public marketing assets and product behavior inspected read-only in `/Users/dockyum/Workspace/touchpoint`.
- Northzone used only as visual reference for editorial typography, staged copy, and overlapping-card depth.
