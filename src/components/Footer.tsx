import Link from "next/link";
import { GithubIcon, MailIcon, RssIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { githubRepositoryUrl, withBasePath } from "@/lib/paths";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="footer-name">{siteConfig.name}</p>
          <p className="footer-note">在常州生活、学习，也持续记录。</p>
        </div>
        <nav className="footer-nav" aria-label="次级导航">
          <Link href="/now/">现在</Link>
          <Link href="/archive/">归档</Link>
          <Link href="/search/">搜索</Link>
        </nav>
        <div className="footer-social">
          <a href={githubRepositoryUrl()} target="_blank" rel="me noopener noreferrer" aria-label="GitHub"><GithubIcon /></a>
          <a href={`mailto:${siteConfig.email}`} aria-label="发送邮件"><MailIcon /></a>
          <a href={withBasePath("/rss.xml")} aria-label="订阅 RSS"><RssIcon /></a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {siteConfig.author}</span>
        <span>用 Next.js 与一些耐心构建</span>
      </div>
    </footer>
  );
}
