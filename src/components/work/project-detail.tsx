import Image from "next/image";
import type { CSSProperties } from "react";

import type { CaseChapter, CaseMedia } from "@/content/case-study";
import { projects, type Project } from "@/content/projects";

import { HarnessDiagram } from "./harness-diagram";
import { HarnessViewer } from "./harness-viewer";
import { ProjectNavigation } from "./project-navigation";

const MIN_HERO_RATIO = 1.5;

function defaultSpan(count: number): number {
  if (count === 1) return 12;
  if (count === 3) return 4;
  return 6;
}

function MediaGrid({ media }: { media: readonly CaseMedia[] }) {
  return (
    <div className="work-media" data-count={media.length}>
      {media.map((item) => {
        const span = item.span ?? defaultSpan(media.length);
        const width = Math.round((span / 12) * 94);
        return (
          <figure key={item.src} style={{ "--span": span } as CSSProperties}>
            <Image
              src={`/${item.src}`}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes={`(max-width: 767px) 100vw, ${width}vw`}
            />
            {item.caption ? <figcaption>{item.caption}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}

function Chapter({ chapter, index }: { chapter: CaseChapter; index?: number }) {
  return (
    <section className="work-chapter" id={chapter.id}>
      <div className="work-chapter-text">
        <p className="work-label">
          {index === undefined ? null : <span>{String(index + 1).padStart(2, "0")}</span>}
          {chapter.label}
        </p>
        <h2>{chapter.title}</h2>
        {chapter.lead ? <p className="work-chapter-lead">{chapter.lead}</p> : null}
        {chapter.body?.map((paragraph) => (
          <p className="work-chapter-body" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
      {chapter.quotes ? (
        <ul className="work-quotes">
          {chapter.quotes.map((quote) => (
            <li key={quote}>“{quote}”</li>
          ))}
        </ul>
      ) : null}
      {chapter.groups ? (
        <div className="work-groups">
          {chapter.groups.map((group) => (
            <div className="work-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      {chapter.media ? <MediaGrid media={chapter.media} /> : null}
      {chapter.diagram ? (
        <div className="work-chapter-diagram">
          <HarnessViewer
            title={`${chapter.label} 다이어그램`}
            inline={<HarnessDiagram diagram={chapter.diagram} variant="inline" />}
            full={<HarnessDiagram diagram={chapter.diagram} variant="full" />}
            steps={chapter.diagram.steps}
            viewBox={chapter.diagram.viewBox}
          />
        </div>
      ) : null}
    </section>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const { story } = project;
  const projectIndex = projects.findIndex(({ slug }) => slug === project.slug) + 1;
  const heroRatio = Math.max(story.hero.width / story.hero.height, MIN_HERO_RATIO);
  const pageStyle = {
    "--project-accent": project.media.accent,
    "--hero-ratio": heroRatio.toFixed(3),
    "--hero-position": story.hero.position ?? "50% 50%",
  } as CSSProperties;

  return (
    <main className="work-page" style={pageStyle}>
      <header className="work-hero">
        <p className="work-index">
          {String(projectIndex).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          <span className="work-kicker">{project.category}</span>
        </p>
        <h1>
          <span className="work-title">{project.name}</span>
          <span className="work-tagline">{story.tagline}</span>
        </h1>
      </header>

      <section className="work-intro" aria-label="프로젝트 소개">
        <div className="work-intro-copy">
          <p className="work-headline">{story.headline}</p>
          <p className="work-summary">{project.summary}</p>
        </div>
        <dl className="work-meta">
          <div>
            <dt className="work-label">ROLE</dt>
            <dd>{project.role}</dd>
          </div>
          {project.period ? (
            <div>
              <dt className="work-label">PERIOD</dt>
              <dd>{project.period}</dd>
            </div>
          ) : null}
          <div>
            <dt className="work-label">TEAM</dt>
            <dd>{project.team}</dd>
          </div>
          <div>
            <dt className="work-label">PRODUCT</dt>
            <dd>{project.product}</dd>
          </div>
          {project.tools ? (
            <div>
              <dt className="work-label">TOOLS</dt>
              <dd>{project.tools}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <figure className="work-hero-media">
        <Image
          src={`/${story.hero.src}`}
          alt={story.hero.alt}
          fill
          preload
          sizes="(max-width: 767px) 100vw, 94vw"
        />
      </figure>

      <dl className="work-brief" aria-label="프로젝트 요약">
        {story.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="work-label">{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <article className="work-story">
        {story.chapters.map((chapter, index) => (
          <Chapter chapter={chapter} index={index} key={chapter.title} />
        ))}
      </article>

      <section className="work-outcome" aria-labelledby="work-outcome-heading">
        <p className="work-label">OUTCOME</p>
        <h2 id="work-outcome-heading">{story.outcome.title}</h2>
        {story.outcome.detail?.map((line) => (
          <p className="work-outcome-detail" key={line}>
            {line}
          </p>
        ))}
        {story.outcome.shift ? (
          <dl className="work-shift">
            <div>
              <dt className="work-label">{story.outcome.shift.from.label}</dt>
              <dd>{story.outcome.shift.from.value}</dd>
            </div>
            <div>
              <dt className="work-label">{story.outcome.shift.to.label}</dt>
              <dd>{story.outcome.shift.to.value}</dd>
            </div>
          </dl>
        ) : null}
        {story.outcome.note ? <p className="work-outcome-note">{story.outcome.note}</p> : null}
        {story.outcome.media ? <MediaGrid media={story.outcome.media} /> : null}
      </section>

      {story.takeaways.length > 0 ? (
        <section className="work-takeaways" aria-labelledby="work-takeaways-heading">
          <h2 id="work-takeaways-heading">Takeaways</h2>
          <ol>
            {story.takeaways.map((takeaway) => (
              <li key={takeaway.title}>
                <h3>{takeaway.title}</h3>
                {takeaway.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {story.expansion ? (
        <article className="work-story work-story-extra">
          <Chapter chapter={story.expansion} />
        </article>
      ) : null}

      <ProjectNavigation slug={project.slug} />
    </main>
  );
}
