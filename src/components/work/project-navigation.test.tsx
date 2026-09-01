import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectNavigation } from "./project-navigation";

describe("ProjectNavigation", () => {
  it("shows only the next project at the beginning", () => {
    render(<ProjectNavigation slug="touchpoint" />);

    expect(screen.queryByText("이전 프로젝트")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /다음 프로젝트.*Butlerlee/ }),
    ).toHaveAttribute("href", "/work/butlerlee");
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
    render(<ProjectNavigation slug="moum" />);

    expect(
      screen.getByRole("link", { name: /이전 프로젝트.*Matching Admin/ }),
    ).toHaveAttribute("href", "/work/matching-admin");
    expect(screen.queryByText("다음 프로젝트")).not.toBeInTheDocument();
  });
});
