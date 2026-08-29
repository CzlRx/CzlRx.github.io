---
title: 课表与提醒服务
description: 一个围绕课程、周次和提醒规则设计的 Java 服务端练习，重点是清晰的数据边界与可测试性。
date: 2026-08-10
status: 持续维护
tags:
  - Java
  - Spring Boot
  - MySQL
cover: /images/project-schedule.svg
demo: ""
repository: https://github.com/CzlRx
featured: true
draft: true
---

课程项目最初只是一个 CRUD 练习，后来我把重点放在“周次”这种不规则时间模型上。课程并不是每周都发生，调课也不能直接覆盖原始安排。

目前实现了课程模板、学期周次、临时调整与提醒查询。下一步准备补充基于真实数据库的集成测试，并把时间计算从 Controller 中完全移出。
