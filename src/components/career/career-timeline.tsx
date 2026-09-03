import type { CareerEntry, EducationEntry } from "@/content/career";
import { getProjectBySlug, type Project } from "@/content/projects";

export function CareerTimeline({
  careers,
  projects,
  education,
}: {
  careers: readonly CareerEntry[];
  projects: readonly Project[];
  education: readonly EducationEntry[];
}) {
  return (
    <div className="career-timeline">
      <section className="career-history" aria-label="경력">
        <div className="career-entries">
          {careers.map((entry) => (
            <article className="career-entry" key={`${entry.company}-${entry.period}`}>
              <p className="career-period">{entry.period}</p>
              <div className="career-entry-main">
                <h2>{entry.company}</h2>
                <p className="career-role">{entry.role}</p>
                <p className="career-summary">{entry.summary}</p>
                <ul className="career-highlights">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="career-projects">
                  {entry.projectSlugs.map((slug) => {
                    const project = getProjectBySlug(slug)!;
                    return (
                      <a
                        href={project.route}
                        key={slug}
                        aria-label={`${project.name} 프로젝트 보기`}
                      >
                        {project.name} ↗
                      </a>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="career-independent" aria-labelledby="career-independent-heading">
        <div className="career-section-heading">
          <p className="career-section-kicker">INDEPENDENT PROJECTS</p>
          <h2 id="career-independent-heading">직접 만드는 것들</h2>
        </div>
        <div className="independent-entries">
          {projects.map((project) => (
            <article className="independent-entry" key={project.slug}>
              <p className="independent-period">{project.period ?? ""}</p>
              <div className="independent-entry-main">
                <h3 className="independent-name">{project.name}</h3>
                <p className="independent-role">{project.role}</p>
                <p className="independent-summary">{project.summary}</p>
                <div className="career-projects">
                  <a href={project.route} aria-label={`${project.name} 프로젝트 보기`}>
                    {project.name} ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="career-education" aria-labelledby="career-education-heading">
        <div className="career-section-heading">
          <p className="career-section-kicker">EDUCATION</p>
          <h2 id="career-education-heading">배운 것들</h2>
        </div>
        <div className="education-entries">
          {education.map((entry) => (
            <article className="education-entry" key={`${entry.institution}-${entry.period}`}>
              <p className="education-period">{entry.period}</p>
              <div className="education-entry-main">
                <h3 className="education-institution">{entry.institution}</h3>
                <p className="education-program">{entry.program}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
