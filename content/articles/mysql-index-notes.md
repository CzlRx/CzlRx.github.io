---
title: 我如何理解 MySQL 联合索引
description: 从 B+ 树的排序方式出发，理解最左前缀、范围查询与覆盖索引，而不是背诵零散口诀。
date: 2026-08-12
updated: 2026-08-18
tags:
  - MySQL
  - 数据库
  - 后端
cover: /images/cover-index.svg
featured: true
draft: false
---

第一次学习联合索引时，我记住了“最左前缀”，却很难判断一条稍微复杂的 SQL 到底会怎样使用索引。后来我发现，问题不在口诀不够多，而在于脑中没有那棵**按索引列顺序排列的树**。

## 从一个查询开始

假设有一张订单表：

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  INDEX idx_user_status_time (user_id, status, created_at)
);
```

联合索引的键并不是三个互不相关的目录，而是一个有顺序的复合值：先比较 `user_id`，相同后再比较 `status`，仍相同才比较 `created_at`。

可以把局部顺序想象成：

```text
(101, paid,    2026-08-01)
(101, paid,    2026-08-03)
(101, pending, 2026-08-02)
(102, paid,    2026-08-01)
```

## 最左前缀不是语法顺序

下面两条 SQL 都能够利用 `user_id` 和 `status`：

```sql
SELECT id FROM orders
WHERE user_id = 101 AND status = 'paid';

SELECT id FROM orders
WHERE status = 'paid' AND user_id = 101;
```

优化器不会因为 `WHERE` 里的书写顺序改变而失忆。真正重要的是，查询条件能否在复合键的排序中形成连续、可定位的范围。

| 条件 | 可用于定位的索引列 | 说明 |
| --- | --- | --- |
| `user_id = ?` | `user_id` | 命中第一列 |
| `user_id = ? AND status = ?` | 前两列 | 形成更小范围 |
| `status = ?` | 通常不能直接定位 | 缺少最左列 |
| `user_id = ? AND created_at > ?` | 第一列与第三列 | 中间列缺失，具体行为看优化器 |

“不能直接定位”不等于索引毫无价值。MySQL 可能使用索引扫描、索引下推或其他优化，但这和最理想的树定位不是同一件事。

## 范围条件为什么容易截断

看这条查询：

```sql
SELECT id, amount
FROM orders
WHERE user_id = 101
  AND status > 'paid'
  AND created_at >= '2026-08-01';
```

在固定 `user_id` 后，`status > 'paid'` 已经对应一段连续范围。在这个范围里，记录首先按各种不同的 `status` 排列，`created_at` 只在 status 相同的小组内部有序。因此第三列通常无法继续缩小扫描边界。

这就是“范围条件后面的列无法继续用于索引定位”背后的结构原因。它不是数据库人为制定的限制，而是排序信息在这一层已经不再全局连续。

## 覆盖索引减少了什么

InnoDB 二级索引叶子节点会保存主键值。如果查询只需要索引中已有的列和主键，就可以直接返回结果，减少回到聚簇索引查整行的过程。

```sql
SELECT id, created_at
FROM orders
WHERE user_id = 101 AND status = 'paid';
```

这条查询可能形成覆盖索引。相反，加入 `amount` 后，由于它不在 `idx_user_status_time` 中，通常还要根据主键回表。

> 覆盖索引不是一种新的索引结构，而是“一次查询所需的信息刚好都在当前索引里”。

但不要为了覆盖所有查询，把大量列无脑塞进索引。更宽的索引会占用更多磁盘与缓存，写入时也有更高维护成本。

## 用 EXPLAIN 验证，而不是猜

我现在形成了一个简单流程：

1. 根据索引列顺序，画出查询对应的复合值范围；
2. 判断范围是否连续，哪些列只能做过滤；
3. 用 `EXPLAIN ANALYZE` 查看预估和实际扫描行数；
4. 结合真实数据分布，而不是只看测试表里的十几行。

```sql
EXPLAIN ANALYZE
SELECT id, created_at
FROM orders
WHERE user_id = 101 AND status = 'paid';
```

需要关注的不只是 `key` 字段，还包括实际返回行数、循环次数和耗时。索引是否“被选择”只是开始，扫描范围是否足够小才更接近性能问题的核心。[^selectivity]

## 我的记忆方式

现在我不再单独记最左前缀，而是记住一句更长的话：**联合索引按照从左到右的复合值排序，查询需要先确定左侧列，才能利用后续列的局部有序性。**

当一条 SQL 让我犹豫时，我会把几个样本键按字典序写出来。通常，答案会比继续翻口诀更快出现。

[^selectivity]: 当某个值占据表中很大比例时，即使条件满足索引结构，优化器也可能判断全表扫描成本更低。
