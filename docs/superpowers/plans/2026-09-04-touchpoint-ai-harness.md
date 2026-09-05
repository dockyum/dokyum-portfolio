# Touchpoint AI 하네스 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Touchpoint 상세 페이지를 "AI 에이전트 하네스로 1인이 0→1 제품을 구축·운영한 사례"로 바꾸고, Hermes × Claude Code 하네스를 데이터 기반 인라인 SVG 다이어그램(클릭 확대, 드래그 이동, 줌)으로 넣는다.

**Architecture:** `src/content/harness.ts`가 다이어그램 데이터(레인·노드·엣지·범례·각주·단계)와 검증 함수를 소유한다. 서버 컴포넌트 `HarnessDiagram`이 데이터를 `<svg>`로 그리고, 클라이언트 컴포넌트 `HarnessViewer`가 힌트 버튼·`<dialog>`·이동·줌만 담당한다. `projects.ts`의 Touchpoint 항목이 서사와 `system` 챕터를 소유하고, `ProjectDetail`은 `system`이 있는 프로젝트에만 세 번째 챕터를 끼워 넣는다.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.2.6, TypeScript 5.9, Vitest 4 + Testing Library + jsdom 30, Playwright 1.62, oxlint. 새 의존성 없음.

**Spec:** `docs/superpowers/specs/2026-09-04-touchpoint-ai-harness-design.md` — 문구·노드·엣지의 정본. 계획과 스펙이 다르면 스펙을 먼저 고친 뒤 계획을 따른다.

## Global Constraints

- 패키지 매니저는 `corepack pnpm` (이 셸에 `pnpm`이 PATH에 없다). 모든 명령은 worktree 루트 `/Users/dockyum/orca/workspaces/dokyum-portfolio/touchpoint-architecture-추가`에서 실행한다.
- 새 의존성을 추가하지 않는다. 다이어그램과 뷰어는 React와 브라우저 표준 API만 쓴다.
- 색은 기존 토큰(`--paper`, `--paper-raised`, `--ink`, `--muted`, `--grid`, `--rule`, `--signal-blue`, `--focus`)만 쓴다. Touchpoint accent(`--project-accent`, `#ff6b5f`)는 `gate` 노드 마커와 `loop` 엣지에만 쓴다. 그라디언트, 그림자, 블러 금지.
- 폰트는 `var(--font-korean)`(Pretendard), `var(--font-mono)`(Geist Mono)만 쓴다.
- 한국어 문구는 스펙 4절을 글자 그대로 옮긴다. 시장 트랙션(매출, 사용자, 예약, 방문)은 어디에도 쓰지 않는다. `성장성은 아직 검증 전` 문장을 유지한다.
- 수치의 단일 출처는 `harnessCounts`(`hooks 16, rules 12, skills 20, agents 8, wikiPages 57, astGrepRules 9`)다. 지식 띠 제목과 메트릭 문자열은 템플릿 리터럴로 만든다.
- SVG `viewBox`는 `0 0 1600 1000`. 레인 x 구간: INTAKE 0–270, HERMES 270–560, CLAUDE CODE 560–980, HUMAN 980–1240, SHIP & OPERATE 1240–1600. 헤더 띠 y 0–56, 본문 y 56–800, 루프 통로 y 800–840, 지식 띠 y 840–1000.
- 뷰어: 네이티브 `<dialog>` + `showModal`, 페이지 스크롤 잠금은 `document.body.style.overflow = "hidden"`(GNB 모바일 메뉴와 같은 방식), 배율 범위 `0.5×fit`–`4×fit`, 항상 다이어그램의 25% 이상이 보이도록 클램프, 초기 배율은 cover.
- 감속 모션은 전역 규칙(`globals.css`의 `@media (prefers-reduced-motion: reduce)`가 모든 `transition`을 끈다)에 맡긴다. 컴포넌트는 CSS transition만 쓰고 JS 애니메이션을 만들지 않는다.
- 커밋 메시지는 영어 Conventional Commits. 커밋 트레일러: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` 와 `Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF`.
- `main`을 되감는 명령(`git reset`, `git rebase`, `branch -f`)은 쓰지 않는다. 최종 반영은 검증 통과 후 묻지 않고 PR 생성 → `git push github <branch>:main`(fast-forward)이며, 메인 체크아웃의 로컬 `main`은 건드리지 않는다(2026-09-05 사용자 지시, `~/.claude/rules/common/worktree.md` "완료 후 통합").

## File Structure

| 파일 | 책임 |
| --- | --- |
| `src/content/harness.ts` (신규) | 타입, `harnessCounts`, `harnessText`(글자 크기·행 간격), `knowledgeTitles`, `estimateTextWidth`, `textHeight`, `validateHarnessDiagram`, `touchpointHarness` 데이터 |
| `src/content/harness.test.ts` (신규) | 검증기 단위 테스트 + 실제 데이터 검증 |
| `src/components/work/harness-diagram.tsx` (신규) | 서버 컴포넌트. `routeEdge`, `parsePath`, `pathMidpoint`, `HarnessDiagram` |
| `src/components/work/harness-diagram.test.tsx` (신규) | 라우팅 함수와 SVG 렌더 테스트 |
| `src/components/work/harness-viewer.tsx` (신규) | 클라이언트 컴포넌트. 힌트, dialog, 이동, 줌, 키보드 |
| `src/components/work/harness-viewer.test.tsx` (신규) | 열기/닫기/드래그/휠/맞춤/스크롤 잠금 테스트 |
| `src/content/projects.ts` (수정) | `Project`에 `metricsNote?`, `system?` 추가. Touchpoint 항목 재작성 |
| `src/content/projects.test.ts` (수정) | Touchpoint 메트릭 규칙 테스트 교체 |
| `src/components/work/project-detail.tsx` (수정) | `buildChapters`, system 챕터, 메트릭 각주 |
| `src/components/work/project-detail.test.tsx` (수정) | 챕터 수·메트릭 테스트 갱신 |
| `src/app/globals.css` (수정) | `.work-system-*`, `.harness-*` 스타일 (파일 끝의 `@media` 블록 앞·안에 추가) |
| `e2e/portfolio.spec.ts` (수정) | Touchpoint 다이어그램 시나리오 추가 |

---

### Task 1: 하네스 데이터 타입과 검증기

**Files:**
- Create: `src/content/harness.ts`
- Test: `src/content/harness.test.ts`

**Interfaces:**
- Consumes: 없음.
- Produces: `HarnessDiagram`, `HarnessNode`, `HarnessEdge`, `HarnessLane`, `HarnessLegendItem`, `HarnessNodeKind`, `HarnessEdgeKind` 타입. `harnessCounts`, `harnessText`, `knowledgeTitles` 상수. `estimateTextWidth(text, size, mono?)`, `textHeight(node)`, `validateHarnessDiagram(diagram): string[]`. Task 2가 같은 파일에 `touchpointHarness`를 추가한다.

- [ ] **Step 1: worktree에 의존성을 설치하고 기존 테스트가 통과하는지 확인**

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm test
```

Expected: 설치 성공, 기존 단위 테스트 전부 PASS. (실패하면 여기서 멈추고 원인을 보고한다. 이 계획의 변경과 무관한 실패다.)

- [ ] **Step 2: 검증기 실패 테스트 작성**

`src/content/harness.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  harnessCounts,
  knowledgeTitles,
  textHeight,
  validateHarnessDiagram,
  type HarnessDiagram,
  type HarnessNode,
} from "./harness";

function node(overrides: Partial<HarnessNode> & { id: string }): HarnessNode {
  return {
    lane: "a",
    kind: "stage",
    title: "제목",
    label: ["label.sh"],
    detail: ["설명"],
    x: 20,
    y: 60,
    width: 200,
    height: 80,
    ...overrides,
  };
}

function knowledge(title: string, index: number): HarnessNode {
  return node({
    id: `k-${index}`,
    lane: "band",
    kind: "knowledge",
    title,
    label: [],
    detail: [],
    x: 20 + index * 230,
    y: 520,
    width: 200,
    height: 80,
  });
}

function fixture(overrides: Partial<HarnessDiagram> = {}): HarnessDiagram {
  return {
    id: "fixture",
    title: "픽스처",
    description: "검증기 테스트용 다이어그램",
    viewBox: { width: 1200, height: 700 },
    lanes: [{ id: "a", title: "A", subtitle: "", x: 0, width: 400 }],
    band: { title: "K", y: 500, height: 200 },
    nodes: [
      node({ id: "n1" }),
      node({ id: "n2", y: 200 }),
      ...Object.values(knowledgeTitles).map((title, index) => knowledge(title, index)),
    ],
    edges: [
      { from: "n1", to: "n2", kind: "flow" },
      { from: "n2", to: "n1", kind: "loop", label: "loop" },
    ],
    legend: [],
    footnote: "",
    steps: Array.from({ length: 12 }, (_, index) => `단계 ${index + 1}`),
    ...overrides,
  };
}

describe("validateHarnessDiagram", () => {
  it("accepts a consistent diagram", () => {
    expect(validateHarnessDiagram(fixture())).toEqual([]);
  });

  it("rejects duplicate node ids", () => {
    const diagram = fixture();
    const errors = validateHarnessDiagram({
      ...diagram,
      nodes: [...diagram.nodes, node({ id: "n1", y: 320 })],
    });
    expect(errors).toContainEqual(expect.stringContaining("duplicate node id: n1"));
  });

  it("rejects edges that point at unknown nodes", () => {
    const diagram = fixture();
    const errors = validateHarnessDiagram({
      ...diagram,
      edges: [...diagram.edges, { from: "n1", to: "ghost", kind: "flow" }],
    });
    expect(errors).toContainEqual(expect.stringContaining("ghost"));
  });

  it("rejects nodes that leave their lane, the viewBox, or overlap the band", () => {
    const outsideLane = validateHarnessDiagram(
      fixture({ nodes: [...fixture().nodes, node({ id: "n3", x: 300, width: 200, y: 320 })] }),
    );
    expect(outsideLane).toContainEqual(expect.stringContaining("node outside lane: n3"));

    const intoBand = validateHarnessDiagram(
      fixture({ nodes: [...fixture().nodes, node({ id: "n4", y: 460 })] }),
    );
    expect(intoBand).toContainEqual(expect.stringContaining("node overlaps band: n4"));
  });

  it("rejects text that does not fit its node", () => {
    const tall = validateHarnessDiagram(
      fixture({ nodes: [...fixture().nodes, node({ id: "n5", y: 320, detail: ["a", "b", "c", "d"] })] }),
    );
    expect(tall).toContainEqual(expect.stringContaining("text taller than node"));

    const wide = validateHarnessDiagram(
      fixture({
        nodes: [...fixture().nodes, node({ id: "n6", y: 320, label: ["x".repeat(60)] })],
      }),
    );
    expect(wide).toContainEqual(expect.stringContaining("text wider than node: n6"));
  });

  it("requires labels on branches, exactly one loop, and twelve steps", () => {
    const diagram = fixture();
    expect(
      validateHarnessDiagram({
        ...diagram,
        edges: [...diagram.edges, { from: "n1", to: "n2", kind: "branch" }],
      }),
    ).toContainEqual(expect.stringContaining("branch without label"));
    expect(
      validateHarnessDiagram({ ...diagram, edges: [{ from: "n1", to: "n2", kind: "flow" }] }),
    ).toContainEqual(expect.stringContaining("exactly one loop edge"));
    expect(validateHarnessDiagram({ ...diagram, steps: ["only one"] })).toContainEqual(
      expect.stringContaining("12 steps"),
    );
  });

  it("requires the knowledge band to carry every harness count", () => {
    const diagram = fixture();
    const errors = validateHarnessDiagram({
      ...diagram,
      nodes: diagram.nodes.filter((entry) => entry.title !== knowledgeTitles.skills),
    });
    expect(errors).toContainEqual(expect.stringContaining(`skills ${harnessCounts.skills}`));
  });
});

describe("textHeight", () => {
  it("adds the title, label, and detail rows", () => {
    expect(textHeight({ label: [], detail: [] })).toBe(26);
    expect(textHeight({ label: ["a"], detail: ["b"] })).toBe(64);
    expect(textHeight({ label: ["a", "b"], detail: ["c", "d", "e"] })).toBe(26 + 35 + 50);
  });
});
```

- [ ] **Step 3: 테스트가 실패하는지 확인**

Run: `corepack pnpm vitest run src/content/harness.test.ts`
Expected: FAIL — `Failed to resolve import "./harness"`.

- [ ] **Step 4: 타입, 상수, 검증기 구현**

`src/content/harness.ts`:

