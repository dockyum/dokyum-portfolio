import { describe, expect, it } from "vitest";

import { projects } from "./projects";
import { careerEntries, educationEntries } from "./career";

describe("career content", () => {
  it("keeps the complete reverse chronology from 2016 to now", () => {
    expect(careerEntries.map(({ company }) => company)).toEqual([
      "Touchpoint",
      "서우노드",
      "커피팅주식회사",
      "프라우들리",
      "룩코",
      "올스케이프",
      "피그위",
    ]);
    expect(careerEntries[0].period).toBe("2026–NOW");
    expect(careerEntries.at(-1)?.period).toBe("2016.10–2018.11");
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
