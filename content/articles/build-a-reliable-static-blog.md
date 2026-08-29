---
title: 从零搭建一个可靠的纯静态博客
description: 不依赖数据库和常驻服务，梳理内容、构建、搜索与 GitHub Pages 路径之间真正需要处理的边界。
date: 2026-08-22
updated: 2026-08-28
tags:
  - Next.js
  - 静态网站
  - 工程实践
cover: /images/cover-static-blog.svg
featured: true
draft: false
---

做一个博客并不难，难的是让它在半年后仍然容易修改、在子路径部署时不丢资源、在没有 JavaScript 时依旧能读。这个站点选择纯静态导出，不是为了追求“零后端”这个标签，而是因为它刚好符合内容网站的约束。

![一张由文件、构建流程和浏览器组成的静态博客示意图](/images/diagram-static-pipeline.svg "内容文件经过构建后成为可直接托管的静态页面")

## 先写清楚约束

开始写组件以前，我先把边界列在纸上：

1. 文章来自仓库里的 Markdown 文件；
2. 页面在构建阶段一次性生成；
3. 搜索索引也必须跟随构建产物；
4. 站点既可能部署在域名根路径，也可能部署在仓库子路径；
5. 核心阅读不依赖客户端脚本。

这几条约束会直接排除数据库、运行时 API 和服务端渲染。更重要的是，它们能帮助我判断一个功能该放在哪里：内容解析属于构建阶段，主题切换属于浏览器，路径推导属于部署配置。

> 架构选择不是技术名词的排列组合，而是把每种变化放进成本最低的位置。

## 内容模型比页面更早

文章的 frontmatter 是内容和界面之间的合同。字段不需要多，但必须稳定：

```yaml
title: 从零搭建一个可靠的纯静态博客
description: 梳理内容、构建与部署的边界
date: 2026-08-22
updated: 2026-08-28
tags:
  - Next.js
  - 静态网站
featured: true
draft: false
```

读取时我会把日期统一成 ISO 字符串，把缺少的布尔值收敛为 `false`，再按照日期倒序。这样页面组件不必反复猜测数据形状。

```ts title="src/lib/content.ts"
function byDate<T extends { date: string }>(a: T, b: T) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function visible<T extends { draft: boolean }>(items: T[]) {
  return process.env.NODE_ENV === "development"
    ? items
    : items.filter((item) => !item.draft);
}
```

| 决策 | 放置位置 | 原因 |
| --- | --- | --- |
| 草稿过滤 | 内容读取层 | 所有列表和动态路由共享规则 |
| 阅读时长 | 构建阶段 | 内容不会在浏览器里变化 |
| 主题偏好 | 浏览器 | 属于每位读者的本地选择 |
| `basePath` | 构建配置 | 部署环境决定最终路径 |

## 静态动态路由

文章详情看起来是动态路由，但它的“动态”只存在于文件名。构建时，`generateStaticParams` 会枚举所有公开文章：

```ts
export function generateStaticParams() {
  return getAllArticles().map(({ slug }) => ({ slug }));
}
```

每一个 slug 都会得到一份完整 HTML。浏览器刷新详情页时，请求的是目录中的 `index.html`，不需要 Next.js 服务器参与。这也是为什么 `trailingSlash: true` 对 GitHub Pages 很重要。

### 为什么不用运行时接口

搜索常被误认为一定需要后端。Pagefind 会在 `next build` 之后扫描导出的 HTML，生成一组分片索引。用户输入关键词时只下载相关分片，既能全文搜索，也不需要把全部内容塞进首屏 JavaScript。

构建链路因此非常直接：

```text
Markdown → Next.js 静态导出 → 补充 RSS / sitemap → Pagefind 建索引 → out/
```

## 子路径是最容易忽略的部分

仓库页面的真实地址通常是 `https://name.github.io/repository/`。如果图片仍写成 `/images/cover.svg`，浏览器会去域名根目录查找，它不会知道仓库名。

我的处理分成三类：

- Next.js 的 `<Link>` 交给框架处理；
- 静态资源统一经过 `withBasePath()`；
- canonical、RSS 和 sitemap 使用 `absoluteUrl()` 生成绝对地址。

```ts
export function absoluteUrl(path = "/") {
  return `${getSiteOrigin()}${withBasePath(path)}`;
}
```

这里最值得测试的是“不要重复拼接”。一个已经包含 `/repository/` 的路径再次经过工具函数时，结果必须保持不变。[^basepath]

## 让核心内容保持静态

主题切换、阅读进度、复制代码都需要少量客户端逻辑，但正文不应该因此变成运行时请求。构建阶段已经把 Markdown 转成语义化 HTML，客户端脚本只在页面加载后添加增强能力。

这种思路常被称为渐进增强：

- HTML 负责内容和结构；
- CSS 负责不同设备和主题下的可读性；
- JavaScript 负责可选的效率提升。

即使复制按钮没有加载，代码仍然存在；即使阅读进度失效，标题和目录仍然可用。这不是对现代前端的拒绝，而是让技术回到它应该承担的位置。

## 最后检查什么

我会把交付前检查缩成四组：

1. **内容**：草稿、日期、标签和动态路由是否一致；
2. **构建**：类型、Lint、静态导出和索引是否都成功；
3. **路径**：根路径与仓库子路径各构建一次；
4. **体验**：键盘、暗色模式、360px 宽度和无脚本阅读。

一套可靠的静态博客没有神奇的部分。它只是把几个容易被忽略的细节——内容合同、路径边界、构建顺序和阅读退化——认真地放在一起。

[^basepath]: GitHub Pages 的项目站点与用户主页站点规则不同：名为 `username.github.io` 的仓库使用根路径，普通仓库则使用仓库名作为子路径。
