import { getProjectNeighbors, type ProjectSlug } from "@/content/projects";

export function ProjectNavigation({ slug }: { slug: ProjectSlug }) {
  const { previous, next } = getProjectNeighbors(slug);

  return (
    <nav className="work-navigation" aria-label="프로젝트 간 이동">
      {previous ? (
        <a
          className="work-navigation-link work-navigation-previous"
          href={previous.route}
          aria-label={`이전 프로젝트 ${previous.name}`}
        >
          <span className="work-navigation-label work-navigation-meta">← 이전 프로젝트</span>
          <strong>{previous.name}</strong>
          <span className="work-navigation-line">{previous.activeLine}</span>
        </a>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <a
          className="work-navigation-link work-navigation-next"
          href={next.route}
          aria-label={`다음 프로젝트 ${next.name}`}
        >
          <span className="work-navigation-label work-navigation-meta">다음 프로젝트 →</span>
          <strong>{next.name}</strong>
          <span className="work-navigation-line">{next.activeLine}</span>
        </a>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
