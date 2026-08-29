import type { TocItem } from "@/types/content";

function TocLinks({ items }: { items: TocItem[] }) {
  return (
    <ol>
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "toc-level-3" : undefined}>
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  );
}

export function TableOfContents({ items, variant = "both" }: { items: TocItem[]; variant?: "desktop" | "mobile" | "both" }) {
  if (!items.length) return null;
  return (
    <>
      {variant !== "mobile" ? <aside className="toc-desktop" aria-label="文章目录">
        <p>本页目录</p>
        <TocLinks items={items} />
      </aside> : null}
      {variant !== "desktop" ? <details className="toc-mobile">
        <summary>展开文章目录</summary>
        <TocLinks items={items} />
      </details> : null}
    </>
  );
}
