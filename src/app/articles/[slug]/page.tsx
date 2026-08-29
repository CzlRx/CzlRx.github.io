import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleActions } from "@/components/ArticleActions";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";
import { TagLink } from "@/components/TagLink";
import { siteConfig } from "@/config/site";
import { getAllArticles, getArticle, getRelatedArticles } from "@/lib/content";
import { formatDate, formatShortDate } from "@/lib/format";
import { extractTableOfContents, renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, withBasePath } from "@/lib/paths";

interface ArticlePageProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllArticles().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = absoluteUrl(`/articles/${article.slug}/`);
  const image = absoluteUrl(article.cover || siteConfig.defaultOgImage);
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: { type: "article", locale: "zh_CN", title: article.title, description: article.description, url, publishedTime: article.date, modifiedTime: article.updated, tags: article.tags, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [image] },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const allArticles = getAllArticles();
  const index = allArticles.findIndex((item) => item.slug === slug);
  const previous = allArticles[index + 1];
  const next = allArticles[index - 1];
  const related = getRelatedArticles(article);
  const html = await renderMarkdown(article.body);
  const toc = extractTableOfContents(article.body);
  const articleUrl = absoluteUrl(`/articles/${article.slug}/`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    image: absoluteUrl(article.cover || siteConfig.defaultOgImage),
    datePublished: article.date,
    dateModified: article.updated || article.date,
    inLanguage: siteConfig.locale,
    mainEntityOfPage: articleUrl,
    author: { "@type": "Person", name: siteConfig.author, url: absoluteUrl("/about/") },
    publisher: { "@type": "Person", name: siteConfig.author },
  };
  return (
    <>
      <ReadingProgress />
      <article data-pagefind-body>
        <header className="article-header shell">
          <p className="eyebrow" data-pagefind-meta="type">文章</p>
          <h1 data-pagefind-meta="title">{article.title}</h1>
          <p className="article-dek" data-pagefind-meta="description">{article.description}</p>
          <div className="article-meta">
            <time dateTime={article.date} data-pagefind-meta="date">发布于 {formatDate(article.date)}</time>
            {article.updated ? <time dateTime={article.updated}>更新于 {formatDate(article.updated)}</time> : null}
            <span>{article.readingMinutes} 分钟阅读</span>
          </div>
          <div className="tag-row">{article.tags.map((tag) => <TagLink key={tag} tag={tag} />)}</div>
        </header>
        {article.cover ? <Image className="article-hero-image" src={withBasePath(article.cover)} alt={`${article.title}的封面图`} width={1200} height={700} priority /> : null}
        <div className="article-layout shell">
          <div className="article-body">
            <TableOfContents items={toc} variant="mobile" />
            <MarkdownContent html={html} />
            <div className="article-end"><span>写到这里</span></div>
            <ArticleActions />
            {(previous || next) ? (
              <nav className="post-nav" aria-label="上一篇和下一篇">
                {previous ? <Link href={`/articles/${previous.slug}/`}><span>上一篇</span><strong>{previous.title}</strong></Link> : <span />}
                {next ? <Link className="post-nav-next" href={`/articles/${next.slug}/`}><span>下一篇</span><strong>{next.title}</strong></Link> : null}
              </nav>
            ) : null}
          </div>
          <TableOfContents items={toc} variant="desktop" />
        </div>
        {related.length ? (
          <section className="related shell" aria-labelledby="related-title">
            <h2 id="related-title">也许你还想读</h2>
            <div className="related-grid">{related.map((item) => <Link key={item.slug} href={`/articles/${item.slug}/`}><time>{formatShortDate(item.date)}</time><h3>{item.title}</h3></Link>)}</div>
          </section>
        ) : null}
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />
    </>
  );
}
