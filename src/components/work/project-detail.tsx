import Image from "next/image";
import type { CSSProperties } from "react";

import { projects, type Project } from "@/content/projects";

import { ProjectNavigation } from "./project-navigation";

const chapters = [
  { key: "problem", label: "문제와 맥락" },
  { key: "judgment", label: "핵심 판단" },
  { key: "execution", label: "실행과 운영 변화" },
  { key: "outcome", label: "성과와 학습" },
] as const;

type ProjectStyle = CSSProperties & { "--project-accent": string };

export function ProjectDetail({ project }: { project: Project }) {
  const projectStyle: ProjectStyle = { "--project-accent": project.media.accent };
  const projectIndex = projects.findIndex(({ slug }) => slug === project.slug) + 1;

  return (
    <main className="work-page" style={projectStyle}>
      <header className="work-hero">
        <div className="work-hero-copy">
          <p className="work-index">
            {String(projectIndex).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
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
          <dl className="work-meta">
            <div>
              <dt className="work-meta-label">ROLE</dt>
              <dd>{project.role}</dd>
            </div>
            {project.period ? (
              <div>
                <dt className="work-meta-label">PERIOD</dt>
                <dd>{project.period}</dd>
              </div>
            ) : null}
            <div>
              <dt className="work-meta-label">TEAM</dt>
              <dd>{project.team}</dd>
            </div>
          </dl>
          <h1>{project.heroOutcome}</h1>
          <div className="work-summary">
            {project.sections.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
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
          <dl className="work-metrics-list">
            {project.verifiedMetrics.map((metric) => (
              <div key={metric}>
                <dt className="work-metric-label">VERIFIED METRIC</dt>
                <dd className="work-metric-value">{metric}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <article className="work-story">
        {chapters.map((chapter, index) => (
          <section className="work-story-section" key={chapter.key}>
            <div className="work-story-heading">
              <span className="work-story-index">{String(index + 1).padStart(2, "0")}</span>
              <h2>{chapter.label}</h2>
            </div>
            <div className="work-story-body">
              {project.sections[chapter.key].map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </article>

      <ProjectNavigation slug={project.slug} />
    </main>
  );
}
