"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { withBasePath } from "@/lib/paths";

function currentGiscusTheme() {
  const file = document.documentElement.dataset.theme === "dark" ? "dark.css" : "light.css";
  return `${window.location.origin}${withBasePath(`/giscus/${file}`)}`;
}

function setGiscusTheme(theme: string) {
  const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, "https://giscus.app");
}

export function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "CzlRx/CzlRx.github.io");
    script.setAttribute("data-repo-id", "R_kgDOUH-pZA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOUH-pZM4DFff6");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", currentGiscusTheme());
    script.setAttribute("data-lang", "zh-CN");
    container.appendChild(script);

    const syncTheme = () => setGiscusTheme(currentGiscusTheme());
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let ready = false;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://giscus.app") return;
      if (typeof event.data !== "object" || !event.data?.giscus || ready) return;
      ready = true;
      syncTheme();
    };
    window.addEventListener("message", onMessage);

    return () => {
      observer.disconnect();
      window.removeEventListener("message", onMessage);
      container.innerHTML = "";
    };
  }, [pathname]);

  return (
    <section className="comments" aria-labelledby="comments-title" data-pagefind-ignore>
      <header className="comments-header">
        <p className="eyebrow">评论</p>
        <h2 id="comments-title">留下想法</h2>
        <p className="comments-note">用 GitHub 账号登录后即可评论，内容会保存在仓库的 Discussions 里。</p>
      </header>
      <div className="comments-frame" ref={containerRef} />
    </section>
  );
}