```ts
export type HarnessNodeKind =
  | "source"
  | "store"
  | "stage"
  | "agent"
  | "gate"
  | "human"
  | "knowledge";
export type HarnessEdgeKind = "flow" | "branch" | "loop";

export type HarnessLane = {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  width: number;
};

export type HarnessNode = {
  id: string;
  /** lane id, 또는 지식 띠 노드는 "band" */
  lane: string;
  kind: HarnessNodeKind;
  title: string;
  /** mono 라벨 줄. 줄바꿈은 데이터에서 미리 나눈다. */
  label: readonly string[];
  /** 설명 줄 */
  detail: readonly string[];
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HarnessEdge = {
  from: string;
  to: string;
  kind: HarnessEdgeKind;
  label?: string;
  /** "M x y L x y ..." 형식의 명시 경로. 없으면 routeEdge가 자동 생성한다. */
  path?: string;
  /** 라벨 중심 좌표. 없으면 경로 중간점. */
  labelPosition?: { x: number; y: number };
};

export type HarnessLegendItem = {
  kind: "gate" | "agent" | "human" | "branch";
  label: string;
};

export type HarnessDiagram = {
  id: string;
  title: string;
  description: string;
  viewBox: { width: number; height: number };
  lanes: readonly HarnessLane[];
  band: { title: string; y: number; height: number };
  nodes: readonly HarnessNode[];
  edges: readonly HarnessEdge[];
  legend: readonly HarnessLegendItem[];
  footnote: string;
  steps: readonly string[];
};

/** 2026-09-03 Touchpoint 저장소 실측. 수치의 단일 출처. */
export const harnessCounts = {
  hooks: 16,
  rules: 12,
  skills: 20,
  agents: 8,
  wikiPages: 57,
  astGrepRules: 9,
} as const;

export const knowledgeTitles = {
  rules: `rules ${harnessCounts.rules}`,
  skills: `skills ${harnessCounts.skills}`,
  agents: `agents ${harnessCounts.agents}`,
  wiki: `wiki ${harnessCounts.wikiPages}p`,
  ast: `ast-grep ${harnessCounts.astGrepRules}`,
} as const;

/** viewBox 단위 글자 크기와 행 간격. 렌더러와 검증기가 함께 쓴다. */
export const harnessText = {
  titleSize: 20,
  labelSize: 12.5,
  detailSize: 13,
  titleBaseline: 26,
  labelFirst: 20,
  labelStep: 15,
  detailFirst: 18,
  detailStep: 16,
  paddingX: 16,
  bottomGap: 6,
} as const;

const WIDE_GLYPH =
  /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u3000-\u303F\u2190-\u21FF\uFF00-\uFFEF]/;

export function estimateTextWidth(text: string, size: number, mono = false): number {
  let width = 0;
  for (const char of text) {
    width += WIDE_GLYPH.test(char) ? size * 0.95 : size * (mono ? 0.6 : 0.55);
  }
  return width;
}

export function textHeight(node: Pick<HarnessNode, "label" | "detail">): number {
  const text = harnessText;
  let height: number = text.titleBaseline;
  if (node.label.length > 0) height += text.labelFirst + text.labelStep * (node.label.length - 1);
  if (node.detail.length > 0) {
    height += text.detailFirst + text.detailStep * (node.detail.length - 1);
  }
  return height;
}

export function validateHarnessDiagram(diagram: HarnessDiagram): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const lanes = new Map(diagram.lanes.map((lane) => [lane.id, lane]));
  const bandTop = diagram.band.y;
  const bandBottom = diagram.band.y + diagram.band.height;

  for (const node of diagram.nodes) {
    if (ids.has(node.id)) errors.push(`duplicate node id: ${node.id}`);
    ids.add(node.id);

    const right = node.x + node.width;
    const bottom = node.y + node.height;
    if (node.x < 0 || node.y < 0 || right > diagram.viewBox.width || bottom > diagram.viewBox.height) {
      errors.push(`node outside viewBox: ${node.id}`);
    }
    if (node.lane === "band") {
      if (node.kind !== "knowledge") errors.push(`band node must be knowledge: ${node.id}`);
      if (node.y < bandTop || bottom > bandBottom) errors.push(`node outside band: ${node.id}`);
    } else {
      const lane = lanes.get(node.lane);
      if (!lane) errors.push(`unknown lane ${node.lane}: ${node.id}`);
      else if (node.x < lane.x || right > lane.x + lane.width) {
        errors.push(`node outside lane: ${node.id}`);
      }
      if (bottom > bandTop) errors.push(`node overlaps band: ${node.id}`);
    }

    const required = textHeight(node) + harnessText.bottomGap;
    if (required > node.height) {
      errors.push(`text taller than node (${required} > ${node.height}): ${node.id}`);
    }
    const available = node.width - 2 * harnessText.paddingX;
    const rows: [string, number, boolean][] = [
      [node.title, harnessText.titleSize, false],
      ...node.label.map((line): [string, number, boolean] => [line, harnessText.labelSize, true]),
      ...node.detail.map((line): [string, number, boolean] => [line, harnessText.detailSize, false]),
    ];
    for (const [text, size, mono] of rows) {
      if (estimateTextWidth(text, size, mono) > available) {
        errors.push(`text wider than node: ${node.id} "${text}"`);
      }
    }
  }

  let loops = 0;
  for (const edge of diagram.edges) {
    if (!ids.has(edge.from)) errors.push(`edge from unknown node: ${edge.from}`);
    if (!ids.has(edge.to)) errors.push(`edge to unknown node: ${edge.to}`);
    if (edge.kind === "loop") loops += 1;
    if (edge.kind === "branch" && !edge.label) {
      errors.push(`branch without label: ${edge.from} -> ${edge.to}`);
    }
  }
  if (loops !== 1) errors.push(`expected exactly one loop edge, found ${loops}`);
  if (diagram.steps.length !== 12) errors.push(`expected 12 steps, found ${diagram.steps.length}`);

  const knowledge = diagram.nodes.filter((node) => node.kind === "knowledge");
  for (const title of Object.values(knowledgeTitles)) {
    if (!knowledge.some((node) => node.title === title)) {
      errors.push(`knowledge band missing "${title}"`);
    }
  }
  return errors;
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `corepack pnpm vitest run src/content/harness.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: lint와 커밋**

```bash
corepack pnpm lint
git add src/content/harness.ts src/content/harness.test.ts
git commit -m "feat: add harness diagram types and validator

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---
### Task 2: Touchpoint 하네스 데이터

**Files:**
- Modify: `src/content/harness.ts` (파일 끝에 `touchpointHarness` 추가)
- Test: `src/content/harness.test.ts` (describe 블록 추가)
- Modify: `docs/superpowers/specs/2026-09-04-touchpoint-ai-harness-design.md` (5.3 k-constitution 행, 5.5 범례 위치 — 아래 Step 5)

**Interfaces:**
- Consumes: Task 1의 타입, `harnessCounts`, `knowledgeTitles`, `validateHarnessDiagram`.
- Produces: `export const touchpointHarness: HarnessDiagram` (id `"touchpoint-harness"`, viewBox 1600×1000, 레인 5개, 노드 27개, 엣지 23개, 단계 12개). Task 3·5·6이 소비한다.

- [ ] **Step 1: 실패 테스트 추가**

`src/content/harness.test.ts`의 import를 아래로 바꾸고, 파일 끝에 describe 블록을 추가한다.

```ts
import {
  harnessCounts,
  knowledgeTitles,
  textHeight,
  touchpointHarness,
  validateHarnessDiagram,
  type HarnessDiagram,
  type HarnessNode,
} from "./harness";
```

```ts
describe("touchpointHarness", () => {
  it("passes validation", () => {
    expect(validateHarnessDiagram(touchpointHarness)).toEqual([]);
  });

  it("has five lanes, one loop, and twelve screen-reader steps", () => {
    expect(touchpointHarness.lanes.map(({ title }) => title)).toEqual([
      "INTAKE",
      "HERMES",
      "CLAUDE CODE",
      "HUMAN",
      "SHIP & OPERATE",
    ]);
    expect(touchpointHarness.edges.filter(({ kind }) => kind === "loop")).toHaveLength(1);
    expect(touchpointHarness.steps).toHaveLength(12);
  });

  it("names the real hooks, gates, and agents", () => {
    const byId = new Map(touchpointHarness.nodes.map((node) => [node.id, node]));
    expect(byId.get("merge-gate")).toMatchObject({ kind: "gate", label: ["pre-merge-gate.sh"] });
    expect(byId.get("claim")).toMatchObject({ kind: "gate", label: ["pre-worktree-linear-claim.sh"] });
    expect(byId.get("gate-ready")).toMatchObject({ kind: "gate" });
    expect(byId.get("hermes")).toMatchObject({ kind: "agent", title: "Hermes" });
    expect(byId.get("admin-eval")).toMatchObject({ kind: "human", label: ["/admin/eval", "admin-eval-review"] });
    expect(touchpointHarness.nodes.filter(({ kind }) => kind === "gate")).toHaveLength(3);
  });

  it("carries every harness count in the knowledge band and the Codex footnote", () => {
    const titles = touchpointHarness.nodes
      .filter(({ kind }) => kind === "knowledge")
      .map(({ title }) => title);
    expect(titles).toEqual(expect.arrayContaining(Object.values(knowledgeTitles)));
    expect(titles).toHaveLength(7);
    expect(touchpointHarness.footnote).toContain(".codex/");
    expect(byIdDetail("build")).toContain(`편집마다 훅 + ast-grep 규칙 ${harnessCounts.astGrepRules}`);
  });

  it("closes the loop from error triage back to Linear intake", () => {
    const loop = touchpointHarness.edges.find(({ kind }) => kind === "loop");
    expect(loop).toMatchObject({ from: "triage", to: "source-triage", label: "prod 에러 → Linear" });
  });
});

function byIdDetail(id: string): readonly string[] {
  return touchpointHarness.nodes.find((node) => node.id === id)?.detail ?? [];
}
```

- [ ] **Step 2: 실패 확인**

Run: `corepack pnpm vitest run src/content/harness.test.ts`
Expected: FAIL — `touchpointHarness` is not exported (또는 undefined).

- [ ] **Step 3: 데이터 작성**

`src/content/harness.ts` 끝에 추가한다. 좌표는 스펙 5.1의 레인 구간 안에 있고, 텍스트 줄바꿈은 검증기의 폭·높이 계산을 통과하도록 미리 나눠 두었다.

```ts
const lanes = {
  intake: { id: "l-intake", title: "INTAKE", subtitle: "Linear", x: 0, width: 270 },
  hermes: {
    id: "l-hermes",
    title: "HERMES",
    subtitle: "PM 리뷰 · 상시 에이전트 · 서버",
    x: 270,
    width: 290,
  },
  claude: { id: "l-claude", title: "CLAUDE CODE", subtitle: "구현 · 세션 = worktree", x: 560, width: 420 },
  human: { id: "l-human", title: "HUMAN", subtitle: "사람 검수", x: 980, width: 260 },
  ship: { id: "l-ship", title: "SHIP & OPERATE", subtitle: "배포 · 운영", x: 1240, width: 360 },
} as const satisfies Record<string, HarnessLane>;

/** 레인별 노드 x·폭을 고정하는 팩토리. 노드 데이터에는 id·kind·텍스트·y·height만 적는다. */
const placeIn =
  (lane: HarnessLane, x: number, width: number) =>
  (node: Omit<HarnessNode, "lane" | "x" | "width">): HarnessNode => ({
    ...node,
    lane: lane.id,
    x,
    width,
  });
const intake = placeIn(lanes.intake, 20, 220);
const hermes = placeIn(lanes.hermes, 308, 232);
const claude = placeIn(lanes.claude, 580, 380);
const human = placeIn(lanes.human, 1000, 220);
const ship = placeIn(lanes.ship, 1270, 300);
const knowledge = (
  index: number,
  node: Omit<HarnessNode, "lane" | "kind" | "x" | "y" | "width" | "height">,
): HarnessNode => ({
  ...node,
  lane: "band",
  kind: "knowledge",
  x: 34 + index * 220,
  y: 870,
  width: 212,
  height: 104,
});

