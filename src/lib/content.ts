import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Article, Note, Project } from "@/types/content";

const contentRoot = path.join(process.cwd(), "content");

function listMarkdownFiles(directory: string): string[] {
  const target = path.join(contentRoot, directory);
  if (!fs.existsSync(target)) return [];
  return fs.readdirSync(target).filter((file) => /\.mdx?$/.test(file));
}

function normalizeDate(value: unknown, field: string, file: string): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  throw new Error(`${file} 缺少有效的 ${field} 日期`);
}

function normalizeTags(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function readEntry(directory: string, file: string) {
  const fullPath = path.join(contentRoot, directory, file);
  const source = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(source);
  return {
    slug: file.replace(/\.mdx?$/, ""),
    data,
    body: content.trim(),
  };
}

function visible<T extends { draft: boolean }>(items: T[]): T[] {
  return process.env.NODE_ENV === "development" ? items : items.filter((item) => !item.draft);
}

function byDate<T extends { date: string }>(a: T, b: T): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function byLastModified<T extends { date: string; updated?: string }>(a: T, b: T): number {
  return new Date(b.updated ?? b.date).getTime() - new Date(a.updated ?? a.date).getTime();
}

export function getAllArticles(): Article[] {
  const articles = listMarkdownFiles("articles").map((file) => {
    const { slug, data, body } = readEntry("articles", file);
    return {
      type: "article" as const,
      slug,
      title: String(data.title ?? "未命名文章"),
      description: String(data.description ?? "一篇尚未补充摘要的文章。"),
      date: normalizeDate(data.date, "date", file),
      updated: data.updated ? normalizeDate(data.updated, "updated", file) : undefined,
      tags: normalizeTags(data.tags),
      cover: data.cover ? String(data.cover) : undefined,
      featured: Boolean(data.featured),
      draft: Boolean(data.draft),
      readingMinutes: Math.max(1, Math.ceil(readingTime(body).minutes)),
      body,
    };
  });
  return visible(articles).sort(byDate);
}

export function getRecentlyUpdatedArticles(limit = 3): Article[] {
  return getAllArticles().sort(byLastModified).slice(0, limit);
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getAllNotes(): Note[] {
  const notes = listMarkdownFiles("notes").map((file) => {
    const { slug, data, body } = readEntry("notes", file);
    const excerpt = body
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[#>*_`\[\]()!-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 110);
    return {
      type: "note" as const,
      slug,
      title: String(data.title ?? "未命名笔记"),
      date: normalizeDate(data.date, "date", file),
      tags: normalizeTags(data.tags),
      draft: Boolean(data.draft),
      excerpt,
      body,
    };
  });
  return visible(notes).sort(byDate);
}

export function getNote(slug: string): Note | undefined {
  return getAllNotes().find((note) => note.slug === slug);
}

export function getAllProjects(): Project[] {
  const projects = listMarkdownFiles("projects").map((file) => {
    const { slug, data, body } = readEntry("projects", file);
    return {
      type: "project" as const,
      slug,
      title: String(data.title ?? "未命名项目"),
      description: String(data.description ?? "一个正在整理中的项目。"),
      date: normalizeDate(data.date, "date", file),
      status: String(data.status ?? "持续维护"),
      tags: normalizeTags(data.tags),
      cover: data.cover ? String(data.cover) : undefined,
      demo: data.demo ? String(data.demo) : undefined,
      repository: data.repository ? String(data.repository) : undefined,
      featured: Boolean(data.featured),
      draft: Boolean(data.draft),
      body,
    };
  });
  return visible(projects).sort(byDate);
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getTagCounts(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  const entries = [...getAllArticles(), ...getAllNotes(), ...getAllProjects()];
  for (const entry of entries) {
    for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"));
}

export function getAllTags(): string[] {
  return getTagCounts().map(({ tag }) => tag);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return getAllArticles()
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => article.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byDate(a.candidate, b.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
