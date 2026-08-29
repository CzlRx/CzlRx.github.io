"use client";

import { useEffect, useRef } from "react";

export function MarkdownContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(":scope > .copy-code")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");
      const handleCopy = async () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        await navigator.clipboard.writeText(code);
        button.textContent = "已复制";
        window.setTimeout(() => { button.textContent = "复制"; }, 1600);
      };
      button.addEventListener("click", handleCopy);
      pre.appendChild(button);
      cleanups.push(() => button.removeEventListener("click", handleCopy));
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [html]);

  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
