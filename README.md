# CzlRx 的个人博客

一个使用 Next.js App Router、TypeScript、Tailwind CSS、Markdown 和 Pagefind 构建的纯静态个人博客。站点不需要数据库或常驻 Node.js 服务，构建结果位于 `out/`，可直接部署到 GitHub Pages。

## 功能

- 首页、文章、短笔记、项目、关于、现在、标签、年度归档和搜索页面
- Markdown 内容管理、目录、标题锚点、阅读时长、相关文章、上一篇/下一篇
- GFM 表格、脚注、代码高亮与复制按钮
- 浅色、深色和跟随系统三种主题
- Pagefind 纯静态全文搜索
- RSS、sitemap.xml、robots.txt、Open Graph 与 JSON-LD
- GitHub Pages 根路径与仓库子路径自动兼容
- GitHub Actions 自动构建与部署

## 环境要求

- Node.js 22 或更新的 LTS 版本
- npm 10 或更新版本

## 本地运行

```bash
npm install
npm run dev
```

开发站点默认打开 `http://localhost:3000`，本地开发不会添加 GitHub 仓库子路径。

完整验证：

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build` 会依次执行 Next.js 静态导出、RSS/站点地图生成和 Pagefind 建索引。完成后可以运行：

```bash
npm run start
```

## 修改个人信息

所有常用站点资料集中在 [`src/config/site.ts`](src/config/site.ts)：

- 博客名称、作者、介绍、身份与城市
- 邮箱与 GitHub 用户名
- 仓库名与默认网站域名
- 头像、默认分享图、主题色
- 导航与“现在”摘要

当前 `repositoryName` 使用 `MyBlog`，请在仓库名不同时修改。默认头像和分享图在 `public/images/`，可直接替换并保持文件名，也可以修改配置中的路径。

## 发布内容

### 新文章

在 `content/articles/` 新建 `.md` 文件，文件名即 URL slug：

```yaml
---
title: 文章标题
description: 一句话摘要
date: 2026-08-29
updated: 2026-08-30
tags:
  - 后端
cover: /images/my-cover.svg
featured: false
draft: false
---
```

将 `draft` 设为 `true` 时，开发环境仍可预览，生产构建会排除该内容。

### 新短笔记

在 `content/notes/` 新建 `.md` 文件：

```yaml
---
title: 笔记标题
date: 2026-08-29
tags:
  - 随想
draft: false
---
```

### 新项目

在 `content/projects/` 新建 `.md` 文件：

```yaml
---
title: 项目名称
description: 项目摘要
date: 2026-08-29
status: 持续维护
tags:
  - Java
cover: /images/project-cover.svg
demo: https://example.com
repository: https://github.com/username/repository
featured: true
draft: false
---
```

## 创建仓库并部署

1. 在 GitHub 创建空仓库，不要勾选自动生成 README。
2. 在项目目录初始化并推送：

   ```bash
   git init
   git add .
   git commit -m "Initial blog"
   git branch -M main
   git remote add origin https://github.com/CzlRx/MyBlog.git
   git push -u origin main
   ```

3. 打开仓库的 **Settings → Pages**，在 **Build and deployment** 中选择 **GitHub Actions**。
4. 推送到默认分支后，`.github/workflows/deploy.yml` 会自动执行 `npm ci`、Lint、构建并部署 `out/`。

工作流会读取 `GITHUB_REPOSITORY`：

- 普通仓库 `owner/repository` 自动使用 `/repository` 作为 `basePath`；
- 仓库名为 `owner.github.io` 时使用根路径，不添加 `basePath`。

无需把 `out/` 提交到源码分支。

## 环境变量与自定义域名

构建时可覆盖：

| 变量 | 用途 | 示例 |
| --- | --- | --- |
| `SITE_URL` | canonical、RSS、sitemap 使用的域名 | `https://blog.example.com` |
| `BASE_PATH` | 强制设置或清空部署子路径 | `/MyBlog` 或空字符串 |
| `NEXT_PUBLIC_BASE_PATH` | `BASE_PATH` 的兼容变量 | `/MyBlog` |

使用自定义域名时：

1. 在 GitHub Pages 设置中填写域名并配置 DNS；
2. 在仓库 **Settings → Secrets and variables → Actions → Variables** 中设置 `SITE_URL`；
3. 设置 `BASE_PATH` 为空字符串，确保站点从域名根路径加载；
4. 如需版本化域名，可创建 `public/CNAME`，内容只有自定义域名。

## 常见路径问题

- **本地正常、线上样式或图片 404**：确认部署使用了 Actions 工作流，且没有手动覆盖错误的 `BASE_PATH`。
- **链接出现两次仓库名**：内部页面使用 Next.js `Link` 时不要手动拼接 `basePath`；公共图片才使用 `withBasePath()`。
- **换成自定义域名后仍带仓库名**：把 Actions 变量 `BASE_PATH` 设为空，并重新运行工作流。
- **文章刷新 404**：保留 `trailingSlash: true`，并确认上传的是完整 `out/` 目录。
- **开发模式搜索不可用**：Pagefind 只在生产构建后生成；运行 `npm run build` 和 `npm run start` 预览搜索。

## 目录结构

```text
content/             Markdown 内容
public/images/       本地图片资源
scripts/             构建后静态文件生成脚本
src/app/             App Router 页面
src/components/      界面与少量客户端增强组件
src/config/site.ts   站点资料
src/lib/             内容、Markdown 与路径工具
.github/workflows/   GitHub Pages 部署工作流
```
