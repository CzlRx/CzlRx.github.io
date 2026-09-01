import type { Metadata } from "next";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PageIntro } from "@/components/PageIntro";
import { resolveSiteContent, siteConfig } from "@/config/site";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: siteConfig.now.title, description: siteConfig.now.metaDescription, alternates: { canonical: absoluteUrl("/now/") } };

export default async function NowPage() {
  const html = await renderMarkdown(resolveSiteContent(siteConfig.now.body));
  return <div className="shell"><PageIntro eyebrow="Now" title={siteConfig.now.heading} description={siteConfig.now.description} /><div className="narrow section"><MarkdownContent html={html} /></div></div>;
}
