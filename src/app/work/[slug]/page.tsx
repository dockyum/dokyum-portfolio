import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/work/project-detail";
import { getProjectBySlug, projects } from "@/content/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  const socialImage = `/${project.story.hero.src}`;

  return {
    title: project.name,
    description: project.summary,
    alternates: {
      canonical: project.route,
    },
    openGraph: {
      title: `${project.name} — dokyum kim`,
      description: project.summary,
      url: project.route,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} — dokyum kim`,
      description: project.summary,
      images: [socialImage],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
