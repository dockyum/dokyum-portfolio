import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { HarnessViewer } from "./harness-viewer";

const viewBox = { width: 1600, height: 1000 };
const steps = Array.from({ length: 12 }, (_, index) => `단계 ${index + 1}`);
const title = "테스트 다이어그램";

// jsdom에는 dialog.showModal/close와 레이아웃(clientWidth/Height)이 없다. 스테이지만 1200×800으로 둔다.
beforeAll(() => {
  const dialog = HTMLDialogElement.prototype as { showModal?: () => void; close?: () => void };
  if (!dialog.showModal) {
    dialog.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!dialog.close) {
    dialog.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("work-system-stage") ? 1200 : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("work-system-stage") ? 800 : 0;
    },
  });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
});

function renderViewer() {
  return render(
    <HarnessViewer
      title={title}
      inline={<span>inline</span>}
      full={<span>full</span>}
      steps={steps}
      viewBox={viewBox}
    />,
  );
}

function canvasTransform() {
  const canvas = document.querySelector<HTMLElement>(".work-system-canvas")!;
  const translate = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(canvas.style.transform)!;
  const scale = /scale\(([\d.]+)\)/.exec(canvas.style.transform)!;
  return { x: Number(translate[1]), y: Number(translate[2]), scale: Number(scale[1]) };
}

function openViewer() {
  const trigger = screen.getByRole("button", { name: `${title} 크게 보기` });
  fireEvent.click(trigger);
  return { trigger, stage: screen.getByRole("application", { name: "다이어그램 이동 영역" }) };
}

describe("HarnessViewer", () => {
  it("shows both hint variants and the screen-reader step list", () => {
    const { container } = renderViewer();
    expect(screen.getByText("클릭해서 크게 보기")).toBeInTheDocument();
    expect(screen.getByText("탭해서 크게 보기")).toBeInTheDocument();
    expect(container.querySelectorAll("ol.sr-only li")).toHaveLength(12);
    expect(screen.getByRole("button", { name: `${title} 크게 보기` })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens the dialog, locks page scroll, fits the diagram to cover the stage, and focuses the stage", () => {
    renderViewer();
    const { trigger, stage } = openViewer();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: title })).toHaveAttribute("open");
    expect(document.body.style.overflow).toBe("hidden");
    expect(stage).toHaveFocus();
    // cover = max(1200/1600, 800/1000) = 0.8, 왼쪽 정렬, 세로 중앙
    expect(canvasTransform()).toEqual({ x: 0, y: 0, scale: 0.8 });
  });

  it("pans with pointer drag and reports the dragging state", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.pointerDown(stage, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 300, clientY: 300 });
    expect(stage).toHaveAttribute("data-dragging", "true");
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 420, clientY: 330 });
    expect(canvasTransform()).toMatchObject({ x: 120, y: 30 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(stage).toHaveAttribute("data-dragging", "false");
  });

  it("ignores secondary mouse buttons", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.pointerDown(stage, { pointerId: 2, pointerType: "mouse", button: 2, clientX: 0, clientY: 0 });
    expect(stage).toHaveAttribute("data-dragging", "false");
  });

  it("zooms with the wheel and clamps between 0.5× and 4× of the fit scale", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0 });
    expect(canvasTransform().scale).toBeCloseTo(0.88, 5);
    for (let index = 0; index < 40; index += 1) fireEvent.wheel(stage, { deltaY: 100, clientX: 0, clientY: 0 });
    // fit = min(1200/1600, 800/1000) = 0.75 → 최소 0.375
    expect(canvasTransform().scale).toBeCloseTo(0.375, 5);
    for (let index = 0; index < 80; index += 1) fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0 });
    expect(canvasTransform().scale).toBeCloseTo(3, 5);
  });

  it("pans and zooms from the keyboard and refits with 0", () => {
    renderViewer();
    const { stage } = openViewer();
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(canvasTransform().x).toBe(40);
    fireEvent.keyDown(stage, { key: "+" });
    expect(canvasTransform().scale).toBeCloseTo(1, 5);
    fireEvent.keyDown(stage, { key: "0" });
    expect(canvasTransform()).toEqual({ x: 0, y: 0, scale: 0.8 });
  });

  it("refits from the toolbar and closes with the close button, restoring scroll and focus", () => {
    renderViewer();
    const { trigger } = openViewer();
    fireEvent.click(screen.getByRole("button", { name: "확대" }));
    expect(canvasTransform().scale).toBeCloseTo(1, 5);
    fireEvent.click(screen.getByRole("button", { name: "맞춤" }));
    expect(canvasTransform().scale).toBeCloseTo(0.8, 5);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape", () => {
    renderViewer();
    const { trigger } = openViewer();
    fireEvent.keyDown(screen.getByRole("dialog", { name: title }), { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
