import type { Metadata } from "next";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PageIntro } from "@/components/PageIntro";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllProjects } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = {
  title: "项目",
  description: "课程之外，我用来理解工程与产品的个人项目。",
  alternates: { canonical: absoluteUrl("/projects/") },
};

export default async function ProjectsPage() {
  const projects = getAllProjects();
  const bodies = await Promise.all(projects.map((project) => renderMarkdown(project.body)));
  return (
    <div className="shell">
      <PageIntro eyebrow="Projects" title="项目" description="一些可运行的练习，也是一组关于如何把问题做完整的手记。" aside={`${projects.length}`.padStart(2, "0")} />
      <section className="section project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</section>
      <section className="narrow section-tight" aria-label="项目补充说明">
        {projects.map((project, index) => <div key={project.slug} style={{ marginBottom: "4rem" }}><p className="eyebrow">{project.title} · 制作手记</p><MarkdownContent html={bodies[index]} /></div>)}
      </section>
    </div>
  );
}
