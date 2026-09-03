import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProjectNeighbors } from "@/content/projects";
import { ProjectNavigation } from "./project-navigation";

describe("ProjectNavigation", () => {
  it("shows only the next project at the beginning", () => {
    render(<ProjectNavigation slug="snode" />);

    expect(screen.queryByText("이전 프로젝트")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /다음 프로젝트.*Coffeeting/ }),
    ).toHaveAttribute("href", "/work/coffeeting");
  });

  it("shows both neighbors in the middle", () => {
    render(<ProjectNavigation slug="coffeeting" />);

    expect(
      screen.getByRole("link", { name: /이전 프로젝트.*Snode/ }),
    ).toHaveAttribute("href", "/work/snode");
    expect(
      screen.getByRole("link", { name: /다음 프로젝트.*Matching Admin/ }),
    ).toHaveAttribute("href", "/work/matching-admin");
  });

  it("shows only the previous project at the end", () => {
    render(<ProjectNavigation slug="touchpoint" />);

    expect(
      screen.getByRole("link", { name: /이전 프로젝트.*Butlerlee/ }),
    ).toHaveAttribute("href", "/work/butlerlee");
    expect(screen.queryByText("다음 프로젝트")).not.toBeInTheDocument();
  });

  it("renders each neighbor's card image as a decorative hover preview", () => {
    const { previous, next } = getProjectNeighbors("coffeeting");
    const { container } = render(<ProjectNavigation slug="coffeeting" />);

    const thumbs = Array.from(container.querySelectorAll(".work-navigation-thumb"));
    expect(thumbs.map((thumb) => thumb.getAttribute("aria-hidden"))).toEqual(["true", "true"]);
    expect(
      thumbs.map((thumb) => thumb.querySelector("img")?.getAttribute("src")),
    ).toEqual([`/${previous!.media.card}`, `/${next!.media.card}`]);
  });
});
