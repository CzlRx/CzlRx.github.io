import type { Metadata } from "next";
import Image from "next/image";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PageIntro } from "@/components/PageIntro";
import { resolveSiteContent, siteConfig } from "@/config/site";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: siteConfig.about.title,
  description: `关于 ${siteConfig.author}：${siteConfig.identity}，${siteConfig.description}。`,
  alternates: { canonical: absoluteUrl("/about/") },
};

export default async function AboutPage() {
  const html = await renderMarkdown(resolveSiteContent(siteConfig.about.body));
  return (
    <div className="shell">
      <PageIntro eyebrow="About" title={siteConfig.about.title} description={siteConfig.statement} />
      <div className="about-grid section">
        <MarkdownContent html={html} />
        <aside className="about-card">
          <Image src={withBasePath(siteConfig.avatar)} alt={`${siteConfig.author}的抽象头像`} width={400} height={500} />
          <dl>
            <div><dt>身份</dt><dd>{siteConfig.identity}</dd></div>
            <div><dt>城市</dt><dd>{siteConfig.city}</dd></div>
            <div><dt>方向</dt><dd>{siteConfig.about.direction}</dd></div>
            <div><dt>联系</dt><dd><a href={`mailto:${siteConfig.email}`}>Email</a></dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
