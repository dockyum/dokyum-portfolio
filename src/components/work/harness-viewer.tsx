"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const MIN_SCALE_FACTOR = 0.5;
const MAX_SCALE_FACTOR = 4;
const VISIBLE_FRACTION = 0.25;
const KEY_PAN = 40;
const BUTTON_ZOOM = 1.25;
const WHEEL_ZOOM = 1.1;

type Transform = { x: number; y: number; scale: number };
type Size = { width: number; height: number };
type Point = { x: number; y: number };

type HarnessViewerProps = {
  title: string;
  inline: ReactNode;
  full: ReactNode;
  steps: readonly string[];
  viewBox: Size;
};

export function HarnessViewer({ title, inline, full, steps, viewBox }: HarnessViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fitRef = useRef(1);
  const pointers = useRef(new Map<number, Point>());
  const dragRef = useRef<Point | null>(null);
  const pinchRef = useRef<number | null>(null);
  const helpId = useId();
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

  const stageSize = useCallback((): Size => {
    const stage = stageRef.current;
    return { width: stage?.clientWidth ?? 0, height: stage?.clientHeight ?? 0 };
  }, []);

  // 배율은 fit의 0.5배–4배, 다이어그램은 항상 25% 이상 보이도록 잠근다
  const clamp = useCallback(
    (next: Transform): Transform => {
      const { width, height } = stageSize();
      const fit = fitRef.current;
      const scale = Math.min(Math.max(next.scale, fit * MIN_SCALE_FACTOR), fit * MAX_SCALE_FACTOR);
      const drawnWidth = viewBox.width * scale;
      const drawnHeight = viewBox.height * scale;
      return {
        x: Math.min(
          Math.max(next.x, width * VISIBLE_FRACTION - drawnWidth),
          width * (1 - VISIBLE_FRACTION),
        ),
        y: Math.min(
          Math.max(next.y, height * VISIBLE_FRACTION - drawnHeight),
          height * (1 - VISIBLE_FRACTION),
        ),
        scale,
      };
    },
    [stageSize, viewBox.height, viewBox.width],
  );

  // 초기 배율은 cover: 스테이지를 꽉 채우고, 레인 헤더와 INTAKE 레인이 먼저 보이도록 왼쪽 위 정렬
  const fitToStage = useCallback(() => {
    const { width, height } = stageSize();
    if (!width || !height) return;
    fitRef.current = Math.min(width / viewBox.width, height / viewBox.height);
    const cover = Math.max(width / viewBox.width, height / viewBox.height);
    setTransform(clamp({ x: 0, y: 0, scale: cover }));
  }, [clamp, stageSize, viewBox.height, viewBox.width]);

  const zoomAt = useCallback(
    (factor: number, origin: Point) => {
      setTransform((current) => {
        const fit = fitRef.current;
        const scale = Math.min(
          Math.max(current.scale * factor, fit * MIN_SCALE_FACTOR),
          fit * MAX_SCALE_FACTOR,
        );
        const ratio = scale / current.scale;
        return clamp({
          x: origin.x - (origin.x - current.x) * ratio,
          y: origin.y - (origin.y - current.y) * ratio,
          scale,
        });
      });
    },
    [clamp],
  );

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const { width, height } = stageSize();
      zoomAt(factor, { x: width / 2, y: height / 2 });
    },
    [stageSize, zoomAt],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setTransform((current) => clamp({ ...current, x: current.x + dx, y: current.y + dy }));
    },
    [clamp],
  );

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.close === "function") {
        if (dialog.open) dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    pointers.current.clear();
    dragRef.current = null;
    pinchRef.current = null;
    setDragging(false);
    setOpen(true);
  }

  // 네이티브 close(Esc의 cancel 포함)와 상태를 맞춘다
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  // 열릴 때: 맞춤 배율, 스테이지 포커스, 페이지 스크롤 잠금, 창 크기 변경 시 재클램프
  useEffect(() => {
    if (!open) return;
    fitToStage();
    stageRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handleResize = () => {
      const { width, height } = stageSize();
      if (width && height) {
        fitRef.current = Math.min(width / viewBox.width, height / viewBox.height);
      }
      setTransform((current) => clamp(current));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [clamp, fitToStage, open, stageSize, viewBox.height, viewBox.width]);

  // React의 onWheel은 passive라 preventDefault가 안 되므로 네이티브로 등록한다
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !open) return;
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? WHEEL_ZOOM : 1 / WHEEL_ZOOM, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [open, zoomAt]);

  function pointerDistance(): number {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const stage = event.currentTarget;
    if (typeof stage.setPointerCapture === "function") stage.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { x: event.clientX, y: event.clientY };
      setDragging(true);
    } else if (pointers.current.size === 2) {
      dragRef.current = null;
      pinchRef.current = pointerDistance();
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const tracked = pointers.current.get(event.pointerId);
    if (!tracked) return;
    tracked.x = event.clientX;
    tracked.y = event.clientY;
    if (pointers.current.size >= 2 && pinchRef.current !== null) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = event.currentTarget.getBoundingClientRect();
      if (pinchRef.current > 0) {
        zoomAt(distance / pinchRef.current, {
          x: (a.x + b.x) / 2 - rect.left,
          y: (a.y + b.y) / 2 - rect.top,
        });
      }
      pinchRef.current = distance;
      return;
    }
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    panBy(dx, dy);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const stage = event.currentTarget;
    pointers.current.delete(event.pointerId);
    if (typeof stage.hasPointerCapture === "function" && stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 1) {
      const [rest] = [...pointers.current.values()];
      dragRef.current = { x: rest.x, y: rest.y };
    }
    if (pointers.current.size === 0) {
      dragRef.current = null;
      setDragging(false);
    }
  }

  function handleStageKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => panBy(KEY_PAN, 0),
      ArrowRight: () => panBy(-KEY_PAN, 0),
      ArrowUp: () => panBy(0, KEY_PAN),
      ArrowDown: () => panBy(0, -KEY_PAN),
      "+": () => zoomFromCenter(BUTTON_ZOOM),
      "=": () => zoomFromCenter(BUTTON_ZOOM),
      "-": () => zoomFromCenter(1 / BUTTON_ZOOM),
      "0": fitToStage,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog();
  }

  const transformStyle = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;

  return (
    <figure className="work-system-figure">
      <button
        ref={triggerRef}
        type="button"
        className="work-system-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${title} 크게 보기`}
        onClick={openDialog}
      >
        {inline}
        <span className="work-system-hint work-system-hint-pointer" aria-hidden="true">
          클릭해서 크게 보기
        </span>
        <span className="work-system-hint work-system-hint-touch" aria-hidden="true">
          탭해서 크게 보기
        </span>
      </button>
      <ol className="sr-only">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <dialog
        ref={dialogRef}
        className="work-system-dialog"
        aria-label={title}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="work-system-toolbar">
          <span className="work-system-dialog-title">{title}</span>
          <button type="button" onClick={() => zoomFromCenter(1 / BUTTON_ZOOM)} aria-label="축소">
            −
          </button>
          <button type="button" onClick={() => zoomFromCenter(BUTTON_ZOOM)} aria-label="확대">
            +
          </button>
          <button type="button" onClick={fitToStage}>
            맞춤
          </button>
          <button type="button" onClick={closeDialog}>
            닫기
          </button>
        </div>
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- stage is a custom pan/zoom surface; pointer/keyboard handlers drive drag and zoom, not navigation */}
        <div
          ref={stageRef}
          className="work-system-stage"
          role="application"
          aria-label="다이어그램 이동 영역"
          aria-describedby={helpId}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- stage must be keyboard-focusable to receive pan/zoom key commands
          tabIndex={0}
          data-dragging={dragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          onKeyDown={handleStageKeyDown}
        >
          <div
            className="work-system-canvas"
            style={{ width: viewBox.width, height: viewBox.height, transform: transformStyle }}
          >
            {full}
          </div>
        </div>
        <p className="work-system-help" id={helpId}>드래그로 이동 · 휠이나 두 손가락으로 확대 · Esc로 닫기</p>
      </dialog>
    </figure>
  );
}
