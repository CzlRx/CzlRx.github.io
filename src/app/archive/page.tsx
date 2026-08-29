import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { getAllArticles, getAllNotes } from "@/lib/content";
import { formatShortDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "年度归档", description: "按年份浏览所有文章和短笔记。", alternates: { canonical: absoluteUrl("/archive/") } };

export default function ArchivePage() {
  const entries = [...getAllArticles(), ...getAllNotes()].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const groups = Map.groupBy(entries, (entry) => new Date(entry.date).getFullYear());
  return (
    <div className="shell">
      <PageIntro eyebrow="Archive" title="年度归档" description="时间不是分类方法，却能诚实地呈现一个人的关注如何移动。" aside={`${entries.length}`.padStart(2, "0")} />
      <div className="section-tight">{[...groups.entries()].map(([year, items]) => (
        <section className="archive-year" key={year}>
          <h2>{year}</h2>
          <div className="archive-items">{items.map((item) => <Link key={`${item.type}-${item.slug}`} href={`/${item.type === "article" ? "articles" : "notes"}/${item.slug}/`}><time>{formatShortDate(item.date).slice(5)}</time><strong>{item.title}</strong><span>{item.type === "article" ? "文章" : "笔记"}</span></Link>)}</div>
        </section>
      ))}</div>
    </div>
  );
}
