import type { Metadata } from "next";
import Image from "next/image";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PageIntro } from "@/components/PageIntro";
import { siteConfig } from "@/config/site";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "关于我",
  description: `关于 ${siteConfig.author}：${siteConfig.identity}，${siteConfig.description}。`,
  alternates: { canonical: absoluteUrl("/about/") },
};

const about = `
## 你好，我是 CzlRx

我是一名软件工程学生，目前在江苏常州生活和学习。比起急着给自己贴上很多标签，我更愿意说：**正在努力成为一名可靠的后端工程师**。

我喜欢那些能从混乱中建立秩序的工作——设计清晰的数据结构、拆解一个偶发故障、把模糊需求写成可以验证的程序。这个博客也是同一种练习：把学到的东西重新组织，再用自己的话讲明白。

## 我关心的事

- Java 与服务端工程的基础能力
- 数据库、网络与操作系统背后的机制
- 可维护的软件设计，而不只是“能跑”
- 更稳定、可持续的学习节奏

## 关于写作

这里不会追求日更。文章发布前，我希望至少做到两件事：例子可以运行，结论能说出边界。短笔记则更像公开的学习便笺，保留一些还没有长成体系的观察。

如果你发现了错误，或者刚好也在研究相似的问题，欢迎[给我写邮件](mailto:${siteConfig.email})。外部链接也可以从我的 [GitHub](https://github.com/${siteConfig.githubUsername}) 找到。
`;

export default async function AboutPage() {
  const html = await renderMarkdown(about);
  return (
    <div className="shell">
      <PageIntro eyebrow="About" title="关于我" description={siteConfig.statement} />
      <div className="about-grid section">
        <MarkdownContent html={html} />
        <aside className="about-card">
          <Image src={withBasePath(siteConfig.avatar)} alt={`${siteConfig.author}的抽象头像`} width={400} height={500} />
          <dl>
            <div><dt>身份</dt><dd>{siteConfig.identity}</dd></div>
            <div><dt>城市</dt><dd>{siteConfig.city}</dd></div>
            <div><dt>方向</dt><dd>后端工程</dd></div>
            <div><dt>联系</dt><dd><a href={`mailto:${siteConfig.email}`}>Email</a></dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
