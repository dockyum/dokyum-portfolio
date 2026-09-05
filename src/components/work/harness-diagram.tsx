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
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- inline SVG has no implicit img role; role="img" gives it an accessible name
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
