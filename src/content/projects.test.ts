import { describe, expect, it } from "vitest";

import { getProjectBySlug, getProjectNeighbors, projects } from "./projects";

describe("projects", () => {
  it("keeps the approved canonical order", () => {
    expect(projects.map(({ slug }) => slug)).toEqual([
      "touchpoint",
      "butlerlee",
      "snode",
      "coffeeting",
      "matching-admin",
      "moum",
    ]);
  });

  it("keeps every slug, route, and landing line unique", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(6);
    expect(new Set(projects.map(({ route }) => route)).size).toBe(6);
    expect(projects.every(({ activeLine }) => activeLine.length > 0)).toBe(true);
  });

  it("does not publish unverified Touchpoint traction", () => {
    const touchpoint = getProjectBySlug("touchpoint");
    expect(touchpoint?.verifiedMetrics).toEqual([]);
    expect(touchpoint?.sections.outcome.join(" ")).toContain("검증 전");
  });

  it("returns only existing neighbors", () => {
    expect(getProjectNeighbors("touchpoint").previous).toBeUndefined();
    expect(getProjectNeighbors("touchpoint").next?.slug).toBe("butlerlee");
    expect(getProjectNeighbors("snode")).toMatchObject({
      previous: { slug: "butlerlee" },
      next: { slug: "coffeeting" },
    });
    expect(getProjectNeighbors("moum").next).toBeUndefined();
  });
});
