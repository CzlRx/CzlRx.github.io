const normalizeBasePath = (value = "") => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
};

const resolveBasePath = () => {
  if (process.env.BASE_PATH !== undefined) {
    return normalizeBasePath(process.env.BASE_PATH);
  }
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined) {
    return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
  }
  if (process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY) {
    const [owner, repository] = process.env.GITHUB_REPOSITORY.split("/");
    if (repository?.toLowerCase() === `${owner}.github.io`.toLowerCase()) {
      return "";
    }
    return repository ? `/${repository}` : "";
  }
  return "";
};

const basePath = resolveBasePath();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL ?? "",
  },
};

export default nextConfig;
