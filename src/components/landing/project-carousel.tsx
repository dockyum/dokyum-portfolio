"use client";

import Image from "next/image";
import type { CSSProperties, KeyboardEvent, PointerEvent, WheelEvent } from "react";
import { useRef, useState } from "react";

import type { Project } from "@/content/projects";

type CardStyle = CSSProperties & {
  "--card-accent": string;
  "--card-distance": number;
  "--card-scale": number;
  "--card-z": number;
};

const DRAG_THRESHOLD = 48;
const WHEEL_THRESHOLD = 80;
const WHEEL_LOCK_MS = 320;

export function ProjectCarousel({ projects }: { projects: readonly Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const wheelAccumulator = useRef(0);
  const lastWheelChange = useRef(0);
  const activeProject = projects[activeIndex];

  const select = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, projects.length - 1)));
  };

  const previous = () => select(activeIndex - 1);
  const next = () => select(activeIndex + 1);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }

    if (event.key === "Home") {
      event.preventDefault();
      select(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      select(projects.length - 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    pointerStart.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (pointerStart.current === null) return;

    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;

    if (distance > DRAG_THRESHOLD) previous();
    if (distance < -DRAG_THRESHOLD) next();
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    const now = Date.now();
    wheelAccumulator.current += Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

    if (
      Math.abs(wheelAccumulator.current) < WHEEL_THRESHOLD ||
      now - lastWheelChange.current < WHEEL_LOCK_MS
    ) {
      return;
    }

    if (wheelAccumulator.current > 0) next();
    if (wheelAccumulator.current < 0) previous();

    wheelAccumulator.current = 0;
    lastWheelChange.current = now;
  };

  return (
    <section
      className="project-carousel"
      role="region"
      aria-label="프로젝트 둘러보기"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onWheel={handleWheel}
    >
      <div className="project-deck" aria-label="프로젝트 카드 목록">
        {projects.map((project, index) => {
          const distance = index - activeIndex;
          const absoluteDistance = Math.abs(distance);
          const isActive = index === activeIndex;
          const style: CardStyle = {
            "--card-accent": project.media.accent,
            "--card-distance": distance,
            "--card-scale": Math.max(0.58, 1 - absoluteDistance * 0.13),
            "--card-z": projects.length - absoluteDistance,
          };

          return (
            <a
              className="project-card"
              data-active={isActive ? "true" : "false"}
              data-distance={absoluteDistance}
              href={project.route}
              key={project.slug}
              aria-label={`${project.name} 프로젝트 보기`}
              aria-current={isActive ? "true" : undefined}
              onClick={(event) => {
                if (!isActive) {
                  event.preventDefault();
                  select(index);
                }
              }}
              style={style}
            >
              <span className="project-card-image">
                <Image
                  src={`/${project.media.card}`}
                  alt={project.media.alt}
                  fill
                  priority={index < 3}
                  sizes="(max-width: 767px) 76vw, (max-width: 1199px) 42vw, 31vw"
                />
              </span>
              <span className="project-card-shade" aria-hidden="true" />
              <span className="project-card-logo" aria-hidden="true">
                <Image
                  src={`/${project.media.logo}`}
                  alt=""
                  width={180}
                  height={60}
                  sizes="180px"
                />
              </span>
            </a>
          );
        })}
      </div>

      <div className="project-stage-copy" aria-live="polite">
        <p className="project-eyebrow">BUILDING BEYOND THE PRODUCT</p>
        <p className="project-active-line">
          <span>{activeProject.name}</span>
          <span aria-hidden="true"> — </span>
          {activeProject.activeLine}
        </p>
        <h1>
          <span>제품 밖의 병목까지,</span>
          <span>사업이 흐르도록 다시 설계합니다.</span>
        </h1>
      </div>

      <div className="project-controls" aria-label="프로젝트 선택">
        <p aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span aria-hidden="true"> / </span>
          <span>{String(projects.length).padStart(2, "0")}</span>
        </p>
        <div>
          <button type="button" onClick={previous} disabled={activeIndex === 0}>
            <span aria-hidden="true">←</span>
            <span className="sr-only">이전 프로젝트</span>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={activeIndex === projects.length - 1}
          >
            <span aria-hidden="true">→</span>
            <span className="sr-only">다음 프로젝트</span>
          </button>
        </div>
      </div>
    </section>
  );
}
