---
title: 网站图片是怎么进对象存储的：从 OSS 是什么，讲到签名直传和回调
description: 从桶和业务库各存什么讲起，分清签名直传时前端要的票、三个地址分别指向谁，以及 OSS 回调为什么还要给 OSS 回 JSON。
date: 2026-09-19
tags:
  - OSS
  - 对象存储
  - 后端
  - 工程实践
cover: /images/cover-oss.svg
featured: true
draft: false
---

> 面向第一次接阿里云 OSS 的后端 / 全栈。读完应能分清：桶和业务库各存什么、页面上的图谁去拉、直传时前端到底向后端要了什么、OSS 回调为什么还要给 OSS 回 JSON。
>
> 对照官方文档：[服务端签名直传并设置上传回调](https://help.aliyun.com/zh/oss/user-guide/python-1)、[Callback](https://help.aliyun.com/zh/oss/developer-reference/callback)。

打开一个电商详情页，封面图并不是后端接口里塞进来的一串二进制。更常见的是：JSON 里只有一个地址，浏览器自己再向 CDN 发一次 GET。上传头像时，文件往往也不经过你的应用机，而是浏览器直传到对象存储，再由云厂商通知你的服务器入库。

国内把这套存储叫 **OSS**（Object Storage Service）。阿里云产品就叫这个名字；AWS 叫 S3，腾讯云叫 COS，开源自建常见 MinIO。概念几乎一一对应，S3 API 是事实标准。本文按阿里云直传文档来讲，换厂商品牌即可。

## 一、OSS 不是一块远程硬盘

存储大致三种：

- **块存储**：操作系统看到的「一块盘」，MySQL 数据文件落在这上面，可以随机改某一段。
- **文件存储（NAS）**：有目录树，多机挂同一份共享盘。
- **对象存储**：没有真正的目录。一份文件是一个 **Object**，用字符串 **Key** 寻址（`user/42/avatar.jpg` 里的 `/` 只是给人看的前缀）。改一个字节通常等于整份覆盖重传。

桶（**Bucket**）是容器，决定地域和默认权限。访问形态是：

```
https://<bucket>.<endpoint>/<key>
```

业务库只存 Key（或稳定的自定义域名路径），字节放 OSS。不要把图片塞进 MySQL BLOB：备份、主从、缓冲池都会被拖死，也无法走 CDN。也不要长期堆在应用机本地盘：多实例对不齐，机器挂了文件一起没。

对象存储擅长海量、整份存取、耐久、按量、和 CDN 对接。它不擅长当系统盘，也当不了数据库。Logo、Tab 图标可以跟前端工程走；用户头像、商品图、证件扫描件才是进桶的典型内容。

## 二、看图：两跳，但第一跳不是「专门要图片地址」

公开资源几乎总是这样：

```
前端 → 你的 API     商品详情 JSON 里已有 coverUrl
浏览器 → CDN/OSS    <img src="那个地址">  自动 GET
                    CDN 未命中才回源到桶
```

第一跳要的是业务数据，封面 URL 只是字段之一。第二跳是浏览器行为，流量打在 CDN 上，不打满应用机。生产环境用户看到的多半是 **CDN 自定义域名**，源站才是桶。

私有资源（合同、会员课）桶应是 private。OSS 域名收不到你站点的登录 Cookie，所以要由后端现签短时 GET URL，或 302 / 反向代理。签名 URL 不要存库——过期会全站裂图。库里永远是 Key，展示时再签。

看图是 GET，传图是 PUT/POST，不要混成一条链路。

## 三、传图：后端发的是「上传票」，不是收文件

把文件经业务 API 再 `putObject`，小文件能跑，大文件会把网关和内存打满。生产更常见的是文档里的 **服务端签名直传（PostObject）**：

```
浏览器 --要票（不带文件）--> 你的后端 --AssumeRole--> STS
你的后端用临时票签好 Policy，把整套字段还给浏览器

浏览器 --POST 文件----------> host（桶的 Endpoint）
OSS 存成功
OSS  --POST 元数据---------> callbackUrl（你的公网入库接口）
你回 200 + JSON 给 OSS
OSS 把同一份 JSON 作为上传响应 --> 浏览器
```

请记住三个地址，示例代码里它们经常写在一起：

| 名字 | 指向谁 | 谁去访问 |
|---|---|---|
| `host` | 你的 Bucket | **浏览器** POST 文件 |
| `callbackUrl` | 你的业务接口 | **OSS** POST 上传结果 |
| STS Endpoint | 阿里云 STS | **你的后端** 换临时票 |

`host` 形如 `https://<桶名>.oss-<地域>.aliyuncs.com`，从控制台抄。看图用的 CDN 域名不要填在这里。`callbackUrl` 必须是 OSS 机房能打到的公网地址，`localhost` 不行；文档里的 `oss-demo.aliyuncs.com:23450` 只是演示服务。

后端因此需要 **两个接口**：一个给前端「要票」，一个给 OSS「入库」。文件只出现在打向 `host` 的那一跳。

## 四、上线前要齐的，不只有一个 ARN

文档环境变量是三件：

| 变量 | 实际是什么 |
|---|---|
| `OSS_ACCESS_KEY_ID` / `SECRET` | 业务机上 RAM **用户**的长期密钥，权限尽量只留 `AliyunSTSAssumeRoleAccess` |
| `OSS_STS_ROLE_ARN` | 被扮演的 **RAM 角色** 的全球唯一名，形如 `acs:ram::<账号ID>:role/<角色名>` |

ARN 从 RAM 控制台「角色」页复制，不是 Bucket 名，不是短角色名，也不是 `acs:oss:...`。长期 AK 故意不能直接传文件；角色上才挂最小的 `oss:PutObject`。扮演之后得到会过期的临时票（常见一小时），再用它签直传。

另外还要：Bucket 的 CORS（允许浏览器 POST）、角色的信任策略、以及你自己的公网回调 URL。RAM 用户有 AssumeRole、角色有 PutObject——两段不要配反。

## 五、前端要的「签名」是整套票

接口往往叫 `/get_post_signature_for_oss_upload`。这里的签名 **不是** 文件 MD5，**不是** 下载 URL，**也不是** 把 AccessKey 塞给浏览器。

可以把它想成盖章的许可证：

1. 后端写好 **Policy**（JSON）：哪个桶、key 必须以什么前缀开头、文件多大、几点过期。
2. 用 STS 临时 Secret 派生 SigningKey，对 `Base64(Policy)` 做 HMAC-SHA256，得到 `signature`（文档是 OSS4 算法）。
3. 把 Policy 原文（Base64）和章一起给前端，**Secret 留在服务端**。
4. 前端原样放进表单，和 `file` 一起 POST 到 `host`。`file` 必须是最后一个表单域。
5. OSS 重算：过期了、越权了、章对不上，直接拒。浏览器没有密钥，改不了许可证。

一次要票，后端通常还给这些：

| 字段 | 前端怎么用 |
|---|---|
| `policy` / `signature` | 表单里原样带上，二者必须配对 |
| `x_oss_credential` / `x_oss_date` / 签名版本 | V4 验签的公开元数据 |
| `security_token` | 表单域 `x-oss-security-token` |
| `host` | `fetch` 的 URL |
| `dir` | 自己拼 `key = dir + 文件名` |
| `callback` | Base64 后的**整段**回调 JSON，不是只给一个 URL 字符串 |

过期了不要在前端「修」signature，重新要一张票。

另有一条路是把临时 AK/SK/Token 交给前端 SDK 自己 `putObject`。权限必须极窄。阿里云这篇示例走的是 **服务端签 PostPolicy**，返回值不是「把 AK 塞给浏览器」。

## 六、`security_token` 不是签名，也不是 Secret

STS `AssumeRole` 发下来的是三件套：临时 AccessKeyId、AccessKeySecret、**SecurityToken**。长期 RAM 用户只要前两件；**临时票必须三件**，缺 token，OSS 当这把 AK 是废号。

- Secret：只留服务端，用来盖 `signature`。
- Token：每个用这套临时票的请求都要带，证明「这把 AK 属于这一次扮演」（哪个角色、什么会话、何时过期）。前端不会用它算 HMAC，但表单和 Policy 的 conditions 里必须是同一串。

有效期内它仍是持有者凭证，走 HTTPS，别进日志和 Git。漏带或拿了上一张旧 token，表面上很像签名失败。

## 七、回调：OSS 来通知你，你还得回 OSS

直传绕过了业务 API，服务端默认不知道文件到没到。让前端事后再报 Key 可以伪造。**上传回调**是：对象已经进桶之后，OSS 主动 POST 你的 `callbackUrl`，带上 `${object}`、大小、ETag 等。

配置是一段 JSON，Base64 后放进表单域 `callback`：

```json
{
  "callbackUrl": "https://api.yourdomain.com/oss/callback",
  "callbackBody": "filename=${object}&size=${size}&mimeType=${mimeType}",
  "callbackBodyType": "application/x-www-form-urlencoded"
}
```

可选 `callback-var` 带 `x:uid` 这类业务字段，否则 OSS 只知道对象名，不知道是哪个用户。

OSS 打过来之后，你的接口是这次 HTTP 的**服务端**，必须在 **5 秒内** 回：

- HTTP **200**
- 头里有 **`Content-Length`**
- Body 是**合法 JSON**（不要 HTML、不要 UTF-8 BOM）

最小例子：`{"Status":"OK"}`。`Status` 不是魔法字段，JSON 合法即可，也可以带入库后的文件 id。OSS 把这份 body **原样**当作浏览器那次直传的响应——所以前端看到的「上传成功」其实是你回调接口写的。不要再另开一条「通知前端」的连接；浏览器等的就是这个。

不回、超时、非 200、body 不合法：文件**已经在桶里了**，浏览器收到 **203 CallbackFailed**，OSS **不重试**。入库失败就不要装 200；已经写库就应 200，转码丢队列，别卡在 5 秒里。

调用方是 OSS，不带用户 Cookie。该验请求头里的 `Authorization` 和 `x-oss-pub-key-url`，别拿登录 session 当唯一门禁。

## 八、一张对照表，避免把词用滑

| 容易说滑的话 | 更准的说法 |
|---|---|
| 后端「上传文件接口」收前端的文件 | 收「我要传」，发签名票；文件不进这台机器 |
| 把临时 AK/SK 给前端 | 服务端签 Policy；前端带 signature + token |
| 返回 callbackUrl 让前端去回调 | 返回编好的 callback；**OSS** 去 POST 你 |
| 前端拿到 key 再 POST | POST 的 URL 是 `host`；`key` 是表单字段 |
| `host` 就是回调地址 | `host` 是桶；`callbackUrl` 才是你的公网接口 |
| 库里存签名后的图片 URL | 库里存 Key，展示时再签 |

费用上，流出流量往往比「存着不动」更贵。桶默认 private，不要 `public-read-write`。AccessKey 进前端或进 Git，等于请别人拿你的桶当网盘。

---

直传的本质就一句：**浏览器把文件交给桶，服务端只负责发票和记账。** 票是 Policy 加盖章，账是 OSS 回调你写库。把三个地址、两套后端接口、三件套临时凭证分清，这篇官方示例就可以对着写了。
