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
  /** 2026-02-24 첫 커밋 → 2026-09-03: 6개월 10일. 올림하지 않는다. */
  months: 6,
  commits: 1009,
  mergedPrs: 827,
  releases: 47,
  testFiles: 528,
  migrations: 103,
} as const;

/** 1009 → "1,009" */
export function formatCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

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