export const touchpointHarness: HarnessDiagram = {
  id: "touchpoint-harness",
  title: "Touchpoint AI 하네스 시스템 구조",
  description:
    "Linear 이슈가 Hermes 리뷰, Claude Code 구현, 사람 검수, 배포를 지나 프로덕션 에러로 다시 Linear에 돌아오는 순환 구조",
  viewBox: { width: 1600, height: 1000 },
  lanes: [lanes.intake, lanes.hermes, lanes.claude, lanes.human, lanes.ship],
  band: { title: "KNOWLEDGE LAYER · 모든 세션이 읽는 공통 계층", y: 840, height: 160 },
  nodes: [
    intake({
      id: "linear",
      kind: "store",
      title: "Linear · TOU 이슈",
      label: ["TOU-1 … TOU-264"],
      detail: ["단일 백로그", "상태 = 개발 수명주기"],
      y: 90,
      height: 110,
    }),
    intake({
      id: "source-human",
      kind: "source",
      title: "사람 요청",
      label: ["docky"],
      detail: ["제품 결정 · 기능 요청"],
      y: 250,
      height: 80,
    }),
    intake({
      id: "source-handoff",
      kind: "source",
      title: "세션 핸드오프",
      label: ["후속 작업 이슈"],
      detail: ["다음 세션에 넘길 일"],
      y: 350,
      height: 80,
    }),
    intake({
      id: "source-triage",
      kind: "source",
      title: "에러 자동 이슈",
      label: ["error-triage cron"],
      detail: ["prod 에러 → 이슈", "루프 도착점"],
      y: 450,
      height: 92,
    }),
    hermes({
      id: "hermes",
      kind: "agent",
      title: "Hermes",
      label: ["Linear 상시 감시"],
      detail: ["PM · 도메인 리뷰", "코멘트 · 라벨"],
      y: 95,
      height: 100,
    }),
    hermes({
      id: "label-flow",
      kind: "stage",
      title: "라벨 흐름",
      label: ["hermes:needs-review", "→ reviewed", "→ ready-for-dev"],
      detail: ["분기: needs-ceo · blocked"],
      y: 250,
      height: 110,
    }),
    hermes({
      id: "gate-ready",
      kind: "gate",
      title: "착수 게이트",
      label: ["hermes:ready-for-dev"],
      detail: ["아니면 구현 착수 불가"],
      y: 420,
      height: 80,
    }),
    claude({
      id: "session-start",
      kind: "stage",
      title: "세션 시작",
      label: ["session-start-wiki-query.sh", "session-start-worktree-check.sh"],
      detail: ["위키 색인 주입"],
      y: 66,
      height: 88,
    }),
    claude({
      id: "claim",
      kind: "gate",
      title: "Claim 게이트",
      label: ["pre-worktree-linear-claim.sh"],
      detail: ["In Progress + hermes:delegated", "아니면 worktree 차단"],
      y: 166,
      height: 88,
    }),
    claude({
      id: "plan",
      kind: "stage",
      title: "계획",
      label: ["/dev-checklist start · touchpoint-graph"],
      detail: ["Linear AC down-sync (AC-001…)", "graphify 코드 그래프"],
      y: 266,
      height: 88,
    }),
    claude({
      id: "build",
      kind: "stage",
      title: "구현 (TDD)",
      label: [
        "protect-files · enforce-worktree",
        "checklist-nudge → post-edit-lint-fix",
        "console-warn · db-review",
      ],
      detail: [`편집마다 훅 + ast-grep 규칙 ${harnessCounts.astGrepRules}`],
      y: 366,
      height: 102,
    }),
    claude({
      id: "review-agents",
      kind: "agent",
      title: "검수 에이전트",
      label: ["review-inspector · quality-evaluator", "database-reviewer · security-auditor"],
      detail: ["AC 대조 · 4기준 채점", "마이그레이션 · 보호 영역"],
      y: 480,
      height: 104,
    }),
    claude({
      id: "merge-gate",
      kind: "gate",
      title: "머지 게이트",
      label: ["pre-merge-gate.sh"],
      detail: [
        "checklist PASSED · db-review PASS",
        "quality-eval PASS · wiki ingest",
        "head SHA 결합 · 미충족 시 gh pr merge 거부",
      ],
      y: 596,
      height: 104,
    }),
    claude({
      id: "stop",
      kind: "stage",
      title: "세션 종료",
      label: ["stop-validate.sh", "stop-post-merge-cleanup.sh"],
      detail: ["tsc · vitest · build 3회 재시도 · worktree 정리"],
      y: 712,
      height: 88,
    }),
    human({
      id: "done",
      kind: "store",
      title: "Linear Done",
      label: ["auto-Done"],
      detail: ["비시각 변경은 자동", "시각 변경은 approved 후"],
      y: 90,
      height: 92,
    }),
    human({
      id: "admin-eval",
      kind: "human",
      title: "admin 검수함",
      label: ["/admin/eval", "admin-eval-review"],
      detail: ["시각 UI/UX · 제품 판단만", "사람이 approved"],
      y: 300,
      height: 106,
    }),
    ship({
      id: "triage",
      kind: "stage",
      title: "error-triage cron",
      label: ["fingerprint", "fatal 1회 / error 3회", "최대 10건"],
      detail: ["Linear 이슈 자동 생성"],
      y: 90,
      height: 106,
    }),
    ship({
      id: "prod",
      kind: "store",
      title: "프로덕션",
      label: ["error_logs · cron 15"],
      detail: ["touchpoint.bio"],
      y: 380,
      height: 80,
    }),
    ship({
      id: "vercel",
      kind: "stage",
      title: "Vercel",
      label: ["develop = staging", "main = prod"],
      detail: ["promote는 CEO만"],
      y: 520,
      height: 90,
    }),
    ship({
      id: "ci",
      kind: "stage",
      title: "GitHub Actions",
      label: ["ci · bug-test-gate · smoke-test", "release · wiki-lint"],
      detail: ["fix PR 회귀 테스트 강제", "CalVer 릴리스"],
      y: 694,
      height: 106,
    }),
    knowledge(0, {
      id: "k-constitution",
      title: "CLAUDE.md",
      label: ["AGENTS.md · 프로젝트 헌법"],
      detail: ["규칙 우선순위 · 보호 영역"],
    }),
    knowledge(1, {
      id: "k-rules",
      title: knowledgeTitles.rules,
      label: [".claude/rules"],
      detail: ["git · testing · security", "wiki-protocol …"],
    }),
    knowledge(2, {
      id: "k-skills",
      title: knowledgeTitles.skills,
      label: [".claude/skills"],
      detail: ["dev-checklist", "linear-hermes-workflow", "prd-interview …"],
    }),
    knowledge(3, {
      id: "k-agents",
      title: knowledgeTitles.agents,
      label: [".claude/agents"],
      detail: ["planner", "review-inspector", "quality-evaluator …"],
    }),
    knowledge(4, {
      id: "k-wiki",
      title: knowledgeTitles.wiki,
      label: ["docs/wiki"],
      detail: ["Query(세션 시작)", "Ingest(머지 게이트)", "Lint(주 1회)"],
    }),
    knowledge(5, {
      id: "k-graph",
      title: "graphify",
      label: ["graphify-out"],
      detail: ["코드 지식 그래프", "Glob/Grep 전에 주입"],
    }),
    knowledge(6, {
      id: "k-ast",
      title: knowledgeTitles.ast,
      label: [".ast-grep/rules"],
      detail: ["디자인 시스템", "RSC 경계 강제"],
    }),
  ],
  edges: [
    // 입력원 → Linear: INTAKE 레인 왼쪽 여백(x 10)의 세로 트렁크로 모은다
    { from: "source-human", to: "linear", kind: "flow", path: "M20 290 L10 290 L10 180 L20 180" },
    { from: "source-handoff", to: "linear", kind: "flow", path: "M20 390 L10 390 L10 180 L20 180" },
    { from: "source-triage", to: "linear", kind: "flow", path: "M20 496 L10 496 L10 180 L20 180" },
    { from: "linear", to: "hermes", kind: "flow" },
    { from: "hermes", to: "label-flow", kind: "flow" },
    { from: "label-flow", to: "gate-ready", kind: "flow" },
    {
      from: "label-flow",
      to: "source-human",
      kind: "branch",
      label: "needs-ceo",
      path: "M308 340 L274 340 L274 290 L240 290",
      labelPosition: { x: 274, y: 318 },
    },
    { from: "gate-ready", to: "claim", kind: "flow" },
    { from: "session-start", to: "claim", kind: "flow" },
    { from: "claim", to: "plan", kind: "flow" },
    { from: "plan", to: "build", kind: "flow" },
    { from: "build", to: "review-agents", kind: "flow" },
    { from: "review-agents", to: "merge-gate", kind: "flow" },
    { from: "merge-gate", to: "stop", kind: "flow" },
    // 머지 게이트의 두 분기는 HUMAN 레인 오른쪽 여백(x 1232)의 트렁크를 공유한다
    {
      from: "merge-gate",
      to: "admin-eval",
      kind: "branch",
      label: "시각 UI/UX",
      path: "M960 640 L1232 640 L1232 353 L1220 353",
      labelPosition: { x: 1232, y: 500 },
    },
    {
      from: "merge-gate",
      to: "done",
      kind: "branch",
      label: "비시각 · auto-Done",
      path: "M960 640 L1232 640 L1232 136 L1220 136",
      labelPosition: { x: 1232, y: 246 },
    },
    { from: "admin-eval", to: "done", kind: "flow", label: "approved" },
    {
      from: "admin-eval",
      to: "build",
      kind: "branch",
      label: "changes_requested",
      path: "M1050 406 L1050 440 L972 440 L972 417 L960 417",
      labelPosition: { x: 1110, y: 458 },
    },
    { from: "merge-gate", to: "ci", kind: "flow", path: "M960 690 L1250 690 L1250 747 L1270 747" },
    { from: "ci", to: "vercel", kind: "flow" },
    { from: "vercel", to: "prod", kind: "flow" },
    { from: "prod", to: "triage", kind: "flow" },
    // 루프: SHIP 레인 오른쪽 여백을 내려가 y 820 통로를 따라 왼쪽으로 달린 뒤 에러 자동 이슈 아래로 들어간다
    {
      from: "triage",
      to: "source-triage",
      kind: "loop",
      label: "prod 에러 → Linear",
      path: "M1570 143 L1588 143 L1588 820 L130 820 L130 542",
      labelPosition: { x: 800, y: 820 },
    },
  ],
  legend: [
    { kind: "gate", label: "하드 차단 게이트" },
    { kind: "agent", label: "에이전트" },
    { kind: "human", label: "사람" },
    { kind: "branch", label: "조건 분기" },
  ],
  footnote: "동일 하네스를 .codex/ 에 미러해 Codex CLI도 같은 규칙으로 동작합니다.",
  steps: [
    "사람 요청, 에러 자동 이슈, 세션 핸드오프가 Linear 이슈로 모입니다.",
    "Hermes가 Linear를 상시 감시하며 PM과 도메인 리뷰를 하고 hermes 라벨을 붙입니다.",
    "ready-for-dev 라벨이 없는 이슈는 구현을 시작할 수 없습니다.",
    "Claude Code 세션이 시작되면 위키 색인이 주입되고 worktree 상태를 확인합니다.",
    "Linear에서 claim되지 않은 이슈는 worktree 생성이 차단됩니다.",
    "착수 시점에 Linear 수락 기준을 체크리스트로 내려받고 코드 그래프를 읽습니다.",
    "구현 중 편집마다 보호 영역 차단, lint 자동 수정, 콘솔 로그와 DB 마이그레이션 경고가 붙습니다.",
    "review-inspector, quality-evaluator, database-reviewer, security-auditor가 검수합니다.",
    "머지 시점에 pre-merge-gate가 체크리스트, DB 검수, 품질 평가, 위키 갱신을 커밋 SHA와 결합해 하드 차단합니다.",
    "시각 UI/UX 변경만 admin 검수함에서 사람이 승인하고, 나머지는 자동으로 Done 처리됩니다.",
    "GitHub Actions와 Vercel을 거쳐 배포되고, 프로덕션 에러는 error-triage cron이 매일 수집합니다.",
    "임계를 넘은 에러는 Linear 이슈로 자동 생성되어 다시 첫 단계로 돌아갑니다.",
  ],
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `corepack pnpm vitest run src/content/harness.test.ts`
Expected: PASS (13 tests). `passes validation`이 실패하면 오류 메시지가 어떤 노드의 어떤 줄이 넘치는지 알려준다. 그 줄을 두 줄로 나누거나 노드 `height`를 키워 고친다. 레인 x 구간과 viewBox는 바꾸지 않는다.

- [ ] **Step 5: 스펙의 두 곳을 데이터에 맞춘다**

k-constitution은 제목이 200px 노드에 맞지 않아 제목/라벨을 나눴고, 범례는 헤더 띠에 SHIP 레인 제목과 겹쳐 지식 띠 제목 행 오른쪽으로 옮겼다. 스펙을 정본으로 유지하기 위해 반영한다.

```bash
python3 - <<'PY'
p = "docs/superpowers/specs/2026-09-04-touchpoint-ai-harness-design.md"
s = open(p, encoding="utf-8").read()
old_row = "| `k-constitution` | CLAUDE.md · AGENTS.md | `프로젝트 헌법` | 규칙 우선순위 · 보호 영역 |"
new_row = "| `k-constitution` | CLAUDE.md | `AGENTS.md · 프로젝트 헌법` | 규칙 우선순위 · 보호 영역 |"
old_legend = "다이어그램 우상단 헤더 띠 안에 네 항목:"
new_legend = "지식 띠 제목 행의 오른쪽 끝(헤더 띠는 SHIP 레인 제목과 겹쳐 쓰지 않는다)에 네 항목:"
assert old_row in s and old_legend in s
s = s.replace(old_row, new_row).replace(old_legend, new_legend)
open(p, "w", encoding="utf-8").write(s)
print("spec updated")
PY
```

- [ ] **Step 6: lint와 커밋**

```bash
corepack pnpm lint
git add src/content/harness.ts src/content/harness.test.ts docs/superpowers/specs/2026-09-04-touchpoint-ai-harness-design.md
git commit -m "feat: add the Touchpoint harness diagram data

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---
### Task 3: `HarnessDiagram` 서버 컴포넌트와 SVG 스타일

**Files:**
- Create: `src/components/work/harness-diagram.tsx`
- Test: `src/components/work/harness-diagram.test.tsx`
- Modify: `src/app/globals.css` (파일 끝에 `.harness-*` 블록 추가)

**Interfaces:**
- Consumes: `harnessText`, `estimateTextWidth`, `touchpointHarness`, 타입 `HarnessDiagram`, `HarnessEdge`, `HarnessNode`, `HarnessLegendItem` (Task 1·2).
- Produces: `HarnessDiagram({ diagram, variant: "inline" | "full" })` 서버 컴포넌트, 순수 함수 `routeEdge(from, to): string`, `parsePath(path): Point[]`, `pathMidpoint(path): Point`. 모든 SVG id는 `${diagram.id}-${variant}-` 접두어를 갖는다. 루트 `<svg>`는 `role="img"`, `aria-labelledby`, `aria-describedby`, 클래스 `harness-diagram harness-diagram-{variant}`.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/work/harness-diagram.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { touchpointHarness, type HarnessNode } from "@/content/harness";
import { HarnessDiagram, parsePath, pathMidpoint, routeEdge } from "./harness-diagram";

const box = (id: string, x: number, y: number): HarnessNode => ({
  id,
  lane: "l",
  kind: "stage",
  title: id,
  label: [],
  detail: [],
  x,
  y,
  width: 100,
  height: 50,
});

describe("routeEdge", () => {
  it("draws a straight vertical line between stacked nodes in either direction", () => {
    expect(routeEdge(box("a", 0, 0), box("b", 0, 100))).toBe("M50 50 L50 100");
    expect(routeEdge(box("a", 0, 100), box("b", 0, 0))).toBe("M50 100 L50 50");
  });

  it("draws a straight horizontal line between aligned nodes", () => {
    expect(routeEdge(box("a", 0, 0), box("b", 200, 0))).toBe("M100 25 L200 25");
  });

  it("bends at the midpoint between offset nodes", () => {
    expect(routeEdge(box("a", 0, 0), box("b", 200, 100))).toBe("M100 25 L150 25 L150 125 L200 125");
    expect(routeEdge(box("a", 200, 100), box("b", 0, 0))).toBe("M200 125 L150 125 L150 25 L100 25");
  });
});

describe("pathMidpoint", () => {
  it("parses explicit paths and finds the halfway point by length", () => {
    expect(parsePath("M0 0 L100 0 L100 50")).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
    ]);
    expect(pathMidpoint("M0 0 L100 0 L100 50")).toEqual({ x: 75, y: 0 });
    expect(pathMidpoint("M0 0 L0 100")).toEqual({ x: 0, y: 50 });
  });
});

describe("HarnessDiagram", () => {
  it("renders an accessible image carrying the real hook names", () => {
    render(<HarnessDiagram diagram={touchpointHarness} variant="inline" />);
    const image = screen.getByRole("img", { name: touchpointHarness.title });
    expect(image).toHaveClass("harness-diagram-inline");
    expect(screen.getByText("pre-merge-gate.sh")).toBeInTheDocument();
    expect(screen.getByText("Hermes")).toBeInTheDocument();
    expect(screen.getByText("prod 에러 → Linear")).toBeInTheDocument();
    expect(screen.getByText("needs-ceo")).toBeInTheDocument();
  });

  it("marks three hard gates, one loop, the legend, and the Codex footnote", () => {
    const { container } = render(<HarnessDiagram diagram={touchpointHarness} variant="inline" />);
    expect(container.querySelectorAll(".harness-node-gate")).toHaveLength(3);
    expect(container.querySelectorAll(".harness-gate-marker").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll(".harness-edge-loop")).toHaveLength(1);
    expect(container.querySelector(".harness-legend")).toHaveTextContent("하드 차단 게이트");
    expect(container.querySelector(".harness-footnote")).toHaveTextContent(".codex/");
  });

  it("prefixes every id per variant so two copies can share one page", () => {
    const { container } = render(
      <>
        <HarnessDiagram diagram={touchpointHarness} variant="inline" />
        <HarnessDiagram diagram={touchpointHarness} variant="full" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("touchpoint-harness-inline-arrow-flow");
    expect(ids).toContain("touchpoint-harness-full-arrow-flow");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `corepack pnpm vitest run src/components/work/harness-diagram.test.tsx`
Expected: FAIL — `Failed to resolve import "./harness-diagram"`.

- [ ] **Step 3: 컴포넌트 구현**

`src/components/work/harness-diagram.tsx` (서버 컴포넌트, `"use client"` 없음):

```tsx
import type { ReactNode } from "react";

import {
  estimateTextWidth,
  harnessText,
  type HarnessDiagram as HarnessDiagramData,
  type HarnessEdge,
  type HarnessLegendItem,
  type HarnessNode,
} from "@/content/harness";

export type Point = { x: number; y: number };

const HEADER_HEIGHT = 56;
const EDGE_LABEL_SIZE = 11;
const EDGE_LABEL_PADDING = 8;

export function parsePath(path: string): Point[] {
  return path
    .trim()
    .split(/[ML]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const [x, y] = segment.split(/[\s,]+/).map(Number);
      return { x, y };
    });
}

