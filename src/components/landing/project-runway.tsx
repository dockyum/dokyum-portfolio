"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useRef, useState } from "react";

import { projectKindLabels, type Project } from "@/content/projects";

export function ProjectRunway({ projects }: { projects: readonly Project[] }) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function syncActiveIndex() {
    const runway = runwayRef.current;
    if (!runway) return;
    const center = runway.scrollLeft + runway.clientWidth / 2;
    const cards = Array.from(runway.querySelectorAll<HTMLElement>(".project-card"));
    const closest = cards.reduce(
      (best, card, index) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    setActiveIndex(closest.index);
  }

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <p className="landing-masthead" aria-hidden="true">DOKYUM KIM</p>
      <div className="landing-thesis">
        <p>BUILDING BEYOND THE PRODUCT</p>
        <h1 id="landing-title">제품 밖의 병목까지 찾아, 사업이 흐르는 구조로 바꿉니다.</h1>
      </div>
      <div
        className="project-runway"
        aria-label="프로젝트 카드 목록"
        ref={runwayRef}
        onScroll={syncActiveIndex}
      >
        {projects.map((project, index) => (
          <a
            className="project-card"
            href={project.route}
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
                sizes="(max-width: 767px) 78vw, (max-width: 1199px) 40vw, 24vw"
              />
            </span>
            <span className="project-card-logo" aria-hidden="true">
              <span className="project-card-logo-image">
                <Image src={`/${project.media.logo}`} alt="" fill sizes="180px" />
              </span>
            </span>
          </a>
        ))}
      </div>
      <div className="project-runway-meta" aria-live="polite">
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
    </section>
  );
}
