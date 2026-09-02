export const siteConfig = {
  name: "CzlRx的个人博客",
  shortName: "CzlRx",
  author: "CzlRx",
  description: "正在努力成为一名优秀的后端工程师",
  identity: "软件工程 学生",
  city: "江苏 常州",
  statement: "把复杂的问题拆开，也把路上的微小发现认真记下来。",
  email: "chen2799140721@outlook.com",
  githubUsername: "CzlRx",
  repositoryName: "MyBlog",
  siteOrigin: "https://czlrx.github.io",
  avatar: "/images/avatar.jpg",
  defaultOgImage: "/images/og-default.svg",
  accentColor: "#B5533C",
  locale: "zh-CN",
  language: "zh",
  timezone: "Asia/Shanghai",
  nowSummary: "正在深入学习数据库和redis缓存,也在打磨这个博客的内容和工程细节。",
  now: {
    title: "现在",
    heading: "此刻，我在做什么",
    description: "一张低频更新的公开快照，记录当前真正投入时间的事情。",
    metaDescription: "CzlRx 最近正在学习、制作和关注的事情。",
    updated: "2026 年 8 月 29 日",
    body: `
## 正在学习

把 Java Web 的知识从“会用”重新整理到“知道为什么”。最近的重点是 JVM、并发基础、MySQL 索引与事务，以及如何为服务写出更容易定位问题的日志。

## 正在制作

持续维护这个纯静态博客。它既是内容容器，也是一项前端工程练习：如何在不引入服务端的前提下，做好搜索、SEO、主题模式和 GitHub Pages 的路径兼容。

## 正在调整

- 每周留出固定时间做完整的小项目，而不是只看教程
- 用{{notesLabel}}保留过程中的判断和疑问
- 保持运动和稳定作息，让学习可以持续

> “现在”页面的价值不在于展示忙碌，而在于定期校准方向。

这页最后更新于 **{{nowUpdated}}**。下一次更新时，我会保留真正发生变化的部分。
`,
  },
  about: {
    title: "关于我",
    direction: "后端工程",
    body: `
## 你好，我是 {{author}}

我是一名 {{identity}}，目前在 {{city}} 生活和学习。比起急着给自己贴上很多标签，我更愿意说：**正在努力成为一名可靠的后端工程师**。



## 我关心的事

- Java 与服务端工程的基础能力
- 数据库、网络与操作系统背后的机制
- 可维护的软件设计，而不只是“能跑”
- 更稳定、可持续的学习节奏

## 关于写作

这里不会追求日更。文章发布前，我希望至少做到两件事：例子可以运行，结论能说出边界。{{notesLabel}}则更像公开的学习便笺，保留一些还没有长成体系的观察。

如果你发现了错误，或者刚好也在研究相似的问题，欢迎[给我写邮件]({{email}})。外部链接也可以从我的 [GitHub]({{githubUrl}}) 找到。
`,
  },
  navigation: [
    { label: "首页", href: "/" },
    { label: "文章", href: "/articles/" },
    { label: "随笔", href: "/notes/" },
    { label: "项目", href: "/projects/" },
    { label: "情侣空间", href: "/love/" },
    { label: "关于", href: "/about/" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

export function getNavigationLabel(href: string, fallback: string): string {
  return siteConfig.navigation.find((item) => item.href === href)?.label ?? fallback;
}

export function resolveSiteContent(content: string): string {
  return content
    .replaceAll("{{author}}", siteConfig.author)
    .replaceAll("{{identity}}", siteConfig.identity)
    .replaceAll("{{city}}", siteConfig.city)
    .replaceAll("{{notesLabel}}", getNavigationLabel("/notes/", "随笔"))
    .replaceAll("{{email}}", `mailto:${siteConfig.email}`)
    .replaceAll("{{githubUrl}}", `https://github.com/${siteConfig.githubUsername}`)
    .replaceAll("{{nowUpdated}}", siteConfig.now.updated);
}
