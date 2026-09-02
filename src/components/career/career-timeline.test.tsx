import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { careerEntries, educationEntries } from "@/content/career";
import { CareerTimeline } from "./career-timeline";

describe("CareerTimeline", () => {
  it("renders every career and education entry", () => {
    render(<CareerTimeline careers={careerEntries} education={educationEntries} />);
    for (const entry of careerEntries) {
      expect(screen.getByRole("heading", { name: entry.company })).toBeInTheDocument();
      expect(screen.getByText(entry.period)).toBeInTheDocument();
    }
    for (const entry of educationEntries) {
      expect(screen.getByText(entry.institution)).toBeInTheDocument();
    }
  });

  it("links career evidence to canonical project pages", () => {
    render(<CareerTimeline careers={careerEntries} education={educationEntries} />);
    expect(screen.getByRole("link", { name: "Snode 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/snode",
    );
    expect(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/butlerlee",
    );
  });
});
