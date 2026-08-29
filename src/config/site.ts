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
  navigation: [
    { label: "首页", href: "/" },
    { label: "文章", href: "/articles/" },
    { label: "随笔", href: "/notes/" },
    { label: "项目", href: "/projects/" },
    { label: "关于", href: "/about/" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
