import Image from "next/image";
import type { CSSProperties } from "react";

import type { Project } from "@/content/projects";

import { ProjectNavigation } from "./project-navigation";

const sectionLabels = {
  overview: "프로젝트 개요",
  problem: "문제 정의",
  judgment: "핵심 판단",
  execution: "실행",
  outcome: "성과와 학습",
} as const;

type ProjectStyle = CSSProperties & { "--project-accent": string };

export function ProjectDetail({ project }: { project: Project }) {
  const projectStyle: ProjectStyle = { "--project-accent": project.media.accent };

  return (
    <main className="work-page" style={projectStyle}>
      <header className="work-hero">
        <div className="work-hero-copy">
          <p className="work-kicker">{project.category}</p>
          <div className="work-logo">
            <span className="work-logo-image">
              <Image
                src={`/${project.media.logo}`}
                alt={`${project.name} 로고`}
                fill
                loading="eager"
                sizes="176px"
              />
            </span>
          </div>
          <h1>{project.heroOutcome}</h1>
          <p className="work-summary">{project.summary}</p>
          <dl className="work-meta">
            <div>
              <dt>ROLE</dt>
              <dd>{project.role}</dd>
            </div>
            {project.period ? (
              <div>
                <dt>PERIOD</dt>
                <dd>{project.period}</dd>
              </div>
            ) : null}
            <div>
              <dt>TEAM</dt>
              <dd>{project.team}</dd>
            </div>
          </dl>
        </div>
        <figure className="work-hero-media">
          <Image
            src={`/${project.media.hero}`}
            alt={project.media.alt}
            fill
            preload
            sizes="(max-width: 767px) 100vw, 56vw"
          />
        </figure>
      </header>

      {project.verifiedMetrics.length > 0 ? (
        <section className="work-metrics" aria-label="주요 성과">
          {project.verifiedMetrics.map((metric) => (
            <p key={metric}>{metric}</p>
          ))}
        </section>
      ) : null}

      <article className="work-story">
        {(Object.keys(sectionLabels) as (keyof typeof sectionLabels)[]).map(
          (sectionKey, index) => (
            <section className="work-story-section" key={sectionKey}>
              <div className="work-story-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{sectionLabels[sectionKey]}</h2>
              </div>
              <div className="work-story-body">
                {project.sections[sectionKey].map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ),
        )}
      </article>

      <ProjectNavigation slug={project.slug} />
    </main>
  );
}
