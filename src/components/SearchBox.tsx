"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { EmptyState } from "@/components/EmptyState";
import { withBasePath } from "@/lib/paths";

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: Record<string, string>;
}

interface SearchResult {
  id: string;
  data: PagefindResultData;
}

interface PagefindModule {
  search: (query: string) => Promise<{ results: Array<{ id: string; data: () => Promise<PagefindResultData> }> }>;
}

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [active, setActive] = useState(-1);
  const pagefind = useRef<PagefindModule | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        if (!pagefind.current) {
          const pagefindUrl = withBasePath("/pagefind/pagefind.js");
          pagefind.current = (await import(/* webpackIgnore: true */ pagefindUrl)) as PagefindModule;
        }
        const response = await pagefind.current.search(trimmed);
        const data = await Promise.all(response.results.slice(0, 12).map(async (result) => ({ id: result.id, data: await result.data() })));
        setResults(data);
        setActive(data.length ? 0 : -1);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (value + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (value - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && active >= 0) {
      window.location.href = normalizeResultUrl(results[active].data.url);
    }
  }

  function normalizeResultUrl(url: string) {
    try {
      const parsed = new URL(url, window.location.origin);
      return withBasePath(parsed.pathname + parsed.search + parsed.hash);
    } catch {
      return withBasePath(url);
    }
  }

  return (
    <div className="search-panel">
      <label className="search-input-wrap">
        <SearchIcon />
        <span className="sr-only">搜索文章和笔记</span>
        <input value={query} onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          if (!value.trim()) {
            setResults([]);
            setStatus("idle");
            setActive(-1);
          }
        }} onKeyDown={onKeyDown} placeholder="试试“后端”“数据库”或“阅读”" autoComplete="off" autoFocus />
        <kbd>↵</kbd>
      </label>
      <div className="search-status" aria-live="polite">
        {status === "loading" ? "正在翻找内容…" : null}
        {status === "ready" && results.length ? `找到 ${results.length} 条结果` : null}
      </div>
      {status === "ready" && !results.length ? <EmptyState title="没有找到相关内容" description="换一个更短或更具体的关键词试试。" /> : null}
      {status === "error" ? <EmptyState title="搜索索引暂时不可用" description="开发模式下需先执行 npm run build；已部署站点会自动加载索引。" /> : null}
      <ol className="search-results">
        {results.map((result, index) => (
          <li key={result.id} className={index === active ? "is-active" : undefined}>
            <a href={normalizeResultUrl(result.data.url)} onMouseEnter={() => setActive(index)}>
              <div><span>{result.data.meta.type || "内容"}</span><time>{result.data.meta.date}</time></div>
              <h2>{result.data.meta.title}</h2>
              <p dangerouslySetInnerHTML={{ __html: result.data.excerpt }} />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
