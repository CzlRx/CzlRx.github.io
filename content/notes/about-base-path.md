---
title: basePath 不是给每个链接手动加前缀
date: 2026-08-14
tags:
  - Next.js
  - 静态网站
draft: true
---

内部页面链接、公共资源、搜索索引和 canonical URL 对路径的处理方式不同。统一的目标不是“所有地方都拼同一个字符串”，而是明确谁负责拼接，并保证只拼一次。

框架能处理的链接交给框架；Markdown 中的根路径资源在构建时改写；绝对 URL 最后组合站点 origin 与部署子路径。
