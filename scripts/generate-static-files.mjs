import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { siteConfig } from "../src/config/site.ts";
import { tagToSlug } from "../src/lib/slugs.ts";

const outDir = path.join(process.cwd(), "out");
const contentDir = path.join(process.cwd(), "content");

function normalizeBasePath(value = "") {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function resolveBasePath() {
  if (process.env.BASE_PATH !== undefined) return normalizeBasePath(process.env.BASE_PATH);
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined) return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
  if (process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY) {
    const [owner, repository] = process.env.GITHUB_REPOSITORY.split("/");
    return repository?.toLowerCase() === `${owner}.github.io`.toLowerCase() ? "" : normalizeBasePath(repository);
  }
  return "";
}

const siteOrigin = (process.env.SITE_URL || siteConfig.siteOrigin).replace(/\/+$/, "");
const basePath = resolveBasePath();
const absoluteUrl = (route = "/") => {
  const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
  return `${siteOrigin}${basePath}${normalizedRoute}`;
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readEntries(directory, type) {
  return fs
    .readdirSync(path.join(contentDir, directory))
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const source = fs.readFileSync(path.join(contentDir, directory, file), "utf8");
      const { data, content } = matter(source);
      return {
        type,
        slug: file.replace(/\.mdx?$/, ""),
        title: String(data.title),
        description: String(data.description || plainText(content).slice(0, 110)),
        date: new Date(data.date).toISOString(),
        updated: data.updated ? new Date(data.updated).toISOString() : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        draft: Boolean(data.draft),
        body: content,
      };
    })
    .filter((entry) => !entry.draft)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

const articles = readEntries("articles", "article");
const notes = readEntries("notes", "note");
const tags = [...new Set([...articles, ...notes].flatMap((entry) => entry.tags))];
const fixedRoutes = ["/", "/articles/", "/notes/", "/projects/", "/about/", "/now/", "/archive/", "/search/"];
const routeEntries = [
  ...fixedRoutes.map((route) => ({ route, date: new Date().toISOString() })),
  ...articles.map((article) => ({ route: `/articles/${article.slug}/`, date: article.updated || article.date })),
  ...notes.map((note) => ({ route: `/notes/${note.slug}/`, date: note.date })),
  ...tags.map((tag) => ({ route: `/tags/${tagToSlug(tag)}/`, date: new Date().toISOString() })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routeEntries.map(({ route, date }) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc><lastmod>${new Date(date).toISOString()}</lastmod></url>`).join("\n")}
</urlset>
`;

const feedItems = [...articles, ...notes]
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  .map((entry) => {
    const route = `/${entry.type === "article" ? "articles" : "notes"}/${entry.slug}/`;
    const content = plainText(entry.body).slice(0, 800);
    return `  <item>
    <title>${escapeXml(entry.title)}</title>
    <link>${escapeXml(absoluteUrl(route))}</link>
    <guid isPermaLink="true">${escapeXml(absoluteUrl(route))}</guid>
    <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
    <category>${entry.type === "article" ? "文章" : "短笔记"}</category>
    ${entry.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
    <description>${escapeXml(entry.description)}</description>
    <content:encoded><![CDATA[<p>${escapeXml(content)}</p><p><a href="${escapeXml(absoluteUrl(route))}">继续阅读</a></p>]]></content:encoded>
  </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(siteConfig.name)}</title>
  <link>${escapeXml(absoluteUrl("/"))}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${feedItems}
</channel>
</rss>
`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;

if (!fs.existsSync(outDir)) throw new Error("未找到 out 目录，请先完成 Next.js 静态构建。");
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(outDir, "rss.xml"), rss);
fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
console.log(`Generated RSS, sitemap and robots for ${routeEntries.length} routes.`);
