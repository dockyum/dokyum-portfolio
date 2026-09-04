import { describe, expect, it } from "vitest";

import { getProjectsByKind, projects, type ProjectSlug } from "./projects";
import { careerEntries, educationEntries, independentEntries } from "./career";

describe("career content", () => {
  it("keeps the resume's reverse chronology of employment from 2018", () => {
    expect(careerEntries.map(({ company }) => company)).toEqual([
      "서우노드",
      "커피팅주식회사",
      "프라우들리",
      "룩코",
      "올스케이프",
    ]);
    expect(careerEntries[0].period).toBe("2025.05–2026.02");
    expect(careerEntries.at(-1)?.period).toBe("2018.12–2020.10");
  });

  it("lists independent work newest first, linking Touchpoint and leaving 피그위 unlinked", () => {
    expect(independentEntries.map(({ name }) => name)).toEqual(["Touchpoint", "피그위"]);
    expect(independentEntries[0].projectSlug).toBe("touchpoint");
    expect(independentEntries[0].period).toBe("2026–NOW");
    expect(independentEntries[1].projectSlug).toBeUndefined();
    expect(independentEntries[1].period).toBe("2016.10–2018.11");
  });

  it("links every career project to employment and keeps independent projects out", () => {
    const linked = new Set<ProjectSlug>(careerEntries.flatMap(({ projectSlugs }) => projectSlugs));
    for (const project of getProjectsByKind("career")) {
      expect(linked.has(project.slug)).toBe(true);
    }
    for (const project of getProjectsByKind("independent")) {
      expect(linked.has(project.slug)).toBe(false);
      expect(independentEntries.some((entry) => entry.projectSlug === project.slug)).toBe(true);
    }
  });

  it("links only to canonical project slugs", () => {
    const slugs = new Set(projects.map(({ slug }) => slug));
    expect(
      careerEntries.flatMap(({ projectSlugs }) => projectSlugs).every((slug) =>
        slugs.has(slug),
      ),
    ).toBe(true);
  });

  it("keeps the three education entries", () => {
    expect(educationEntries).toHaveLength(3);
  });
});
