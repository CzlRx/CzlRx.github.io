import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label={`${siteConfig.name}首页`}>
          <span className="wordmark-mark" aria-hidden="true">C</span>
          <span>{siteConfig.shortName}</span>
        </Link>
        <nav className="primary-nav" aria-label="主导航">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="icon-button" href="/search/" aria-label="搜索">
            <SearchIcon />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
