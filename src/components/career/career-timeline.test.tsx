import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { careerEntries, educationEntries } from "@/content/career";
import { getProjectsByKind } from "@/content/projects";
import { CareerTimeline } from "./career-timeline";

const independentProjects = getProjectsByKind("independent");

function renderTimeline() {
  return render(
    <CareerTimeline
      careers={careerEntries}
      projects={independentProjects}
      education={educationEntries}
    />,
  );
}

describe("CareerTimeline", () => {
  it("renders every career and education entry", () => {
    renderTimeline();
    for (const entry of careerEntries) {
      expect(screen.getByRole("heading", { name: entry.company })).toBeInTheDocument();
      expect(screen.getByText(entry.period)).toBeInTheDocument();
    }
    for (const entry of educationEntries) {
      expect(screen.getByText(entry.institution)).toBeInTheDocument();
    }
  });

  it("links career evidence to canonical project pages", () => {
    renderTimeline();
    expect(screen.getByRole("link", { name: "Snode 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/snode",
    );
    expect(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/butlerlee",
    );
  });

  it("lists independent projects after employment and before education", () => {
    const { container } = renderTimeline();
    const sections = Array.from(container.querySelectorAll(".career-timeline > section"));
    expect(sections.map((section) => section.className)).toEqual([
      "career-history",
      "career-independent",
      "career-education",
    ]);
    expect(container.querySelector(".career-history")).not.toHaveTextContent("Touchpoint");
    expect(screen.getByRole("heading", { name: "Touchpoint" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Touchpoint 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/touchpoint",
    );
  });
});
