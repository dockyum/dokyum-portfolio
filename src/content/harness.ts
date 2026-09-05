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
