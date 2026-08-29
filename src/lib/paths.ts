import { siteConfig } from "@/config/site";

export function normalizeBasePath(value = ""): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function getBasePath(): string {
  return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
}

export function withBasePath(path = "/"): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#") || path.startsWith("mailto:")) {
    return path;
  }
  const basePath = getBasePath();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }
  return `${basePath}${normalizedPath}`;
}

export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || siteConfig.siteOrigin).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteOrigin()}${withBasePath(path)}`;
}

export function githubRepositoryUrl(): string {
  return `https://github.com/${siteConfig.githubUsername}/${siteConfig.repositoryName}`;
}
