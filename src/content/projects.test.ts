import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getProjectBySlug,
  getProjectNeighbors,
  getProjectsByKind,
  projects,
  type Project,
} from "./projects";

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

  it("keeps every slug, route, and problem line unique", () => {
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(6);
    expect(new Set(projects.map(({ route }) => route)).size).toBe(6);
    expect(new Set(projects.map(({ problemLine }) => problemLine)).size).toBe(6);
    expect(projects.every(({ problemLine }) => problemLine.length > 0)).toBe(true);
  });

  it("describes every project with hashtags for the Work menu", () => {
    for (const project of projects) {
      expect(project.tags.length).toBeGreaterThanOrEqual(3);
      expect(project.tags.every((tag) => tag.startsWith("#") && !tag.includes(" "))).toBe(true);
    }
  });

  it("does not publish unverified Touchpoint traction", () => {
    const touchpoint = getProjectBySlug("touchpoint");
    expect(touchpoint?.story.outcome.title).toContain("검증 전");
    expect(touchpoint?.story.outcome.shift).toBeUndefined();
    expect(touchpoint?.story.takeaways).toEqual([]);
    const system = touchpoint?.story.chapters.find((chapter) => chapter.id === "system");
    expect(system?.label).toBe("시스템 구조");
    expect(system?.diagram?.id).toBe("touchpoint-harness");
    const text = JSON.stringify(touchpoint?.story);
    expect(text).not.toMatch(/매출|사용자 수|예약 수|방문자/);
    expect(touchpoint?.problemLine).toContain("AI");
    expect(touchpoint?.tags).toContain("#AI하네스");
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

  it("ships every project asset, case-study image, and the PDF locally", () => {
    const typedProjects: readonly Project[] = projects;
    for (const project of typedProjects) {
      const { story } = project;
      const media = [
        story.hero,
        ...story.chapters.flatMap((chapter) => chapter.media ?? []),
        ...(story.outcome.media ?? []),
        ...(story.expansion?.media ?? []),
      ];
      expect(existsSync(join(process.cwd(), "public", project.media.card))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", project.media.logo))).toBe(true);
      for (const item of media) {
        expect(existsSync(join(process.cwd(), "public", item.src)), item.src).toBe(true);
      }
    }

    expect(existsSync(join(process.cwd(), "public/dokyum-kim-portfolio.pdf"))).toBe(true);
  });
});
