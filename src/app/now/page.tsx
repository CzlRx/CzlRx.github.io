import type { Metadata } from "next";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PageIntro } from "@/components/PageIntro";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "现在", description: "CzlRx 最近正在学习、制作和关注的事情。", alternates: { canonical: absoluteUrl("/now/") } };

const nowContent = `
## 正在学习

把 Java Web 的知识从“会用”重新整理到“知道为什么”。最近的重点是 JVM、并发基础、MySQL 索引与事务，以及如何为服务写出更容易定位问题的日志。

## 正在制作

持续维护这个纯静态博客。它既是内容容器，也是一项前端工程练习：如何在不引入服务端的前提下，做好搜索、SEO、主题模式和 GitHub Pages 的路径兼容。

## 正在调整

- 每周留出固定时间做完整的小项目，而不是只看教程
- 用短笔记保留过程中的判断和疑问
- 保持运动和稳定作息，让学习可以持续

> “现在”页面的价值不在于展示忙碌，而在于定期校准方向。

这页最后更新于 **2026 年 8 月 29 日**。下一次更新时，我会保留真正发生变化的部分。
`;

export default async function NowPage() {
  return <div className="shell"><PageIntro eyebrow="Now" title="此刻，我在做什么" description="一张低频更新的公开快照，记录当前真正投入时间的事情。" /><div className="narrow section"><MarkdownContent html={await renderMarkdown(nowContent)} /></div></div>;
}
