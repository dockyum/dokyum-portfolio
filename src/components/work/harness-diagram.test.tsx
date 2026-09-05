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
