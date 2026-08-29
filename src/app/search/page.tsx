import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SearchBox } from "@/components/SearchBox";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "搜索", description: "搜索站内文章和短笔记。", alternates: { canonical: absoluteUrl("/search/") } };

export default function SearchPage() {
  return <div className="shell"><PageIntro eyebrow="Search" title="搜索" description="索引在构建时生成，搜索过程完全发生在你的浏览器中。" /><SearchBox /><noscript><p className="empty-state">搜索需要 JavaScript；文章、笔记与归档页面仍可正常浏览。</p></noscript></div>;
}
