import { ProjectCarousel } from "@/components/landing/project-carousel";
import { projects } from "@/content/projects";

export default function HomePage() {
  return (
    <main className="landing-page">
      <ProjectCarousel projects={projects} />
    </main>
  );
}
