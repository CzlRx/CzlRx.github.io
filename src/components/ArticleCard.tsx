import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon } from "@/components/icons";
import { TagLink } from "@/components/TagLink";
import { formatDate } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import type { Article } from "@/types/content";

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <article className={compact ? "article-card article-card-compact" : "article-card"}>
      {!compact && article.cover ? (
        <Link className="article-cover" href={`/articles/${article.slug}/`} tabIndex={-1} aria-hidden="true">
          <Image src={withBasePath(article.cover)} alt="" width={720} height={420} />
        </Link>
      ) : null}
      <div className="article-card-content">
        <div className="eyebrow-row">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span>{article.readingMinutes} 分钟阅读</span>
        </div>
        <h3><Link href={`/articles/${article.slug}/`}>{article.title}<ArrowUpRightIcon /></Link></h3>
        <p>{article.description}</p>
        <div className="tag-row">{article.tags.map((tag) => <TagLink key={tag} tag={tag} />)}</div>
      </div>
    </article>
  );
}
