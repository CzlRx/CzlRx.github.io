import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, GithubIcon, MailIcon, RssIcon } from "@/components/icons";
import { ArticleCard } from "@/components/ArticleCard";
import { NoteItem } from "@/components/NoteItem";
import { ProjectCard } from "@/components/ProjectCard";
import { getNavigationLabel, siteConfig } from "@/config/site";
import { getAllArticles, getAllNotes, getAllProjects, getRecentlyUpdatedArticles } from "@/lib/content";
import { absoluteUrl, githubProfileUrl, withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description: `${siteConfig.author}的个人博客，记录后端学习、工程实践与生活片段。`,
  alternates: { canonical: absoluteUrl("/") },
};

export default function HomePage() {
  const articles = getAllArticles();
  const notes = getAllNotes();
  const projects = getAllProjects();
  const notesLabel = getNavigationLabel("/notes/", "随笔");
  const featuredArticles = getRecentlyUpdatedArticles();
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <div className="shell">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-kicker">{siteConfig.identity} · {siteConfig.city}</p>
          <h1 id="home-title">把问题拆开，<br />把<em>思考</em>留下。</h1>
          <p className="home-lead">{siteConfig.description}。这里记录我对后端工程、计算机基础和日常生活的理解，不追求高频，只希望每次写下的东西都足够诚实。</p>
          <div className="home-links">
            <Link className="button-link button-link-primary" href="/articles/">开始阅读<ArrowUpRightIcon /></Link>
            <a className="button-link" href={githubProfileUrl()} target="_blank" rel="noopener noreferrer"><GithubIcon />GitHub</a>
            <a className="button-link" href={`mailto:${siteConfig.email}`}><MailIcon />邮件</a>
            <a className="button-link" href={withBasePath("/rss.xml")}><RssIcon />RSS</a>
          </div>
        </div>
        <div className="hero-portrait" aria-label={`${siteConfig.author}的抽象头像`}>
          <Image src={withBasePath(siteConfig.avatar)} alt={`${siteConfig.author}的抽象头像`} width={640} height={800} priority />
          <span className="portrait-note">steady, then strong.</span>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="section-heading">
          <h2 id="featured-title">精选文章</h2>
          <Link href="/articles/">查看全部<ArrowUpRightIcon /></Link>
        </div>
        <div className="featured-grid">{featuredArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
      </section>

      <section className="section home-two-column" aria-label="最近更新">
        <div>
          <div className="section-heading"><h2>最近文章</h2><Link href="/archive/">按年份归档<ArrowUpRightIcon /></Link></div>
          <div className="article-list">{articles.slice(0, 4).map((article) => <ArticleCard key={article.slug} article={article} compact />)}</div>
        </div>
        <aside className="now-card">
          <p className="eyebrow">NOW · 2026.08</p>
          <p>{siteConfig.nowSummary}</p>
          <Link className="text-link" href="/now/">看看我的近况<ArrowUpRightIcon /></Link>
          <time dateTime="2026-08-29">最后更新于 2026 年 8 月</time>
        </aside>
      </section>

      <section className="section" aria-labelledby="notes-title">
        <div className="section-heading"><h2 id="notes-title">最近{notesLabel}</h2><Link href="/notes/">所有{notesLabel}<ArrowUpRightIcon /></Link></div>
        <div className="note-list">{notes.slice(0, 4).map((note) => <NoteItem key={note.slug} note={note} />)}</div>
      </section>

      <section className="section" aria-labelledby="projects-title">
        <div className="section-heading"><h2 id="projects-title">代表项目</h2><Link href="/projects/">项目手记<ArrowUpRightIcon /></Link></div>
        <div className="project-grid">{featuredProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
      </section>
    </div>
  );
}
