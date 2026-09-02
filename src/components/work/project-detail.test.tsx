import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProjectBySlug } from "@/content/projects";
import { ProjectDetail } from "./project-detail";

describe("ProjectDetail", () => {
  it("puts the verified outcome before the supporting story", () => {
    const project = getProjectBySlug("butlerlee")!;
    const { container } = render(<ProjectDetail project={project} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(project.heroOutcome);
    expect(container.querySelector(".work-metrics")).toHaveTextContent("월 약 800만원");
    expect(screen.getByRole("heading", { name: "핵심 판단" })).toBeInTheDocument();
  });

  it("does not invent metrics for Touchpoint", () => {
    const project = getProjectBySlug("touchpoint")!;
    const { container } = render(<ProjectDetail project={project} />);
    expect(container.querySelector(".work-metrics")).toBeNull();
    expect(screen.getByText(/성장성은 아직 검증 전/)).toBeInTheDocument();
  });

  it("keeps overview in the hero and renders four evidence chapters", () => {
    const project = getProjectBySlug("touchpoint")!;
    const { container } = render(<ProjectDetail project={project} />);
    const story = container.querySelector("article.work-story");

    expect(story?.querySelectorAll(":scope > section")).toHaveLength(4);
    expect(screen.getByRole("heading", { name: "문제와 맥락" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "프로젝트 개요" })).not.toBeInTheDocument();
    expect(screen.getByText(project.sections.overview[0])).toBeInTheDocument();
  });
});
