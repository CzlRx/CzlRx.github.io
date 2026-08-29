import Link from "next/link";
import { TagLink } from "@/components/TagLink";
import { formatShortDate } from "@/lib/format";
import type { Note } from "@/types/content";

export function NoteItem({ note }: { note: Note }) {
  return (
    <article className="note-item">
      <time dateTime={note.date}>{formatShortDate(note.date)}</time>
      <div>
        <h3><Link href={`/notes/${note.slug}/`}>{note.title}</Link></h3>
        <p>{note.excerpt}</p>
        <div className="tag-row">{note.tags.map((tag) => <TagLink key={tag} tag={tag} />)}</div>
      </div>
    </article>
  );
}
