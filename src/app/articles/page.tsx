import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { getAllArticles, getTagCounts } from "@/lib/content";
import { absoluteUrl } from "@/lib/paths";
import { tagToSlug } from "@/lib/slugs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "文章",
  description: "关于后端工程、计算机基础与学习方法的长篇记录。",
  alternates: { canonical: absoluteUrl("/articles/") },
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const tags = getTagCounts();
  return (
    <div className="shell">
      <PageIntro eyebrow="Articles" title="文章" description="长一些的思考与实践记录。通常从一个具体问题开始，尽量把来龙去脉说清楚。" aside={`${articles.length}`.padStart(2, "0")} />
      <div className="content-grid">
        <div className="article-list">{articles.map((article) => <ArticleCard key={article.slug} article={article} compact />)}</div>
        <aside className="filter-aside">
          <h2>按标签浏览</h2>
          <div className="tag-cloud">{tags.map(({ tag, count }) => <Link className="tag-count" key={tag} href={`/tags/${tagToSlug(tag)}/`}>#{tag}<span>{count}</span></Link>)}</div>
        </aside>
      </div>
    </div>
  );
}
