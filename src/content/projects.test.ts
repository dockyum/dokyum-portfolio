import { existsSync } from "node:fs";
import { join } from "node:path";
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

  it("keeps resume-backed periods for projects with supplied dates", () => {
    expect(projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "touchpoint", period: "2026–NOW" }),
        expect.objectContaining({ slug: "butlerlee", period: "2022.03–2022.09" }),
        expect.objectContaining({ slug: "snode", period: "2025.05–2026.02" }),
        expect.objectContaining({ slug: "moum", period: "2022.10–2023.01" }),
      ]),
    );
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

  it("ships every required project asset and the PDF locally", () => {
    for (const project of projects) {
      expect(existsSync(join(process.cwd(), "public", project.media.card))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", project.media.hero))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", project.media.logo))).toBe(true);
    }

    expect(existsSync(join(process.cwd(), "public/dokyum-kim-portfolio.pdf"))).toBe(true);
  });
});
