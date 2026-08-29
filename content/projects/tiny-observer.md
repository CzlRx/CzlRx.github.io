---
title: Tiny Observer
description: 面向个人项目的轻量请求日志查看器，用来练习结构化日志、过滤与延迟分布展示。
date: 2026-07-18
status: 原型完成
tags:
  - TypeScript
  - 可观测性
  - 前端
cover: /images/project-observer.svg
demo: ""
repository: https://github.com/CzlRx
featured: true
draft: true
---

它读取一组本地 JSON 日志，按照路由、状态码和耗时区间进行聚合。没有做成通用监控平台，而是刻意保留一个窄目标：帮助我在课程项目里快速找到最慢的一组请求。

这个原型让我更直观地理解平均值和分位数之间的差异，也让我意识到日志字段的命名一致性比图表数量重要得多。
