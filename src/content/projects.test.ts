import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getProjectBySlug, getProjectNeighbors, getProjectsByKind, projects } from "./projects";

describe("projects", () => {
  it("keeps the resume order: career work first, independent projects last", () => {
    expect(projects.map(({ slug }) => slug)).toEqual([
      "snode",
      "coffeeting",
      "matching-admin",
      "moum",
      "butlerlee",
      "touchpoint",
    ]);
  });

  it("never places a career project after an independent one", () => {
    const kinds = projects.map(({ kind }) => kind);
    const firstIndependent = kinds.indexOf("independent");
    expect(firstIndependent).toBeGreaterThan(0);
    expect(kinds.slice(0, firstIndependent).every((kind) => kind === "career")).toBe(true);
    expect(kinds.slice(firstIndependent).every((kind) => kind === "independent")).toBe(true);
    expect(getProjectsByKind("independent").map(({ slug }) => slug)).toEqual(["touchpoint"]);
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
    expect(getProjectNeighbors("snode").previous).toBeUndefined();
    expect(getProjectNeighbors("snode").next?.slug).toBe("coffeeting");
    expect(getProjectNeighbors("matching-admin")).toMatchObject({
      previous: { slug: "coffeeting" },
      next: { slug: "moum" },
    });
    expect(getProjectNeighbors("touchpoint").next).toBeUndefined();
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