function center(node: HarnessNode): Point {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

/** 같은 열이면 수직 직선, 같은 행이면 수평 직선, 그 외에는 두 변의 x 중간에서 꺾는 직교 경로 */
export function routeEdge(from: HarnessNode, to: HarnessNode): string {
  const a = center(from);
  const b = center(to);
  if (Math.abs(a.x - b.x) < 1) {
    return b.y > a.y
      ? `M${a.x} ${from.y + from.height} L${b.x} ${to.y}`
      : `M${a.x} ${from.y} L${b.x} ${to.y + to.height}`;
  }
  const rightward = b.x > a.x;
  const start = { x: rightward ? from.x + from.width : from.x, y: a.y };
  const end = { x: rightward ? to.x : to.x + to.width, y: b.y };
  if (Math.abs(start.y - end.y) < 1) return `M${start.x} ${start.y} L${end.x} ${end.y}`;
  const mid = (start.x + end.x) / 2;
  return `M${start.x} ${start.y} L${mid} ${start.y} L${mid} ${end.y} L${end.x} ${end.y}`;
}

export function pathMidpoint(path: string): Point {
  const points = parsePath(path);
  if (points.length === 0) return { x: 0, y: 0 };
  const lengths = points
    .slice(1)
    .map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index]) {
      const t = lengths[index] === 0 ? 0 : remaining / lengths[index];
      const from = points[index];
      const to = points[index + 1];
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    }
    remaining -= lengths[index];
  }
  return points[points.length - 1];
}

function renderEdge(edge: HarnessEdge, nodes: Map<string, HarnessNode>, prefix: string): ReactNode {
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  if (!from || !to) return null;
  const d = edge.path ?? routeEdge(from, to);
  const labelAt = edge.label ? (edge.labelPosition ?? pathMidpoint(d)) : null;
  const labelWidth = edge.label
    ? estimateTextWidth(edge.label, EDGE_LABEL_SIZE, true) + EDGE_LABEL_PADDING
    : 0;
  return (
    <g key={`${edge.from}-${edge.to}`} className={`harness-edge-group harness-edge-group-${edge.kind}`}>
      <path
        d={d}
        className={`harness-edge harness-edge-${edge.kind}`}
        markerEnd={`url(#${prefix}-arrow-${edge.kind})`}
      />
      {edge.label && labelAt ? (
        <g className="harness-edge-label">
          <rect
            x={labelAt.x - labelWidth / 2}
            y={labelAt.y - 9}
            width={labelWidth}
            height={18}
            rx={2}
            className="harness-edge-label-bg"
          />
          <text x={labelAt.x} y={labelAt.y + 4} textAnchor="middle">
            {edge.label}
          </text>
        </g>
      ) : null}
    </g>
  );
}

function renderNode(node: HarnessNode): ReactNode {
  const text = harnessText;
  const left = node.x + text.paddingX;
  let y = node.y + text.titleBaseline;
  const rows: ReactNode[] = [
    <text key="title" x={left} y={y} className="harness-node-title">
      {node.title}
    </text>,
  ];
  node.label.forEach((line, index) => {
    y += index === 0 ? text.labelFirst : text.labelStep;
    rows.push(
      <text key={`label-${index}`} x={left} y={y} className="harness-node-label">
        {line}
      </text>,
    );
  });
  node.detail.forEach((line, index) => {
    y += index === 0 ? text.detailFirst : text.detailStep;
    rows.push(
      <text key={`detail-${index}`} x={left} y={y} className="harness-node-detail">
        {line}
      </text>,
    );
  });
  return (
    <g key={node.id} className={`harness-node harness-node-${node.kind}`} data-node={node.id}>
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={node.kind === "agent" ? 14 : 2}
        className="harness-node-box"
      />
      {node.kind === "store" ? (
        <rect
          x={node.x + 4}
          y={node.y + 4}
          width={node.width - 8}
          height={node.height - 8}
          rx={1}
          className="harness-node-box-inner"
        />
      ) : null}
      {node.kind === "gate" ? (
        <rect x={node.x} y={node.y} width={6} height={node.height} className="harness-gate-marker" />
      ) : null}
      {node.kind === "human" ? (
        <g
          className="harness-human-icon"
          transform={`translate(${node.x + node.width - 30} ${node.y + 10})`}
        >
          <circle cx={8} cy={6} r={5} />
          <path d="M0 20 C0 13 16 13 16 20" />
        </g>
      ) : null}
      {rows}
    </g>
  );
}

function renderSwatch(kind: HarnessLegendItem["kind"], x: number, y: number): ReactNode {
  switch (kind) {
    case "gate":
      return (
        <g key={`${kind}-swatch`}>
          <rect x={x} y={y} width={16} height={12} rx={2} className="harness-node-box" />
          <rect x={x} y={y} width={4} height={12} className="harness-gate-marker" />
        </g>
      );
    case "agent":
      return <rect key={`${kind}-swatch`} x={x} y={y} width={16} height={12} rx={5} className="harness-node-box" />;
    case "human":
      return (
        <g key={`${kind}-swatch`} className="harness-human-icon">
          <circle cx={x + 8} cy={y + 3} r={3} />
          <path d={`M${x + 2} ${y + 12} C${x + 2} ${y + 7} ${x + 14} ${y + 7} ${x + 14} ${y + 12}`} />
        </g>
      );
    case "branch":
      return (
        <line
          key={`${kind}-swatch`}
          x1={x}
          y1={y + 6}
          x2={x + 16}
          y2={y + 6}
          className="harness-edge harness-edge-branch"
        />
      );
  }
}

/** 지식 띠 제목 행 오른쪽 끝에서 왼쪽으로 채운다 */
function renderLegend(diagram: HarnessDiagramData): ReactNode[] {
  const y = diagram.band.y + 22;
  let x = diagram.viewBox.width - 34;
  const rendered: ReactNode[] = [];
  for (let index = diagram.legend.length - 1; index >= 0; index -= 1) {
    const item = diagram.legend[index];
    x -= estimateTextWidth(item.label, EDGE_LABEL_SIZE, true);
    rendered.push(
      <text key={`${item.kind}-text`} x={x} y={y} className="harness-legend-text">
        {item.label}
      </text>,
    );
    x -= 22;
    rendered.push(renderSwatch(item.kind, x, y - 9));
    x -= 18;
  }
  return rendered;
}

type HarnessDiagramProps = {
  diagram: HarnessDiagramData;
  variant: "inline" | "full";
};

