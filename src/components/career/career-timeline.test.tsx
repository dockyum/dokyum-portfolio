import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { careerEntries, educationEntries, independentEntries } from "@/content/career";
import { CareerTimeline } from "./career-timeline";

function renderTimeline() {
  return render(
    <CareerTimeline
      careers={careerEntries}
      independent={independentEntries}
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

  it("lists independent work after employment and before education", () => {
    const { container } = renderTimeline();
    const sections = Array.from(container.querySelectorAll(".career-timeline > section"));
    expect(sections.map((section) => section.className)).toEqual([
      "career-history",
      "career-independent",
      "career-education",
    ]);
    const history = container.querySelector(".career-history")!;
    expect(history).not.toHaveTextContent("Touchpoint");
    expect(history).not.toHaveTextContent("피그위");

    const independent = within(container.querySelector<HTMLElement>(".career-independent")!);
    expect(independent.getByText("INDEPENDENT")).toBeInTheDocument();
    expect(independent.getByRole("heading", { name: "개인 프로젝트" })).toBeInTheDocument();
    expect(independent.getByRole("heading", { name: "Touchpoint" })).toBeInTheDocument();
    expect(independent.getByRole("heading", { name: "피그위" })).toBeInTheDocument();
    expect(independent.getByText("2016.10–2018.11")).toBeInTheDocument();
    expect(independent.getByRole("link", { name: "Touchpoint 프로젝트 보기" })).toHaveAttribute(
      "href",
      "/work/touchpoint",
    );
    expect(independent.queryByRole("link", { name: /피그위/ })).toBeNull();
  });

  it("anchors the independent section for deep links", () => {
    const { container } = renderTimeline();
    expect(container.querySelector(".career-independent")).toHaveAttribute("id", "independent");
  });
});
