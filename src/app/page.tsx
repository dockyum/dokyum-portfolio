import { AskDocky } from "@/components/landing/ask-docky";
import { AskDockyTrigger } from "@/components/landing/ask-docky-trigger";
import { ProjectRunway } from "@/components/landing/project-runway";
import { projects } from "@/content/projects";

export default function HomePage() {
  const twinConnected = Boolean(process.env.TWIN_API_URL);

  return (
    <main className="landing-page">
      <ProjectRunway projects={projects} />
      {twinConnected ? (
        <>
          <AskDocky />
          <AskDockyTrigger />
        </>
      ) : null}
    </main>
  );
}