export function HarnessDiagram({ diagram, variant }: HarnessDiagramProps) {
  const prefix = `${diagram.id}-${variant}`;
  const titleId = `${prefix}-title`;
  const descriptionId = `${prefix}-desc`;
  const nodes = new Map(diagram.nodes.map((node) => [node.id, node]));
  const { width, height } = diagram.viewBox;

  return (
    <svg
      className={`harness-diagram harness-diagram-${variant}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <title id={titleId}>{diagram.title}</title>
      <desc id={descriptionId}>{diagram.description}</desc>
      <defs>
        {(["flow", "branch", "loop"] as const).map((kind) => (
          <marker
            key={kind}
            id={`${prefix}-arrow-${kind}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 Z" className={`harness-arrow harness-arrow-${kind}`} />
          </marker>
        ))}
      </defs>
      {diagram.lanes.map((lane, index) => (
        <g key={lane.id} className="harness-lane">
          <rect
            x={lane.x}
            y={0}
            width={lane.width}
            height={diagram.band.y}
            className={index % 2 === 0 ? "harness-lane-bg" : "harness-lane-bg-alt"}
          />
          {index > 0 ? (
            <line x1={lane.x} y1={0} x2={lane.x} y2={diagram.band.y} className="harness-lane-rule" />
          ) : null}
          <text x={lane.x + 16} y={24} className="harness-lane-title">
            {lane.title}
          </text>
          <text x={lane.x + 16} y={42} className="harness-lane-subtitle">
            {lane.subtitle}
          </text>
        </g>
      ))}
      <line x1={0} y1={HEADER_HEIGHT} x2={width} y2={HEADER_HEIGHT} className="harness-header-rule" />
      <g className="harness-band">
        <rect
          x={0}
          y={diagram.band.y}
          width={width}
          height={diagram.band.height}
          className="harness-band-bg"
        />
        <text x={34} y={diagram.band.y + 22} className="harness-band-title">
          {diagram.band.title}
        </text>
      </g>
      <g className="harness-edges">{diagram.edges.map((edge) => renderEdge(edge, nodes, prefix))}</g>
      <g className="harness-nodes">{diagram.nodes.map((node) => renderNode(node))}</g>
      <g className="harness-legend">{renderLegend(diagram)}</g>
      <text x={width - 34} y={height - 12} textAnchor="end" className="harness-footnote">
        {diagram.footnote}
      </text>
    </svg>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `corepack pnpm vitest run src/components/work/harness-diagram.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 5: SVG 스타일 추가**

`src/app/globals.css` 파일 끝(`@media (prefers-reduced-motion: reduce)` 블록 뒤)에 추가한다. 색은 토큰만, accent는 게이트 마커와 루프에만.

```css
/* Harness diagram (Touchpoint 시스템 구조) — 인라인 SVG이므로 토큰이 그대로 적용된다 */
.harness-diagram { display: block; font-family: var(--font-korean); }
.harness-lane-bg { fill: var(--paper-raised); }
.harness-lane-bg-alt { fill: var(--paper); }
.harness-lane-title {
  fill: var(--signal-blue);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.harness-lane-subtitle { fill: var(--muted); font-family: var(--font-mono); font-size: 11px; }
.harness-lane-rule { stroke: var(--grid); stroke-width: 1; }
.harness-header-rule { stroke: var(--rule); stroke-width: 1; }
.harness-band-bg { fill: var(--paper-raised); stroke: var(--rule); stroke-width: 1; }
.harness-band-title {
  fill: var(--signal-blue);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.harness-node-box { fill: var(--paper-raised); stroke: var(--ink); stroke-width: 1.5; }
.harness-node-source .harness-node-box { stroke-width: 1; }
.harness-node-box-inner { fill: none; stroke: var(--ink); stroke-width: 1; }
.harness-node-title { fill: var(--ink); font-size: 20px; font-weight: 600; letter-spacing: -0.03em; }
.harness-node-label { fill: var(--signal-blue); font-family: var(--font-mono); font-size: 12.5px; }
.harness-node-detail { fill: var(--muted); font-size: 13px; }
.harness-gate-marker { fill: var(--project-accent, #ff6b5f); }
.harness-human-icon { fill: none; stroke: var(--ink); stroke-width: 1.5; }
.harness-edge { fill: none; stroke: var(--ink); stroke-width: 1.5; }
.harness-edge-branch { stroke: var(--muted); stroke-dasharray: 5 4; }
.harness-edge-loop { stroke: var(--project-accent, #ff6b5f); stroke-width: 2.5; }
.harness-arrow { fill: var(--ink); }
.harness-arrow-branch { fill: var(--muted); }
.harness-arrow-loop { fill: var(--project-accent, #ff6b5f); }
.harness-edge-label-bg { fill: var(--paper); }
.harness-edge-label text { fill: var(--ink); font-family: var(--font-mono); font-size: 11px; }
.harness-legend-text { fill: var(--muted); font-family: var(--font-mono); font-size: 11px; }
.harness-footnote { fill: var(--muted); font-family: var(--font-mono); font-size: 11.5px; }
```

- [ ] **Step 6: lint와 커밋**

```bash
corepack pnpm lint
git add src/components/work/harness-diagram.tsx src/components/work/harness-diagram.test.tsx src/app/globals.css
git commit -m "feat: render the harness diagram as inline SVG

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---
### Task 4: `HarnessViewer` 클라이언트 컴포넌트 (크게 보기, 드래그 이동, 줌)

**Files:**
- Create: `src/components/work/harness-viewer.tsx`
- Test: `src/components/work/harness-viewer.test.tsx`
- Modify: `src/app/globals.css` (파일 끝에 `.work-system-*` 뷰어 블록 추가)

**Interfaces:**
- Consumes: 없음 (다이어그램은 `inline`/`full` prop으로 받는다).
- Produces: `HarnessViewer({ title, inline, full, steps, viewBox })`. 트리거 버튼 접근 가능한 이름 `"{title} 크게 보기"`, `aria-haspopup="dialog"`, `aria-expanded`. `<dialog class="work-system-dialog" aria-label={title}>`, 툴바 버튼 `축소`/`확대`/`맞춤`/`닫기`, 스테이지 `role="application" aria-label="다이어그램 이동 영역" tabIndex=0 data-dragging`, 캔버스 `.work-system-canvas`의 inline style `transform: translate(Xpx, Ypx) scale(S)`.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/work/harness-viewer.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { HarnessViewer } from "./harness-viewer";

const viewBox = { width: 1600, height: 1000 };
const steps = Array.from({ length: 12 }, (_, index) => `단계 ${index + 1}`);
const title = "테스트 다이어그램";

// jsdom에는 dialog.showModal/close와 레이아웃(clientWidth/Height)이 없다. 스테이지만 1200×800으로 둔다.
beforeAll(() => {
  const dialog = HTMLDialogElement.prototype as { showModal?: () => void; close?: () => void };
  if (!dialog.showModal) {
    dialog.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!dialog.close) {
    dialog.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("work-system-stage") ? 1200 : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("work-system-stage") ? 800 : 0;
    },
  });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
});

function renderViewer() {
  return render(
    <HarnessViewer
      title={title}
      inline={<svg role="img" aria-label="inline" />}
      full={<svg role="img" aria-label="full" />}
      steps={steps}
      viewBox={viewBox}
    />,
  );
}

function canvasTransform() {
  const canvas = document.querySelector<HTMLElement>(".work-system-canvas")!;
  const translate = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(canvas.style.transform)!;
  const scale = /scale\(([\d.]+)\)/.exec(canvas.style.transform)!;
  return { x: Number(translate[1]), y: Number(translate[2]), scale: Number(scale[1]) };
}

function openViewer() {
  const trigger = screen.getByRole("button", { name: `${title} 크게 보기` });
  fireEvent.click(trigger);
  return { trigger, stage: screen.getByRole("application", { name: "다이어그램 이동 영역" }) };
}

describe("HarnessViewer", () => {
  it("shows both hint variants and the screen-reader step list", () => {
    const { container } = renderViewer();
    expect(screen.getByText("클릭해서 크게 보기")).toBeInTheDocument();
    expect(screen.getByText("탭해서 크게 보기")).toBeInTheDocument();
    expect(container.querySelectorAll("ol.sr-only li")).toHaveLength(12);
    expect(screen.getByRole("button", { name: `${title} 크게 보기` })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens the dialog, locks page scroll, fits the diagram to cover the stage, and focuses the stage", () => {
    renderViewer();
    const { trigger, stage } = openViewer();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: title })).toHaveAttribute("open");
    expect(document.body.style.overflow).toBe("hidden");
    expect(stage).toHaveFocus();
    // cover = max(1200/1600, 800/1000) = 0.8, 왼쪽 정렬, 세로 중앙
    expect(canvasTransform()).toEqual({ x: 0, y: 0, scale: 0.8 });
  });

  it("pans with pointer drag and reports the dragging state", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.pointerDown(stage, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 300, clientY: 300 });
    expect(stage).toHaveAttribute("data-dragging", "true");
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 420, clientY: 330 });
    expect(canvasTransform()).toMatchObject({ x: 120, y: 30 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(stage).toHaveAttribute("data-dragging", "false");
  });

  it("ignores secondary mouse buttons", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.pointerDown(stage, { pointerId: 2, pointerType: "mouse", button: 2, clientX: 0, clientY: 0 });
    expect(stage).toHaveAttribute("data-dragging", "false");
  });

  it("zooms with the wheel and clamps between 0.5× and 4× of the fit scale", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0 });
    expect(canvasTransform().scale).toBeCloseTo(0.88, 5);
    for (let index = 0; index < 40; index += 1) fireEvent.wheel(stage, { deltaY: 100, clientX: 0, clientY: 0 });
    // fit = min(1200/1600, 800/1000) = 0.75 → 최소 0.375
    expect(canvasTransform().scale).toBeCloseTo(0.375, 5);
    for (let index = 0; index < 80; index += 1) fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0 });
    expect(canvasTransform().scale).toBeCloseTo(3, 5);
  });

  it("pans and zooms from the keyboard and refits with 0", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(canvasTransform().x).toBe(40);
    fireEvent.keyDown(stage, { key: "+" });
    expect(canvasTransform().scale).toBeCloseTo(1, 5);
    fireEvent.keyDown(stage, { key: "0" });
    expect(canvasTransform()).toEqual({ x: 0, y: 0, scale: 0.8 });
  });

  it("refits from the toolbar and closes with the close button, restoring scroll and focus", () => {
    renderViewer();
    const { trigger } = openViewer();
    fireEvent.click(screen.getByRole("button", { name: "확대" }));
    expect(canvasTransform().scale).toBeCloseTo(1, 5);
    fireEvent.click(screen.getByRole("button", { name: "맞춤" }));
    expect(canvasTransform().scale).toBeCloseTo(0.8, 5);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape", () => {
    renderViewer();
    const { trigger } = openViewer();
    fireEvent.keyDown(screen.getByRole("dialog", { name: title }), { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `corepack pnpm vitest run src/components/work/harness-viewer.test.tsx`
Expected: FAIL — `Failed to resolve import "./harness-viewer"`.

- [ ] **Step 3: 컴포넌트 구현**

`src/components/work/harness-viewer.tsx`:

```tsx
"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const MIN_SCALE_FACTOR = 0.5;
const MAX_SCALE_FACTOR = 4;
const VISIBLE_FRACTION = 0.25;
const KEY_PAN = 40;
const BUTTON_ZOOM = 1.25;
const WHEEL_ZOOM = 1.1;

type Transform = { x: number; y: number; scale: number };
type Size = { width: number; height: number };
type Point = { x: number; y: number };

type HarnessViewerProps = {
  title: string;
  inline: ReactNode;
  full: ReactNode;
  steps: readonly string[];
  viewBox: Size;
};

export function HarnessViewer({ title, inline, full, steps, viewBox }: HarnessViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fitRef = useRef(1);
  const pointers = useRef(new Map<number, Point>());
  const dragRef = useRef<Point | null>(null);
  const pinchRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

  const stageSize = useCallback((): Size => {
    const stage = stageRef.current;
    return { width: stage?.clientWidth ?? 0, height: stage?.clientHeight ?? 0 };
  }, []);

  // 배율은 fit의 0.5배–4배, 다이어그램은 항상 25% 이상 보이도록 잠근다
  const clamp = useCallback(
    (next: Transform): Transform => {
      const { width, height } = stageSize();
      const fit = fitRef.current;
      const scale = Math.min(Math.max(next.scale, fit * MIN_SCALE_FACTOR), fit * MAX_SCALE_FACTOR);
      const drawnWidth = viewBox.width * scale;
      const drawnHeight = viewBox.height * scale;
      return {
        x: Math.min(
          Math.max(next.x, width * VISIBLE_FRACTION - drawnWidth),
          width * (1 - VISIBLE_FRACTION),
        ),
        y: Math.min(
          Math.max(next.y, height * VISIBLE_FRACTION - drawnHeight),
          height * (1 - VISIBLE_FRACTION),
        ),
        scale,
      };
    },
    [stageSize, viewBox.height, viewBox.width],
  );

  // 초기 배율은 cover: 스테이지를 꽉 채우고, INTAKE 레인이 왼쪽에 보이도록 왼쪽 정렬
  const fitToStage = useCallback(() => {
    const { width, height } = stageSize();
    if (!width || !height) return;
    fitRef.current = Math.min(width / viewBox.width, height / viewBox.height);
    const cover = Math.max(width / viewBox.width, height / viewBox.height);
    setTransform({ x: 0, y: (height - viewBox.height * cover) / 2, scale: cover });
  }, [stageSize, viewBox.height, viewBox.width]);

  const zoomAt = useCallback(
    (factor: number, origin: Point) => {
      setTransform((current) => {
        const fit = fitRef.current;
        const scale = Math.min(
          Math.max(current.scale * factor, fit * MIN_SCALE_FACTOR),
          fit * MAX_SCALE_FACTOR,
        );
        const ratio = scale / current.scale;
        return clamp({
          x: origin.x - (origin.x - current.x) * ratio,
          y: origin.y - (origin.y - current.y) * ratio,
          scale,
        });
      });
    },
    [clamp],
  );

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const { width, height } = stageSize();
      zoomAt(factor, { x: width / 2, y: height / 2 });
    },
    [stageSize, zoomAt],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setTransform((current) => clamp({ ...current, x: current.x + dx, y: current.y + dy }));
    },
    [clamp],
  );

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.close === "function") {
        if (dialog.open) dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    setOpen(true);
  }

  // 네이티브 close(Esc의 cancel 포함)와 상태를 맞춘다
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  // 열릴 때: 맞춤 배율, 스테이지 포커스, 페이지 스크롤 잠금, 창 크기 변경 시 재클램프
  useEffect(() => {
    if (!open) return;
    fitToStage();
    stageRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handleResize = () => {
      const { width, height } = stageSize();
      if (width && height) {
        fitRef.current = Math.min(width / viewBox.width, height / viewBox.height);
      }
      setTransform((current) => clamp(current));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [clamp, fitToStage, open, stageSize, viewBox.height, viewBox.width]);

  // React의 onWheel은 passive라 preventDefault가 안 되므로 네이티브로 등록한다
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !open) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? WHEEL_ZOOM : 1 / WHEEL_ZOOM, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [open, zoomAt]);

  function pointerDistance(): number {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const stage = event.currentTarget;
    if (typeof stage.setPointerCapture === "function") stage.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { x: event.clientX, y: event.clientY };
      setDragging(true);
    } else if (pointers.current.size === 2) {
      dragRef.current = null;
      pinchRef.current = pointerDistance();
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const tracked = pointers.current.get(event.pointerId);
    if (!tracked) return;
    tracked.x = event.clientX;
    tracked.y = event.clientY;
    if (pointers.current.size >= 2 && pinchRef.current !== null) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = event.currentTarget.getBoundingClientRect();
      if (pinchRef.current > 0) {
        zoomAt(distance / pinchRef.current, {
          x: (a.x + b.x) / 2 - rect.left,
          y: (a.y + b.y) / 2 - rect.top,
        });
      }
      pinchRef.current = distance;
      return;
    }
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    panBy(dx, dy);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const stage = event.currentTarget;
    pointers.current.delete(event.pointerId);
    if (typeof stage.hasPointerCapture === "function" && stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 1) {
      const [rest] = [...pointers.current.values()];
      dragRef.current = { x: rest.x, y: rest.y };
    }
    if (pointers.current.size === 0) {
      dragRef.current = null;
      setDragging(false);
    }
  }

  function handleStageKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => panBy(KEY_PAN, 0),
      ArrowRight: () => panBy(-KEY_PAN, 0),
      ArrowUp: () => panBy(0, KEY_PAN),
      ArrowDown: () => panBy(0, -KEY_PAN),
      "+": () => zoomFromCenter(BUTTON_ZOOM),
      "=": () => zoomFromCenter(BUTTON_ZOOM),
      "-": () => zoomFromCenter(1 / BUTTON_ZOOM),
      "0": fitToStage,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog();
  }

  const transformStyle = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;

  return (
    <figure className="work-system-figure">
      <button
        ref={triggerRef}
        type="button"
        className="work-system-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${title} 크게 보기`}
        onClick={openDialog}
      >
        {inline}
        <span className="work-system-hint work-system-hint-pointer" aria-hidden="true">
          클릭해서 크게 보기
        </span>
        <span className="work-system-hint work-system-hint-touch" aria-hidden="true">
          탭해서 크게 보기
        </span>
      </button>
      <ol className="sr-only">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <dialog
        ref={dialogRef}
        className="work-system-dialog"
        aria-label={title}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="work-system-toolbar">
          <span className="work-system-dialog-title">{title}</span>
          <button type="button" onClick={() => zoomFromCenter(1 / BUTTON_ZOOM)} aria-label="축소">
            −
          </button>
          <button type="button" onClick={() => zoomFromCenter(BUTTON_ZOOM)} aria-label="확대">
            +
          </button>
          <button type="button" onClick={fitToStage}>
            맞춤
          </button>
          <button type="button" onClick={closeDialog}>
            닫기
          </button>
        </div>
        <div
          ref={stageRef}
          className="work-system-stage"
          role="application"
          aria-label="다이어그램 이동 영역"
          tabIndex={0}
          data-dragging={dragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleStageKeyDown}
        >
          <div
            className="work-system-canvas"
            style={{ width: viewBox.width, height: viewBox.height, transform: transformStyle }}
          >
            {full}
          </div>
        </div>
        <p className="work-system-help">드래그로 이동 · 휠이나 두 손가락으로 확대 · Esc로 닫기</p>
      </dialog>
    </figure>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `corepack pnpm vitest run src/components/work/harness-viewer.test.tsx`
Expected: PASS (8 tests). `toHaveFocus`가 실패하면 `stageRef.current?.focus()`가 `fitToStage()` 뒤에 있는지, 스테이지에 `tabIndex={0}`이 있는지 확인한다.

- [ ] **Step 5: 뷰어 스타일 추가**

`src/app/globals.css` 파일 끝(Task 3에서 추가한 `.harness-*` 블록 뒤)에 추가한다.

```css
/* Harness viewer — 인라인 트리거, 전체 화면 dialog, 이동·줌 스테이지 */
.work-system-figure { margin: 0; }
.work-system-trigger {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--rule);
  border-radius: 2px;
  background: var(--paper-raised);
  cursor: zoom-in;
  text-align: left;
}
.work-system-trigger .harness-diagram { width: 100%; height: auto; }
.work-system-hint {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  padding: 0 0.7rem;
  border: 1px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: -0.02em;
  transition: background-color 0.3s var(--ease-out), color 0.3s var(--ease-out);
}
.work-system-hint-touch { display: none; }
.work-system-trigger:hover .work-system-hint,
.work-system-trigger:focus-visible .work-system-hint { background: var(--ink); color: var(--paper); }
.work-system-dialog {
  inset: 0;
  width: 100vw;
  height: 100svh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--paper);
  color: var(--ink);
}
.work-system-dialog[open] { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; }
.work-system-dialog::backdrop { background: color-mix(in srgb, var(--ink) 80%, transparent); }
.work-system-toolbar {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem clamp(1rem, 3vw, 3rem);
  border-bottom: 1px solid var(--rule);
  background: var(--paper);
}
.work-system-dialog-title {
  min-width: 0;
  margin-right: auto;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: -0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.work-system-toolbar button {
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 0.8rem;
  border: 1px solid var(--ink);
  background: transparent;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  cursor: pointer;
  transition: background-color 0.3s var(--ease-out), color 0.3s var(--ease-out);
}
.work-system-toolbar button:hover { background: var(--ink); color: var(--paper); }
.work-system-stage {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background-color: var(--paper);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 40px 40px;
  cursor: grab;
  touch-action: none;
}
.work-system-stage[data-dragging="true"] { cursor: grabbing; }
.work-system-canvas {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  transition: transform 0.2s var(--ease-out);
  will-change: transform;
}
.work-system-stage[data-dragging="true"] .work-system-canvas { transition: none; }
.work-system-canvas .harness-diagram { width: 100%; height: 100%; }
.work-system-help {
  margin: 0;
  padding: 0.6rem clamp(1rem, 3vw, 3rem);
  border-top: 1px solid var(--rule);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.66rem;
}
@media (hover: none) {
  .work-system-hint-pointer { display: none; }
  .work-system-hint-touch { display: inline-flex; }
  .work-system-trigger:active .work-system-hint { background: var(--ink); color: var(--paper); }
}
```

- [ ] **Step 6: lint와 커밋**

```bash
corepack pnpm lint
git add src/components/work/harness-viewer.tsx src/components/work/harness-viewer.test.tsx src/app/globals.css
git commit -m "feat: add the full-screen harness viewer with drag and zoom

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---
### Task 5: Touchpoint 서사와 `Project` 타입 확장

**Files:**
- Modify: `src/content/projects.ts` (타입 3곳, Touchpoint 항목 전체 교체)
- Modify: `src/content/projects.test.ts` (테스트 1개 교체, import 추가)

**Interfaces:**
- Consumes: `touchpointHarness`, `harnessCounts`, 타입 `HarnessDiagram` (Task 1·2).
- Produces: `Project`에 선택 필드 `metricsNote?: string`, `system?: ProjectSystem`. `export type ProjectSystem = { title: string; intro: readonly string[]; diagram: HarnessDiagram }`. Touchpoint 항목의 `system.title`은 `"시스템 구조"`. Task 6이 `project.system`과 `project.metricsNote`를 읽는다.

- [ ] **Step 1: 실패 테스트 작성**

`src/content/projects.test.ts`에서 import 아래에 한 줄을 추가하고, `does not publish unverified Touchpoint traction` 테스트를 통째로 교체한다.

```ts
import { harnessCounts } from "./harness";
```

```ts
  it("publishes only system measurements for Touchpoint, never traction", () => {
    const touchpoint = getProjectBySlug("touchpoint")!;
    expect(touchpoint.verifiedMetrics).toHaveLength(3);
    expect(touchpoint.verifiedMetrics[0]).toMatch(new RegExp(`^hooks ${harnessCounts.hooks} `));
    expect(touchpoint.verifiedMetrics[2]).toContain(`위키 ${harnessCounts.wikiPages}페이지`);
    for (const metric of touchpoint.verifiedMetrics) {
      expect(metric).not.toMatch(/매출|사용자|예약|방문/);
    }
    expect(touchpoint.metricsNote).toContain("2026.09.03");
    expect(touchpoint.activeLine).toContain("AI");
    expect(touchpoint.system?.title).toBe("시스템 구조");
    expect(touchpoint.system?.diagram.id).toBe("touchpoint-harness");
    expect(touchpoint.sections.outcome.join(" ")).toContain("검증 전");
  });
```

- [ ] **Step 2: 실패 확인**

Run: `corepack pnpm vitest run src/content/projects.test.ts`
Expected: FAIL — `expected [] to have a length of 3`.

- [ ] **Step 3: 타입 확장**

`src/content/projects.ts` 맨 위에 import를 추가하고, `ProjectSections` 타입 아래에 `ProjectSystem`을 추가하고, `Project` 타입에 두 필드를 넣는다.

```ts
import { harnessCounts, touchpointHarness, type HarnessDiagram } from "./harness";
```

```ts
export type ProjectSystem = {
  title: string;
  intro: readonly string[];
  diagram: HarnessDiagram;
};
```

`Project` 타입의 `verifiedMetrics: readonly string[];` 바로 아래에:

```ts
  metricsNote?: string;
```

`Project` 타입의 `sections: ProjectSections;` 바로 아래에:

```ts
  system?: ProjectSystem;
```

- [ ] **Step 4: Touchpoint 항목 교체**

`projects` 배열의 마지막 항목(`slug: "touchpoint"`)을 아래로 통째로 바꾼다. 문구는 스펙 4절 그대로다.

```ts
  {
    slug: "touchpoint",
    route: "/work/touchpoint",
    name: "Touchpoint",
    category: "0→1 PRODUCT · AI SYSTEM BUILD",
    kind: "independent",
    activeLine: "AI 에이전트 하네스로 1인이 0→1 제품을 구축·운영합니다",
    heroOutcome: "혼자서 팀처럼 일하도록, 에이전트 하네스를 설계해 0→1 제품을 구축했습니다",
    role: "Founding Product Builder · PO · AI 시스템 설계 · 개발",
    period: "2026–NOW",
    team: "사람 1 · Hermes(PM 리뷰 에이전트) · Claude Code(구현 에이전트)",
    summary:
      "기획, 디자인, 개발, 운영을 1인이 감당하기 위해 Hermes와 Claude Code로 PM 리뷰, 구현, 검수, 배포, 에러 트리아지가 순환하는 에이전트 하네스를 만들고, 그 위에서 유료 미팅 링크 제품 Touchpoint를 0→1로 구축한 프로젝트입니다.",
    verifiedMetrics: [
      `hooks ${harnessCounts.hooks} · rules ${harnessCounts.rules} · skills ${harnessCounts.skills} · agents ${harnessCounts.agents}`,
      "7개월 1,009 커밋 · PR 827건 머지 · 릴리스 47회",
      `테스트 파일 528개 · 마이그레이션 103건 · 위키 ${harnessCounts.wikiPages}페이지`,
    ],
    metricsNote: "2026.09.03 Touchpoint 저장소 실측. 시장 성과가 아니라 시스템 규모입니다.",
    media: {
      card: "assets/projects/touchpoint/card.jpg",
      hero: "assets/projects/touchpoint/card.jpg",
      logo: "assets/projects/touchpoint/logo.svg",
      alt: "Touchpoint 프로필과 미팅 상품 화면을 사용하는 장면",
      accent: "#ff6b5f",
    },
    sections: {
      overview: [
        "Touchpoint는 창작자와 전문가가 제안, 요청, 일정, 결제를 하나의 프로필 링크에서 관리하는 유료 미팅 제품입니다. 기획, 디자인, 개발, 운영을 혼자 맡았고 결제, 인증, 다국어, DB처럼 실수 비용이 큰 영역이 처음부터 포함돼 있었습니다.",
        "그래서 이 프로젝트의 진짜 병목은 기능이 아니라 1인의 처리량과 품질 일관성이었습니다. AI 코딩 도구를 쓰는 것을 넘어, 사람 한 명과 에이전트들이 팀처럼 돌아가는 시스템을 만드는 일이 제품 구축의 절반이었습니다.",
      ],
      problem: [
        "AI 에이전트를 그냥 쓰면 같은 실패가 반복됐습니다. 세션이 바뀌면 이전 결정과 맥락이 사라졌고, \"고쳤다\"는 보고가 재현과 검증 없이 올라왔으며, 계획 단계의 수락 기준이 완료 시점에는 유실됐습니다.",
        "병렬 세션이 같은 Linear 이슈를 중복으로 잡거나, 검수를 건너뛴 채 머지가 이뤄지거나, 결제와 DB 같은 보호 영역에 수정이 들어가는 일도 있었습니다. 규칙을 문서로 적어 두는 것만으로는 막히지 않았습니다.",
      ],
      judgment: [
        "프롬프트를 더 잘 쓰는 문제가 아니라 시스템 설계 문제로 정의했습니다. 원칙은 세 가지였습니다. 검수 품질은 에이전트가 맡고 까먹음 차단은 훅이 맡는다. 규칙은 문서가 아니라 hook과 CI로 강제한다. 사람은 시각 품질과 제품 결정만 판단한다.",
        "역할도 나눴습니다. Hermes는 Linear를 상시 감시하며 PM과 도메인 관점의 리뷰를 맡고, Claude Code는 리뷰를 통과한 이슈만 worktree에서 구현합니다. 두 축은 Linear의 상태와 hermes 라벨로 분리해 서로의 판단을 덮어쓰지 않게 했습니다.",
      ],
      execution: [
        "세션 시작 시 위키 색인을 주입하고, Linear에서 claim되지 않은 이슈는 worktree 생성 자체를 막았습니다. 착수 시점에 Linear 수락 기준을 체크리스트로 내려받고, 편집마다 lint 자동 수정과 보호 영역 차단, 콘솔 로그와 DB 마이그레이션 경고가 붙습니다.",
        "완료 직전에는 review-inspector가 수락 기준을 코드와 대조하고, quality-evaluator가 만든 에이전트와 다른 컨텍스트에서 품질을 채점하며, 머지 시점의 pre-merge-gate가 체크리스트, DB 검수, 품질 평가, 위키 갱신 네 가지를 커밋 SHA와 결합해 하드 차단합니다. 시각 변경만 admin 검수함에서 사람이 승인하고, 나머지는 자동으로 Done 처리됩니다.",
        "운영도 루프에 넣었습니다. 프로덕션 에러는 매일 fingerprint로 묶여 보수적 임계를 넘을 때만 Linear 이슈로 자동 생성되고, Hermes 리뷰를 거쳐 다시 구현 파이프라인으로 들어옵니다. 반복되는 실패는 그때마다 규칙이 아니라 훅으로 승격했습니다. 중복 배정을 막는 claim 훅, 재검수 토큰 비용을 없앤 머지 시점 게이트 재구조화가 그 예입니다.",
      ],
      outcome: [
        "이 시스템 위에서 7개월 동안 1,009개 커밋과 827건의 PR, 47회의 릴리스를 혼자 운영했고, 결제, 인증, 다국어, 채팅, 음성 통화, 어드민까지 제품 전 범위를 구축했습니다. 다만 시장 반응과 성장성은 아직 검증 전입니다.",
        "배운 것은 두 가지입니다. 강제 지점은 턴 종료가 아니라 머지 같은 비가역 경계에 둬야 비용이 새지 않는다는 것, 그리고 사람의 판단이 꼭 필요한 곳만 남기고 나머지를 시스템에 넘겨야 1인이 팀의 속도를 낼 수 있다는 것입니다. 결제 규제가 제품 범위와 시장 선택을 바꿀 수 있다는 점을 확인하고 글로벌 결제 구조로 전환한 학습도 이 순환 덕에 빠르게 다음 검증 순서로 이어졌습니다.",
      ],
    },
    system: {
      title: "시스템 구조",
      intro: [
        "Linear 이슈에서 시작해 Hermes 리뷰, Claude Code 구현, 사람 검수, 배포를 지나 프로덕션 에러가 다시 Linear로 돌아오는 순환 구조입니다. 각 단계에 실제 hook, skill, agent 이름을 그대로 적었습니다.",
      ],
      diagram: touchpointHarness,
    },
  },
```

- [ ] **Step 5: 콘텐츠 테스트 전체 통과 확인**

Run: `corepack pnpm vitest run src/content`
Expected: PASS. `career.test.ts`도 그대로 통과한다(Touchpoint `period`는 바뀌지 않았고, Career 독립 프로젝트 요약은 새 `summary`를 그대로 받는다).

- [ ] **Step 6: lint, 타입 검사, 커밋**

```bash
corepack pnpm lint
corepack pnpm exec tsc --noEmit
git add src/content/projects.ts src/content/projects.test.ts
git commit -m "feat: retell Touchpoint as an AI harness build with system metrics

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---

### Task 6: 상세 페이지에 시스템 챕터와 메트릭 각주 연결

**Files:**
- Modify: `src/components/work/project-detail.tsx` (전체 교체)
- Modify: `src/components/work/project-detail.test.tsx` (전체 교체)
- Modify: `src/app/globals.css` (파일 끝에 챕터 레이아웃 블록 추가)

**Interfaces:**
- Consumes: `Project`(`system?`, `metricsNote?`), `HarnessDiagram` 컴포넌트, `HarnessViewer` (Task 3·4·5).
- Produces: `buildChapters(project): Chapter[]` (export, `system`이 있으면 3번째에 `{ key: "system", label: project.system.title }`). Touchpoint 페이지에 `section#system.work-story-section.work-system`, `.work-metrics-note`. 트리거 접근 가능한 이름은 `"Touchpoint 시스템 구조 다이어그램 크게 보기"`.

- [ ] **Step 1: 실패 테스트 작성**

`src/components/work/project-detail.test.tsx` 전체를 아래로 교체한다.

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProjectBySlug } from "@/content/projects";
import { buildChapters, ProjectDetail } from "./project-detail";

describe("ProjectDetail", () => {
  it("puts the verified outcome before the supporting story", () => {
    const project = getProjectBySlug("butlerlee")!;
    const { container } = render(<ProjectDetail project={project} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(project.heroOutcome);
    expect(container.querySelector(".work-metrics")).toHaveTextContent("월 약 800만원");
    expect(screen.getByRole("heading", { name: "핵심 판단" })).toBeInTheDocument();
    expect(container.querySelector(".work-metrics-note")).toBeNull();
  });

  it("shows Touchpoint's system measurements with the snapshot note and no traction claim", () => {
    const project = getProjectBySlug("touchpoint")!;
    const { container } = render(<ProjectDetail project={project} />);
    const metrics = container.querySelector(".work-metrics")!;
    expect(metrics).toHaveTextContent("hooks 16");
    expect(metrics.querySelector(".work-metrics-note")).toHaveTextContent("2026.09.03");
    expect(metrics).not.toHaveTextContent(/매출|사용자|예약/);
    expect(screen.getByText(/성장성은 아직 검증 전/)).toBeInTheDocument();
  });

  it("inserts the system chapter third for Touchpoint and keeps four chapters elsewhere", () => {
    expect(buildChapters(getProjectBySlug("touchpoint")!).map(({ label }) => label)).toEqual([
      "문제와 맥락",
      "핵심 판단",
      "시스템 구조",
      "실행과 운영 변화",
      "성과와 학습",
    ]);
    expect(buildChapters(getProjectBySlug("butlerlee")!).map(({ key }) => key)).toEqual([
      "problem",
      "judgment",
      "execution",
      "outcome",
    ]);
  });

  it("keeps overview in the hero and numbers the system chapter 03", () => {
    const project = getProjectBySlug("touchpoint")!;
    const { container } = render(<ProjectDetail project={project} />);
    const sections = container.querySelectorAll("article.work-story > section");
    expect(sections).toHaveLength(5);
    expect(sections[2]).toHaveAttribute("id", "system");
    expect(sections[2].querySelector(".work-story-index")).toHaveTextContent("03");
    expect(within(sections[2] as HTMLElement).getByRole("heading", { name: "시스템 구조" })).toBeInTheDocument();
    expect(sections[3].querySelector(".work-story-index")).toHaveTextContent("04");
    expect(screen.queryByRole("heading", { name: "프로젝트 개요" })).not.toBeInTheDocument();
    expect(screen.getByText(project.sections.overview[0])).toBeInTheDocument();
    expect(screen.getByText(project.system!.intro[0])).toBeInTheDocument();
  });

  it("renders the harness viewer with the inline diagram inside the system chapter", () => {
    const project = getProjectBySlug("touchpoint")!;
    render(<ProjectDetail project={project} />);
    const trigger = screen.getByRole("button", { name: "Touchpoint 시스템 구조 다이어그램 크게 보기" });
    expect(trigger.closest("section")).toHaveAttribute("id", "system");
    expect(within(trigger).getByRole("img", { name: /시스템 구조/ })).toBeInTheDocument();
  });

  it("renders no system chapter or viewer for projects without one", () => {
    const project = getProjectBySlug("snode")!;
    const { container } = render(<ProjectDetail project={project} />);
    expect(container.querySelector("section#system")).toBeNull();
    expect(screen.queryByRole("button", { name: /크게 보기/ })).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `corepack pnpm vitest run src/components/work/project-detail.test.tsx`
Expected: FAIL — `buildChapters` is not exported / 챕터 수 4.

- [ ] **Step 3: 컴포넌트 교체**

`src/components/work/project-detail.tsx` 전체를 아래로 교체한다.

```tsx
import Image from "next/image";
import type { CSSProperties } from "react";

import { projects, type Project, type ProjectSections } from "@/content/projects";

import { HarnessDiagram } from "./harness-diagram";
import { HarnessViewer } from "./harness-viewer";
import { ProjectNavigation } from "./project-navigation";

export type Chapter = { key: keyof ProjectSections | "system"; label: string };

const baseChapters: readonly Chapter[] = [
  { key: "problem", label: "문제와 맥락" },
  { key: "judgment", label: "핵심 판단" },
  { key: "execution", label: "실행과 운영 변화" },
  { key: "outcome", label: "성과와 학습" },
];

/** system이 있는 프로젝트만 "핵심 판단" 뒤에 시스템 구조 챕터를 끼운다 */
export function buildChapters(project: Project): Chapter[] {
  const chapters = [...baseChapters];
  if (project.system) chapters.splice(2, 0, { key: "system", label: project.system.title });
  return chapters;
}

type ProjectStyle = CSSProperties & { "--project-accent": string };

export function ProjectDetail({ project }: { project: Project }) {
  const projectStyle: ProjectStyle = { "--project-accent": project.media.accent };
  const projectIndex = projects.findIndex(({ slug }) => slug === project.slug) + 1;

  return (
    <main className="work-page" style={projectStyle}>
      <header className="work-hero">
        <div className="work-hero-copy">
          <p className="work-index">
            {String(projectIndex).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <p className="work-kicker">{project.category}</p>
          <div className="work-logo">
            <span className="work-logo-image">
              <Image
                src={`/${project.media.logo}`}
                alt={`${project.name} 로고`}
                fill
                loading="eager"
                sizes="176px"
              />
            </span>
          </div>
          <dl className="work-meta">
            <div>
              <dt className="work-meta-label">ROLE</dt>
              <dd>{project.role}</dd>
            </div>
            {project.period ? (
              <div>
                <dt className="work-meta-label">PERIOD</dt>
                <dd>{project.period}</dd>
              </div>
            ) : null}
            <div>
              <dt className="work-meta-label">TEAM</dt>
              <dd>{project.team}</dd>
            </div>
          </dl>
          <h1>{project.heroOutcome}</h1>
          <div className="work-summary">
            {project.sections.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <figure className="work-hero-media">
          <Image
            src={`/${project.media.hero}`}
            alt={project.media.alt}
            fill
            preload
            sizes="(max-width: 767px) 100vw, 56vw"
          />
        </figure>
      </header>

      {project.verifiedMetrics.length > 0 ? (
        <section className="work-metrics" aria-label="주요 성과">
          <dl className="work-metrics-list">
            {project.verifiedMetrics.map((metric) => (
              <div key={metric}>
                <dt className="work-metric-label">VERIFIED METRIC</dt>
                <dd className="work-metric-value">{metric}</dd>
              </div>
            ))}
          </dl>
          {project.metricsNote ? <p className="work-metrics-note">{project.metricsNote}</p> : null}
        </section>
      ) : null}

      <article className="work-story">
        {buildChapters(project).map((chapter, index) => {
          const number = String(index + 1).padStart(2, "0");
          if (chapter.key === "system") {
            const system = project.system;
            if (!system) return null;
            const viewerTitle = `${project.name} ${system.title} 다이어그램`;
            return (
              <section className="work-story-section work-system" id="system" key="system">
                <div className="work-story-heading">
                  <span className="work-story-index">{number}</span>
                  <h2>{chapter.label}</h2>
                </div>
                <div className="work-story-body">
                  {system.intro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="work-system-figure-wrap">
                  <HarnessViewer
                    title={viewerTitle}
                    inline={<HarnessDiagram diagram={system.diagram} variant="inline" />}
                    full={<HarnessDiagram diagram={system.diagram} variant="full" />}
                    steps={system.diagram.steps}
                    viewBox={system.diagram.viewBox}
                  />
                </div>
              </section>
            );
          }
          return (
            <section className="work-story-section" key={chapter.key}>
              <div className="work-story-heading">
                <span className="work-story-index">{number}</span>
                <h2>{chapter.label}</h2>
              </div>
              <div className="work-story-body">
                {project.sections[chapter.key].map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          );
        })}
      </article>

      <ProjectNavigation slug={project.slug} />
    </main>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `corepack pnpm vitest run src/components/work`
Expected: PASS (project-detail 6개 + navigation + diagram + viewer). 이전 Task의 뷰어 테스트가 정의한 jsdom 폴리필은 파일 단위이므로, project-detail 테스트에서 dialog를 열지 않는 한 필요 없다.

- [ ] **Step 5: 챕터 레이아웃과 각주 스타일 추가**

`src/app/globals.css` 파일 끝에 추가한다.

```css
/* Touchpoint 시스템 구조 챕터 — 다이어그램은 12컬럼 전체 폭, 모바일은 1컬럼 */
.work-metrics-note {
  margin: 1rem 0 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: -0.02em;
}
.work-system-figure-wrap { grid-column: 1 / 13; margin-top: clamp(2rem, 4vw, 3.5rem); }
@media (max-width: 767px) {
  .work-system-figure-wrap { grid-column: 1; margin-top: 1.5rem; }
}
```

- [ ] **Step 6: 전체 단위 테스트, lint, 타입 검사, 커밋**

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm exec tsc --noEmit
git add src/components/work/project-detail.tsx src/components/work/project-detail.test.tsx src/app/globals.css
git commit -m "feat: add the system structure chapter to the Touchpoint page

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---
### Task 7: E2E 시나리오, 전체 검증, 시각 점검

**Files:**
- Modify: `e2e/portfolio.spec.ts` (파일 끝에 테스트 2개 추가)

**Interfaces:**
- Consumes: Task 4·6이 만든 DOM — `button[aria-label="Touchpoint 시스템 구조 다이어그램 크게 보기"]`, `dialog.work-system-dialog`, `.work-system-stage`, `.work-system-canvas`(inline `transform`), `section#system`.
- Produces: 없음. 이 태스크는 검증이 산출물이다.

- [ ] **Step 1: E2E 테스트 추가**

`e2e/portfolio.spec.ts` 파일 끝에 추가한다.

```ts
test("Touchpoint system diagram opens full screen, pans by drag, and closes with Escape", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/touchpoint");
  await expect(page.getByRole("heading", { name: "시스템 구조" })).toBeVisible();
  const trigger = page.getByRole("button", { name: "Touchpoint 시스템 구조 다이어그램 크게 보기" });
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger.getByRole("img")).toBeVisible();

  await trigger.click();
  const dialog = page.locator("dialog.work-system-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "닫기" })).toBeVisible();

  const translateX = () =>
    page.locator(".work-system-canvas").evaluate((element) => {
      const match = /translate\((-?[\d.]+)px/.exec((element as HTMLElement).style.transform);
      return match ? Number(match[1]) : Number.NaN;
    });
  const before = await translateX();
  expect(Number.isNaN(before)).toBe(false);

  const stage = (await page.locator(".work-system-stage").boundingBox())!;
  const x = stage.x + stage.width / 2;
  const y = stage.y + stage.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 120, y, { steps: 8 });
  await page.mouse.up();
  expect(await translateX()).toBeGreaterThan(before + 100);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Touchpoint detail keeps the diagram inside the viewport on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/touchpoint");
  await page.locator("#system").scrollIntoViewIfNeeded();
  await expect(page.getByText("탭해서 크게 보기")).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
  ).toBe(false);
});
```

> 모바일 테스트의 `탭해서 크게 보기`는 `(hover: none)` 미디어 조건으로 보인다. Playwright의 Desktop Chrome 프로젝트는 hover가 가능한 장치로 에뮬레이션되므로, 이 단언이 실패하면 `page.emulateMedia`로는 hover 미디어를 바꿀 수 없다는 뜻이다. 그 경우 단언을 `await expect(page.getByRole("button", { name: /크게 보기/ })).toBeVisible();`로 바꾼다.

- [ ] **Step 2: lint, 단위 테스트, 프로덕션 빌드**

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

Expected: 셋 다 성공. `build`가 `HarnessDiagram`을 클라이언트 컴포넌트 prop으로 넘기는 부분에서 실패하면, `harness-diagram.tsx`에 `"use client"`가 없는지와 이벤트 핸들러가 없는지 확인한다(서버 컴포넌트 엘리먼트는 직렬화된 렌더 결과로 넘어간다).

- [ ] **Step 3: Playwright 브라우저 확인**

```bash
ls ~/Library/Caches/ms-playwright 2>/dev/null | grep -i chromium || corepack pnpm exec playwright install chromium
```

- [ ] **Step 4: 개발 서버를 띄우고 E2E 실행**

이 셸에는 `pnpm`이 PATH에 없어 Playwright의 `webServer`(`pnpm dev …`)가 스스로 서버를 못 띄운다. 서버를 직접 띄우면 `reuseExistingServer`가 그것을 쓴다.

```bash
SCRATCH=/private/tmp/claude-501/-Users-dockyum-orca-workspaces-dokyum-portfolio-touchpoint-architecture---/22281693-672f-43b4-9d38-e2ab28162f7e/scratchpad
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4173 corepack pnpm dev --hostname 127.0.0.1 --port 4173 > "$SCRATCH/dev.log" 2>&1 &
echo $! > "$SCRATCH/dev.pid"
for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/ | grep -q 200 && break; sleep 1; done
corepack pnpm test:e2e
```

Expected: 새 테스트 2개를 포함해 전부 PASS. 실패한 테스트가 있으면 `test-results/`의 trace를 열어 원인을 고친 뒤 다시 돌린다. 서버는 다음 단계 스크린샷까지 유지한다.

- [ ] **Step 5: 세 폭에서 스크린샷을 찍어 시각 점검**

임시 스크립트를 worktree 안에 만들고(의존성 해석을 위해), 찍은 뒤 지운다.

```bash
cat > e2e/.harness-shots.mjs <<'EOF'
import { chromium } from "@playwright/test";

const out = process.env.OUT;
const browser = await chromium.launch();
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["tablet", 1024, 768],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4173/work/touchpoint");
  await page.locator("#system").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/system-${name}.png` });
  await page.getByRole("button", { name: /크게 보기/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/dialog-${name}.png` });
  await page.goto("http://127.0.0.1:4173/work/touchpoint");
  await page.screenshot({ path: `${out}/hero-${name}.png` });
  await page.close();
}
await browser.close();
EOF
OUT="$SCRATCH" node e2e/.harness-shots.mjs
rm e2e/.harness-shots.mjs
git status --short   # e2e/.harness-shots.mjs가 남아 있으면 안 된다
```

`$SCRATCH/system-*.png`, `dialog-*.png`, `hero-*.png` 아홉 장을 Read 도구로 열어 스펙 10.3 항목을 확인한다.

- 인라인 다이어그램이 챕터 폭을 가득 채우고 힌트 칩이 우하단에 보인다.
- 확대 뷰 초기 상태에서 INTAKE 레인이 왼쪽에 보이고 노드 텍스트가 상자 밖으로 나가지 않는다.
- accent 색(산호색)이 게이트 왼쪽 마커와 루프 엣지에만 보인다.
- 메트릭 밴드에 세 항목과 `2026.09.03 …` 각주가 읽힌다.
- 히어로 h1이 `혼자서 팀처럼 일하도록, …`이고 카테고리가 `0→1 PRODUCT · AI SYSTEM BUILD`다.

노드 텍스트가 잘리거나 엣지가 노드를 가로지르면 `harness.ts`의 해당 노드 `height`/줄바꿈이나 엣지 `path`를 고치고 Task 2 테스트를 다시 돌린 뒤 스크린샷을 다시 찍는다. 레인 구간과 viewBox는 유지한다.

- [ ] **Step 6: 랜딩과 GNB의 Touchpoint 한 줄 확인 후 서버 종료**

```bash
curl -s http://127.0.0.1:4173/ | grep -o 'AI 에이전트 하네스로 1인이 0→1 제품을 구축·운영합니다' | head -1
curl -s http://127.0.0.1:4173/career | grep -c '에이전트 하네스를 만들고'
kill "$(cat "$SCRATCH/dev.pid")"
```

Expected: 첫 명령이 문구를 출력하고(랜딩 카드), 두 번째가 1 이상(Career 독립 프로젝트 요약).

- [ ] **Step 7: 커밋**

```bash
git add e2e/portfolio.spec.ts
git commit -m "test: cover the Touchpoint harness viewer end to end

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

---

### Task 8: 계획 문서 마감과 main 반영

**Files:**
- Modify: `docs/superpowers/plans/2026-09-04-touchpoint-ai-harness.md` (체크박스 갱신)

**Interfaces:**
- Consumes: Task 1–7의 커밋.
- Produces: GitHub `main`이 이 브랜치로 fast-forward되어 Vercel 프로덕션 배포가 시작된다. 메인 체크아웃의 로컬 `main`은 건드리지 않는다.

> 2026-09-05 사용자 지시("브랜치에서 작업했으면 PR 만들어서 머지해. 나에게 다시 묻지 말고", `~/.claude/rules/common/worktree.md` "완료 후 통합")에 따라 검증이 통과하면 묻지 않고 PR → 머지까지 수행한다. 멈추고 보고하는 경우는 검증 실패, 해결하지 못한 충돌, 보호 규칙으로 머지 불가뿐이다.

- [ ] **Step 1: 브랜치 상태와 검증 결과 점검**

```bash
git status --short            # 비어 있어야 한다
git log --oneline main..HEAD  # 이 계획의 커밋(스펙·계획·기능 6·테스트)이 보여야 한다
git remote -v                 # github.com/dockyum/dokyum-portfolio 를 가리키는 원격 이름 확인 (보통 `github`; `origin`은 로컬 경로일 수 있다)
```

Task 7의 lint·단위·빌드·E2E가 모두 통과한 상태여야 한다. 하나라도 실패했으면 여기서 멈추고 보고한다. 아래 명령의 `github`은 Step 1에서 확인한 GitHub 원격 이름으로 바꾼다.

- [ ] **Step 2: 계획 체크박스를 마감하고 커밋**

이 계획 파일의 Task 1–7 체크박스를 `- [x]`로 바꾼다(Task 8의 남은 단계는 수행하면서 갱신).

```bash
git add docs/superpowers/plans/2026-09-04-touchpoint-ai-harness.md
git commit -m "docs: record the Touchpoint harness plan completion

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF"
```

- [ ] **Step 3: 원격 main과 동기화**

```bash
git fetch github
git merge-base --is-ancestor github/main HEAD && echo "up to date" || echo "rebase needed"
```

`rebase needed`면 `git rebase github/main` 후 충돌을 양쪽 의도를 읽고 해결하고, Task 7 Step 2·4의 검증(lint·test·build·e2e)을 다시 돌린다. 저장소는 선형 히스토리(fast-forward만)를 쓴다.

- [ ] **Step 4: 브랜치 push와 PR 생성**

```bash
git push -u github dockyum/touchpoint-architecture-추가        # rebase 했으면 --force-with-lease
gh pr create --repo dockyum/dokyum-portfolio --base main --head dockyum/touchpoint-architecture-추가 \
  --title "feat: retell Touchpoint as an AI harness build with a system diagram" \
  --body "$(cat <<'EOF'
## Summary
- Touchpoint 상세 페이지를 "AI 에이전트 하네스로 1인이 0→1 제품을 구축·운영"한 사례로 재작성 (랜딩 카드·히어로·5챕터·시스템 실측 메트릭)
- Hermes × Claude Code 하네스를 데이터 기반 인라인 SVG 다이어그램으로 추가: 클릭 확대, 드래그 이동, 휠·핀치·키보드 줌
- 시장 트랙션 주장은 없음. 수치는 2026-09-03 Touchpoint 저장소 실측

## Verification
- `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm build`, `corepack pnpm test:e2e` 통과
- 1440 / 1024 / 390 스크린샷 시각 점검

## Docs
- Spec: docs/superpowers/specs/2026-09-04-touchpoint-ai-harness-design.md
- Plan: docs/superpowers/plans/2026-09-04-touchpoint-ai-harness.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Ps6mzF9U3G21M1PSAgdMRF
EOF
)"
```

- [ ] **Step 5: 머지 (fast-forward push)**

```bash
git push github dockyum/touchpoint-architecture-추가:main     # base가 조상이면 fast-forward, SHA 보존, PR은 GitHub이 merged로 처리
```

브랜치 보호로 거부되면 `gh pr merge --rebase --repo dockyum/dokyum-portfolio <PR번호>`. 그것도 불가하면 멈추고 보고한다.

- [ ] **Step 6: 원격 브랜치 정리와 프로덕션 확인**

```bash
git push github --delete dockyum/touchpoint-architecture-추가
for i in $(seq 1 20); do
  if curl -s https://dokyum-portfolio.vercel.app/work/touchpoint | grep -q '시스템 구조'; then echo deployed; break; fi
  sleep 15
done
curl -s https://dokyum-portfolio.vercel.app/ | grep -o 'AI 에이전트 하네스로 1인이 0→1 제품을 구축·운영합니다' | head -1
```

Expected: `deployed` 출력과 랜딩 문구 출력. 로컬 worktree는 orca가 관리하므로 그대로 두고, 메인 체크아웃의 로컬 `main`은 건드리지 않는다.

- [ ] **Step 7: 보고**

PR URL, main에 올라간 커밋 범위, Vercel 배포 트리거 사실, `https://dokyum-portfolio.vercel.app/work/touchpoint#system` 링크, 그리고 사용자가 메인 체크아웃에서 `git pull --ff-only github main`으로 로컬 main을 맞출 수 있다는 점을 보고한다.
