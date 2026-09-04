"use client";

import Image from "next/image";
import type {
  FocusEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent,
} from "react";
import { Fragment, useEffect, useRef, useState } from "react";

import { projectKindLabels, type Project } from "@/content/projects";

const thesisLines = ["제품 너머 병목까지 찾아,", "사업이 성장하는 구조를 만듭니다."] as const;
const thesisWords = thesisLines.map((line) => line.split(" "));
const DRIFT_SPEED = 26; // px per second
const DRAG_THRESHOLD = 6;
const MAX_MOMENTUM = 2400;
const REVEAL_MARGIN = 24;

type Motion = {
  offset: number;
  speed: number;
  target: number;
  momentum: number;
  reduced: boolean;
  hoverPaused: boolean;
  focusPaused: boolean;
};

type Drag = {
  active: boolean;
  captured: boolean;
  moved: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  suppressClick: boolean;
};

export function ProjectRunway({ projects }: { projects: readonly Project[] }) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<Motion>({
    offset: 0,
    speed: 0,
    target: 0,
    momentum: 0,
    reduced: false,
    hoverPaused: false,
    focusPaused: false,
  });
  const dragRef = useRef<Drag>({
    active: false,
    captured: false,
    moved: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    suppressClick: false,
  });
  const [dragging, setDragging] = useState(false);

  function applyOffset() {
    const track = trackRef.current;
    if (!track) return;
    const motion = motionRef.current;
    // The strip is rendered twice, so wrapping at half the width keeps the loop seamless.
    const loop = track.scrollWidth / 2;
    if (loop > 0) motion.offset = ((motion.offset % loop) + loop) % loop;
    track.style.transform = `translate3d(${-motion.offset}px, 0, 0)`;
  }

  function syncDriftTarget() {
    const motion = motionRef.current;
    motion.target =
      motion.reduced || motion.hoverPaused || motion.focusPaused ? 0 : DRIFT_SPEED;
  }

  useEffect(() => {
    const motion = motionRef.current;
    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const applyPreference = () => {
      motion.reduced = media?.matches ?? false;
      syncDriftTarget();
    };
    applyPreference();
    media?.addEventListener("change", applyPreference);
    if (typeof requestAnimationFrame !== "function") {
      return () => media?.removeEventListener("change", applyPreference);
    }

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragRef.current.active) {
        motion.speed += (motion.target - motion.speed) * 0.08;
        if (Math.abs(motion.target - motion.speed) < 0.05) motion.speed = motion.target;
        motion.momentum *= Math.pow(0.001, dt);
        if (Math.abs(motion.momentum) < 1) motion.momentum = 0;
        const delta = (motion.speed + motion.momentum) * dt;
        if (delta !== 0) {
          motion.offset += delta;
          applyOffset();
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      media?.removeEventListener("change", applyPreference);
    };
  }, []);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = {
      active: true,
      captured: false,
      moved: 0,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      suppressClick: false,
    };
    motionRef.current.momentum = 0;
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const now = performance.now();
    const dx = event.clientX - drag.lastX;
    drag.moved += Math.abs(dx);
    // Only take the pointer once it is clearly a drag, so a tap still reaches the card link.
    if (!drag.captured && drag.moved > DRAG_THRESHOLD) {
      drag.captured = true;
      setDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is unavailable in some environments; dragging still works.
      }
    }
    if (drag.captured) {
      motionRef.current.offset -= dx;
      drag.velocity = (-dx / Math.max(1, now - drag.lastTime)) * 1000;
      applyOffset();
    }
    drag.lastX = event.clientX;
    drag.lastTime = now;
  }

  function endDrag() {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (!drag.captured) return;
    setDragging(false);
    motionRef.current.momentum = Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, drag.velocity));
    // The click that ends a real drag fires right after pointerup; swallow only that one.
    drag.suppressClick = true;
    setTimeout(() => {
      drag.suppressClick = false;
    }, 0);
  }

  function swallowDragClick(event: MouseEvent<HTMLDivElement>) {
    if (!dragRef.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function nudgeWithWheel(event: WheelEvent<HTMLDivElement>) {
    // Vertical wheel keeps scrolling the page; only sideways trackpad swipes move the strip.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    motionRef.current.offset += event.deltaX;
    applyOffset();
  }

  function pauseForHover(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    motionRef.current.hoverPaused = true;
    syncDriftTarget();
  }

  function resumeAfterHover(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    motionRef.current.hoverPaused = false;
    syncDriftTarget();
  }

  function revealCard(event: FocusEvent<HTMLAnchorElement>) {
    const motion = motionRef.current;
    motion.focusPaused = true;
    syncDriftTarget();
    const card = event.currentTarget;
    const left = card.offsetLeft;
    const right = left + card.offsetWidth;
    const viewWidth = runwayRef.current?.clientWidth ?? 0;
    if (left < motion.offset + REVEAL_MARGIN) {
      motion.offset = Math.max(0, left - REVEAL_MARGIN);
    } else if (viewWidth > 0 && right > motion.offset + viewWidth - REVEAL_MARGIN) {
      motion.offset = right - viewWidth + REVEAL_MARGIN;
    }
    applyOffset();
  }

  function releaseFocus() {
    motionRef.current.focusPaused = false;
    syncDriftTarget();
  }

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-thesis">
        <p>BUILDING BEYOND THE PRODUCT</p>
        <h1 id="landing-title">
          {thesisWords.map((words, lineIndex) => {
            const wordStart = thesisWords
              .slice(0, lineIndex)
              .reduce((count, line) => count + line.length, 0);
            return (
              <Fragment key={thesisLines[lineIndex]}>
                {lineIndex > 0 ? " " : null}
                <span className="landing-thesis-line">
                  {words.map((word, wordIndex) => (
                    <Fragment key={word}>
                      {wordIndex > 0 ? " " : null}
                      <span
                        className="landing-thesis-word"
                        style={{
                          animationDelay: `${(0.2 + (wordStart + wordIndex) * 0.06).toFixed(2)}s`,
                        }}
                      >
                        {word}
                      </span>
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            );
          })}
        </h1>
      </div>
      <div
        className={dragging ? "project-runway is-dragging" : "project-runway"}
        aria-label="프로젝트 카드 목록"
        ref={runwayRef}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={swallowDragClick}
        onWheel={nudgeWithWheel}
      >
        <div className="project-runway-track" ref={trackRef}>
          {[projects, projects].map((set, copy) =>
            set.map((project, index) => {
              const isCopy = copy > 0;
              return (
                <a
                  className={index === 0 ? "project-card is-first" : "project-card"}
                  href={project.route}
                  key={`${copy}-${project.slug}`}
                  data-project={project.slug}
                  draggable={false}
                  aria-label={isCopy ? undefined : `${project.name} 프로젝트 보기`}
                  aria-hidden={isCopy || undefined}
                  tabIndex={isCopy ? -1 : undefined}
                  onPointerEnter={pauseForHover}
                  onPointerLeave={resumeAfterHover}
                  onFocus={isCopy ? undefined : revealCard}
                  onBlur={isCopy ? undefined : releaseFocus}
                >
                  <span className="project-card-caption" aria-hidden="true">
                    <span className="project-card-name">
                      {project.kind === "independent" ? (
                        <span className="project-card-kind">{projectKindLabels[project.kind]}</span>
                      ) : null}
                      {project.name}
                    </span>
                    <span className="project-card-line">{project.problemLine}</span>
                  </span>
                  <span className="project-card-image">
                    <Image
                      src={`/${project.media.card}`}
                      alt={isCopy ? "" : project.media.alt}
                      fill
                      preload={!isCopy && index === 0}
                      draggable={false}
                      sizes="(max-width: 767px) 85vw, 25vw"
                    />
                  </span>
                </a>
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
