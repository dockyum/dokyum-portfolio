# Task 5 Report: Editorial Project Detail Structure

## RED evidence

All commands below used the required bundled runtime PATH prefix:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm vitest run src/components/work/project-detail.test.tsx
```

The two assertions supplied verbatim by the brief already passed against the baseline implementation:

```text
Test Files  1 passed (1)
Tests  2 passed (2)
```

To capture a meaningful behavior-level RED for the requested hierarchy, I added one minimal test asserting four direct evidence chapters and hero-only overview content. Before the production change, the same focused command produced:

```text
❯ src/components/work/project-detail.test.tsx (3 tests | 1 failed)
× keeps overview in the hero and renders four evidence chapters
AssertionError: expected ... to have a length of 4 but got 5
Test Files  1 failed (1)
Tests  1 failed | 2 passed (3)
```

## Implementation

- Replaced the five-key section map with the exact four evidence chapters: 문제와 맥락, 핵심 판단, 실행과 운영 변화, 성과와 학습.
- Moved each project’s `overview` paragraphs into the hero summary and removed the repeated 프로젝트 개요 chapter.
- Added the project index (`01 / 06` through `06 / 06`) to the hero metadata.
- Kept verified metrics conditional; metrics are now labeled semantic `<dt>/<dd>` pairs, so Touchpoint renders no metrics band and retains its explicit unverified-growth outcome text.
- Kept the semantic `article`, `section`, `h2`, `dl`, and `figure` structure and added styling hooks for story indexes, metadata labels, metric labels/values, and navigation metadata/lines.
- Preserved `ProjectNavigation` neighbor resolution and first/middle/last boundary behavior; only its metadata classes changed.

## GREEN evidence

Focused detail and neighbor regression:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm vitest run src/components/work/project-detail.test.tsx src/components/work/project-navigation.test.tsx
```

```text
Test Files  2 passed (2)
Tests  6 passed (6)
```

Task-relevant lint and full verification:

```bash
env PATH="/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:/Users/dockyum/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm verify
```

```text
$ oxlint
Test Files  7 passed (7)
Tests  25 passed (25)
✓ Compiled successfully
✓ Finished TypeScript
Running 6 tests using 1 worker
6 passed (28.8s)
```

The command exited with status 0. Existing Next.js scroll-behavior and environment color warnings appeared during Playwright startup; they did not fail verification.

## Files changed

- `src/components/work/project-detail.tsx` — editorial hero, semantic metrics, and four-chapter story.
- `src/components/work/project-detail.test.tsx` — supplied outcome/metric tests plus the hierarchy regression test.
- `src/components/work/project-navigation.tsx` — metadata/line styling hooks with unchanged neighbor behavior.
- `.superpowers/sdd/2026-09-02-portfolio-v2/task-5-report.md` — this report.

## Self-review

- Confirmed all six project records render through the shared component and all four story chapters use the exact required labels.
- Confirmed overview text appears in the hero and no 프로젝트 개요 heading/chapter is rendered.
- Confirmed Butlerlee exposes the sourced `월 약 800만원 수수료 절감` metric.
- Confirmed Touchpoint has no `.work-metrics` element and still exposes `성장성은 아직 검증 전` from its outcome content.
- Confirmed first, middle, and last navigation boundary tests remain green.
- Confirmed `git diff --check` and `pnpm lint` pass; no CSS, content, plan, spec, or ledger files were changed.

## Concerns

- The brief’s two supplied tests did not fail against the baseline because the old component already had an outcome heading and conditional metrics. The added four-chapter assertion provides the missing RED signal without weakening the supplied tests.
- Visual typography and layout remain deferred to Task 8; this task only adds semantic structure and class hooks.
