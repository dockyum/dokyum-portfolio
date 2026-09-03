"use client";

import Image from "next/image";
import type { CSSProperties, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { Fragment, useEffect, useRef, useState } from "react";

import { projectKindLabels, type Project } from "@/content/projects";

const thesis = "제품 밖의 병목까지 찾아, 사업이 흐르는 구조로 바꿉니다.";
const thesisWords = thesis.split(" ");
const DRAG_THRESHOLD = 6;

type DragState = {
  startX: number;
  startScrollLeft: number;
  distance: number;
  suppressClick: boolean;
};

export function ProjectRunway({ projects }: { projects: readonly Project[] }) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>({
    startX: 0,
    startScrollLeft: 0,
    distance: 0,
    suppressClick: false,
  });
  const endDragRef = useRef<(() => void) | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => endDragRef.current?.(), []);

  function getCards() {
    return Array.from(runwayRef.current?.querySelectorAll<HTMLElement>(".project-card") ?? []);
  }

  function syncActiveIndex() {
    const runway = runwayRef.current;
    if (!runway) return;
    const center = runway.scrollLeft + runway.clientWidth / 2;
    const closest = getCards().reduce(
      (best, card, index) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    setActiveIndex(closest.index);
  }

  function showCard(index: number) {
    if (index < 0 || index >= projects.length) return;
    setActiveIndex(index);
    getCards()[index]?.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const runway = runwayRef.current;
    if (!runway || event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startScrollLeft: runway.scrollLeft,
      distance: 0,
      suppressClick: false,
    };

    const move = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - dragRef.current.startX;
      dragRef.current.distance = Math.max(dragRef.current.distance, Math.abs(delta));
      if (dragRef.current.distance > DRAG_THRESHOLD) setDragging(true);
      runway.scrollLeft = dragRef.current.startScrollLeft - delta;
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      endDragRef.current = null;
      setDragging(false);
      if (dragRef.current.distance > DRAG_THRESHOLD) {
        // The click that ends a real drag fires right after pointerup; swallow only that one.
        dragRef.current.suppressClick = true;
        setTimeout(() => {
          dragRef.current.suppressClick = false;
        }, 0);
      }
    };
    endDragRef.current = end;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  function swallowDragClick(event: MouseEvent<HTMLDivElement>) {
    if (!dragRef.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <p className="landing-masthead" aria-hidden="true">DOKYUM KIM</p>
      <div className="landing-thesis">
        <p>BUILDING BEYOND THE PRODUCT</p>
        <h1 id="landing-title">
          {thesisWords.map((word, index) => (
            <Fragment key={word}>
              {index > 0 ? " " : null}
              <span
                className="landing-thesis-word"
                style={{ animationDelay: `${(0.2 + index * 0.06).toFixed(2)}s` }}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
      </div>
      <div
        className={dragging ? "project-runway is-dragging" : "project-runway"}
        aria-label="프로젝트 카드 목록"
        ref={runwayRef}
        onScroll={syncActiveIndex}
        onPointerDown={startDrag}
        onClickCapture={swallowDragClick}
      >
        {projects.map((project, index) => (
          <a
            className="project-card"
            href={project.route}
            draggable={false}
            key={project.slug}
            aria-label={`${project.name} 프로젝트 보기`}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
            style={{ "--project-index": index, position: "relative" } as CSSProperties}
          >
            <span className="sr-only">{project.name}: {project.activeLine}</span>
            <span className="project-card-image">
              <Image
                src={`/${project.media.card}`}
                alt={project.media.alt}
                fill
                preload={index === 0}
                draggable={false}
                sizes="(max-width: 767px) 78vw, (max-width: 1199px) 40vw, 24vw"
              />
            </span>
            <span className="project-card-logo" aria-hidden="true">
              <span className="project-card-logo-image">
                <Image src={`/${project.media.logo}`} alt="" fill draggable={false} sizes="180px" />
              </span>
            </span>
          </a>
        ))}
      </div>
      <div className="project-runway-meta">
        <div className="project-runway-status" aria-live="polite">
          <p className="project-runway-count">
            {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <p className="project-runway-name">
            <span className="project-runway-kind">
              {projectKindLabels[projects[activeIndex].kind]}
            </span>
            {projects[activeIndex].name}
          </p>
          <p className="project-runway-outcome">{projects[activeIndex].activeLine}</p>
        </div>
        <div className="project-runway-controls">
          <button
            type="button"
            aria-label="이전 프로젝트 카드"
            aria-disabled={activeIndex === 0}
            onClick={() => showCard(activeIndex - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="다음 프로젝트 카드"
            aria-disabled={activeIndex === projects.length - 1}
            onClick={() => showCard(activeIndex + 1)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
