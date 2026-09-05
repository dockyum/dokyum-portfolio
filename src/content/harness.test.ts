import { describe, expect, it } from "vitest";

import {
  formatCount,
  harnessCounts,
  knowledgeTitles,
  textHeight,
  touchpointHarness,
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

describe("formatCount", () => {
  it("groups thousands the way the portfolio prints them", () => {
    expect(formatCount(1009)).toBe("1,009");
    expect(formatCount(47)).toBe("47");
  });
});
