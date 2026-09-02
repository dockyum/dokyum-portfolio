import { ProjectRunway } from "@/components/landing/project-runway";
import { projects } from "@/content/projects";

export default function HomePage() {
  return (
    <main className="landing-page">
      <ProjectRunway projects={projects} />
    </main>
  );
}
