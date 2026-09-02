# Task 6 Report: Career Timeline Page

## RED → GREEN evidence

All commands below used the required bundled runtime PATH prefix:

```bash
PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

### Preliminary RED: missing timeline module

After adding the supplied component test and route-level E2E test, before creating the timeline module:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm vitest run src/components/career/career-timeline.test.tsx
```

Relevant output:

```text
❯ src/components/career/career-timeline.test.tsx (0 test)
Error: Failed to resolve import "./career-timeline" from "src/components/career/career-timeline.test.tsx". Does the file exist?
Test Files  1 failed (1)
Tests  no tests
```

The required chronology E2E also failed against the absent route:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm playwright test -g "complete work chronology"
```

Relevant output:

```text
1) [chromium] › e2e/portfolio.spec.ts:54:1 › Career renders the complete work chronology
Error: expect(locator).toBeVisible() failed
Locator: getByRole('heading', { name: 'Touchpoint' })
1 failed
```

### Semantic RED: typed placeholder

A smallest typed empty placeholder was added solely to execute the component assertions:

```tsx
import type { CareerEntry, EducationEntry } from "@/content/career";

export function CareerTimeline({
  careers,
  education,
}: {
  careers: readonly CareerEntry[];
  education: readonly EducationEntry[];
}) {
  return <section aria-label={`커리어 타임라인 (${careers.length + education.length})`} />;
}
```

Command:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm vitest run src/components/career/career-timeline.test.tsx
```

Behavior assertions failed as expected:

```text
❯ src/components/career/career-timeline.test.tsx (2 tests | 2 failed)
× renders every career and education entry
TestingLibraryElementError: Unable to find an accessible element with the role "heading" and name "Touchpoint"
× links career evidence to canonical project pages
TestingLibraryElementError: Unable to find an accessible element with the role "link" and name "Snode 프로젝트 보기"
Test Files  1 failed (1)
Tests  2 failed (2)
```

### Focused GREEN

Component contract:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm vitest run src/components/career/career-timeline.test.tsx
```

```text
Test Files  1 passed (1)
Tests  2 passed (2)
```

Route chronology contract:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm playwright test -g "complete work chronology"
```

```text
✓  1 [chromium] › e2e/portfolio.spec.ts:54:1 › Career renders the complete work chronology (1.7s)
1 passed (6.6s)
```

### Task-relevant full verification

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm verify
```

The command exited with status 0:

```text
$ oxlint
Test Files  8 passed (8)
Tests  27 passed (27)
✓ Compiled successfully
✓ Finished TypeScript
├ ○ /career
Running 7 tests using 1 worker
7 passed (25.0s)
```

## Implementation

- Added `CareerTimeline`, rendering all supplied career entries in their existing reverse-chronological order and all education entries from typed content.
- Added the exact semantic career entry hooks: `.career-entry`, `.career-period`, `.career-entry-main`, `.career-role`, `.career-summary`, `.career-highlights`, and `.career-projects`.
- Resolved every career project slug through `getProjectBySlug` and linked to its canonical `project.route` with the required accessible project names.
- Added `/career` with a `2016 — NOW` hero, Korean route metadata, canonical `/career` metadata path, the timeline/education output, and an email CTA.
- Kept phone and source resume URL/PDF out of the public page.
- Added the complete-work-chronology Playwright contract while preserving the existing project and landing assertions.
- Added no visual CSS; the semantic hooks remain available for the later Career rail styling task.

## Files changed

- `src/components/career/career-timeline.tsx` — data-driven career and education timeline.
- `src/components/career/career-timeline.test.tsx` — supplied rendering and canonical-link tests.
- `src/app/career/page.tsx` — Career route, metadata, hero, timeline mount, and CTA.
- `e2e/portfolio.spec.ts` — complete chronology route assertion.
- `.superpowers/sdd/2026-09-02-portfolio-v2/task-6-report.md` — this report.

## Self-review

- Confirmed all seven company headings and all three education institutions render from `careerEntries`/`educationEntries` without duplicating content in the page.
- Confirmed Snode, Butlerlee, Moum, Coffeeting, and Matching Admin evidence links use `getProjectBySlug(...).route`; no handwritten project route is present.
- Confirmed the route metadata uses `alternates.canonical: "/career"`, inheriting the existing layout `metadataBase`.
- Confirmed no phone number or private resume source URL/PDF appears in the new route/component files.
- Confirmed no CSS, plan, spec, ledger, landing, GNB, or project-detail behavior was changed.
- Confirmed `git diff --check` passed before commit and the complete verification passed after the final semantic adjustment.

## Commits

- `d7b884dc163eb3a9db1fe7a2c4a4e2d77d9b7b24` — `feat: add complete career timeline`
- Documentation report commit is created after this report is written.

## Concerns

- Existing Next.js warnings about `scroll-behavior: smooth`, `FORCE_COLOR`, and environment color appeared during Playwright startup; they did not fail verification and are unrelated to this task.
- Career visual layout and rail styling remain intentionally deferred to Task 8.
