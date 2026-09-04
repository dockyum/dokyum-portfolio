import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AskDockyTrigger } from "./ask-docky-trigger";

function mountTarget() {
  const section = document.createElement("section");
  section.id = "ask-docky";
  const input = document.createElement("input");
  section.appendChild(input);
  document.body.appendChild(section);

  return { section, input };
}

describe("AskDockyTrigger", () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("renders a labelled button that controls the chat section", () => {
    render(<AskDockyTrigger />);

    const button = screen.getByRole("button", { name: "docky에게 물어보기" });
    expect(button).toHaveAttribute("aria-controls", "ask-docky");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button).not.toHaveAttribute("data-hidden");
  });

  it("scrolls to the chat section and focuses its input", async () => {
    const { section, input } = mountTarget();
    render(<AskDockyTrigger />);

    await userEvent.click(screen.getByRole("button", { name: "docky에게 물어보기" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(scrollIntoView.mock.instances[0]).toBe(section);
    expect(input).toHaveFocus();
  });

  it("uses an instant scroll when the visitor prefers reduced motion", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    mountTarget();
    render(<AskDockyTrigger />);

    await userEvent.click(screen.getByRole("button", { name: "docky에게 물어보기" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("hides while the chat section is in view", () => {
    let callback: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = observe;
        disconnect = disconnect;
        constructor(cb: typeof callback) {
          callback = cb;
        }
      },
    );
    const { section } = mountTarget();
    const { unmount } = render(<AskDockyTrigger />);
    const button = screen.getByRole("button", { name: "docky에게 물어보기" });

    expect(observe).toHaveBeenCalledWith(section);
    act(() => callback([{ isIntersecting: true }]));
    expect(button).toHaveAttribute("data-hidden", "true");
    expect(button).toHaveAttribute("tabindex", "-1");

    act(() => callback([{ isIntersecting: false }]));
    expect(button).not.toHaveAttribute("data-hidden");
    expect(button).toHaveAttribute("tabindex", "0");

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
