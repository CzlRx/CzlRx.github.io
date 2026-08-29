"use client";

import { useState } from "react";
import { CheckIcon, ChevronUpIcon, CopyIcon } from "@/components/icons";

export function ArticleActions() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="article-actions">
      <button type="button" onClick={copyLink}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? "已复制" : "复制链接"}</button>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ChevronUpIcon />返回顶部</button>
    </div>
  );
}
