import type { Metadata } from "next";
import { NoteItem } from "@/components/NoteItem";
import { PageIntro } from "@/components/PageIntro";
import { getNavigationLabel } from "@/config/site";
import { getAllNotes } from "@/lib/content";
import { absoluteUrl } from "@/lib/paths";

const notesLabel = getNavigationLabel("/notes/", "随笔");

export const metadata: Metadata = {
  title: notesLabel,
  description: "不够长成文章，但值得被记住的想法、链接和片段。",
  alternates: { canonical: absoluteUrl("/notes/") },
};

export default function NotesPage() {
  const notes = getAllNotes();
  return (
    <div className="shell">
      <PageIntro eyebrow="Notes" title={notesLabel} description="不够长成一篇文章，但仍然值得被认真记住的片段。" aside={`${notes.length}`.padStart(2, "0")} />
      <div className="narrow section-tight"><div className="note-list">{notes.map((note) => <NoteItem key={note.slug} note={note} />)}</div></div>
    </div>
  );
}
