import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleActions } from "@/components/ArticleActions";
import { MarkdownContent } from "@/components/MarkdownContent";
import { TagLink } from "@/components/TagLink";
import { getAllNotes, getNote } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/paths";

interface NotePageProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  const notes = getAllNotes();
  return notes.length ? notes.map(({ slug }) => ({ slug })) : [{ slug: "__no_published_notes__" }];
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const note = getNote((await params).slug);
  if (!note) return {};
  return { title: note.title, description: note.excerpt, alternates: { canonical: absoluteUrl(`/notes/${note.slug}/`) } };
}

export default async function NotePage({ params }: NotePageProps) {
  const note = getNote((await params).slug);
  if (!note) notFound();
  const html = await renderMarkdown(note.body);
  return (
    <article className="note-page narrow" data-pagefind-body>
      <header className="note-page-header">
        <p className="eyebrow" data-pagefind-meta="type">短笔记</p>
        <h1 data-pagefind-meta="title">{note.title}</h1>
        <time dateTime={note.date} data-pagefind-meta="date">{formatDate(note.date)}</time>
        <span className="sr-only" data-pagefind-meta="description">{note.excerpt}</span>
        <div className="tag-row">{note.tags.map((tag) => <TagLink key={tag} tag={tag} />)}</div>
      </header>
      <MarkdownContent html={html} />
      <div className="article-end"><span>记于此刻</span></div>
      <ArticleActions />
    </article>
  );
}
