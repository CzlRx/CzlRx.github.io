import { ArrowUpRightIcon } from "@/components/icons";
import { TagLink } from "@/components/TagLink";
import { withBasePath } from "@/lib/paths";
import type { Project } from "@/types/content";

export function ProjectCard({ project }: { project: Project }) {
  const href = project.demo || project.repository || "#";
  return (
    <article className="project-card">
      {project.cover ? <Image src={withBasePath(project.cover)} alt="" width={720} height={420} /> : null}
      <div className="project-card-body">
        <div className="project-status"><span aria-hidden="true" />{project.status}</div>
        <h3><a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{project.title}<ArrowUpRightIcon /></a></h3>
        <p>{project.description}</p>
        <div className="tag-row">{project.tags.map((tag) => <TagLink key={tag} tag={tag} />)}</div>
      </div>
    </article>
  );
}
import Image from "next/image";
