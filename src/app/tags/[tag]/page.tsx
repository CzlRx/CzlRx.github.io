import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { NoteItem } from "@/components/NoteItem";
import { PageIntro } from "@/components/PageIntro";
import { ProjectCard } from "@/components/ProjectCard";
import { getAllArticles, getAllNotes, getAllProjects, getAllTags } from "@/lib/content";
import { absoluteUrl } from "@/lib/paths";
import { tagToSlug } from "@/lib/slugs";

interface TagPageProps { params: Promise<{ tag: string }> }

export function generateStaticParams() { return getAllTags().map((tag) => ({ tag: tagToSlug(tag) })); }

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const slug = (await params).tag;
  const tag = getAllTags().find((item) => tagToSlug(item) === slug) ?? slug;
  return { title: `标签：${tag}`, description: `浏览所有带有“${tag}”标签的文章、笔记和项目。`, alternates: { canonical: absoluteUrl(`/tags/${slug}/`) } };
}

export default async function TagPage({ params }: TagPageProps) {
  const slug = (await params).tag;
  const tag = getAllTags().find((item) => tagToSlug(item) === slug);
  if (!tag) notFound();
  const articles = getAllArticles().filter((item) => item.tags.includes(tag));
  const notes = getAllNotes().filter((item) => item.tags.includes(tag));
  const projects = getAllProjects().filter((item) => item.tags.includes(tag));
  return (
    <div className="shell">
      <PageIntro eyebrow="Tag" title={`#${tag}`} description={`共找到 ${articles.length + notes.length + projects.length} 条相关内容。`} />
      {articles.length ? <section className="section-tight"><div className="section-heading"><h2>文章</h2><Link href="/articles/">全部文章</Link></div><div className="article-list">{articles.map((article) => <ArticleCard key={article.slug} article={article} compact />)}</div></section> : null}
      {notes.length ? <section className="section-tight"><div className="section-heading"><h2>短笔记</h2><Link href="/notes/">全部笔记</Link></div><div className="note-list">{notes.map((note) => <NoteItem key={note.slug} note={note} />)}</div></section> : null}
      {projects.length ? <section className="section-tight"><div className="section-heading"><h2>项目</h2><Link href="/projects/">全部项目</Link></div><div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section> : null}
    </div>
  );
}
