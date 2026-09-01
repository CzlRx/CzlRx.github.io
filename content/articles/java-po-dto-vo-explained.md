---
title: Java 分层对象命名指南：PO、DO、DTO、VO、BO、AO、Query 到底怎么选
description: 从实际开发场景出发，梳理 Java 后端常见分层对象的职责、边界与命名选择。
date: 2026-09-01
tags:
  - Java
  - Spring Boot
  - 后端
  - 工程实践
cover: /images/cover-learning.svg
featured: false
draft: false
---

在 Java 后端开发中，我们经常会看到 `UserPO`、`UserDTO`、`UserVO` 这类命名，很多人知道要这么写，却说不清楚为什么。这篇文章从实际场景出发，把这套命名体系讲透。

## 一、为什么需要这么多种对象

如果把数据库表结构直接暴露给前端会怎样？

```java
// 危险写法：Controller直接用数据库实体接收/返回
@PostMapping("/register")
public void register(@RequestBody UserPO user) {
    userMapper.insert(user);
}
```

至少有两个问题：

1. **安全隐患**：`UserPO` 里可能有 `role`、`status` 等字段，前端在请求体里多塞一个 `"role": "admin"`，框架反序列化时会原样落进对象，直接写入数据库——这是经典的 **Mass Assignment 漏洞**。
2. **字段冗余/耦合**：数据库字段变了，前端接口也要跟着变；前端不需要的字段（如 `deleteFlag`、`updateTime`）也会被暴露出去。

解决方式就是分层——每一层用专属的对象，只携带这一层该有的数据。

## 二、DAO 层：先搞清楚数据从哪来

**DAO（Data Access Object）** 是专门负责跟数据库打交道的一层，只做 CRUD，不掺杂业务逻辑。

```java
public interface UserMapper {
    UserPO selectById(Long id);
    int insert(UserPO user);
}
```

在 MyBatis 项目里常叫 `Mapper`，JPA 项目里叫 `Repository`，本质是同一层。

分层调用链条如下，**Controller 不应该直接调用 DAO**，必须经过 Service：

```
Controller (Web层)
    ↓
Service (业务层)
    ↓
DAO (数据访问层)
    ↓
数据库
```

## 三、六种对象逐一拆解

### PO / DO —— 数据库表的映射

**PO（Persistent Object，持久化对象）** 和 **DO（Data Object，数据对象）** 严格来说定义略有不同：PO 是更早、更通用的 J2EE 概念，强调“持久化动作”；DO 是阿里巴巴《Java开发手册》定义的规范术语，强调“DAO 层向上传输的数据载体”。但在实际代码里，二者结构完全一样——都是与数据库表**一一对应**的纯贫血模型（只有属性和 getter/setter）：

```java
@Table(name = "user")
public class UserPO {  // 或叫 UserDO，一个项目里统一一种即可
    private Long id;
    private String username;
    private String password;
    private LocalDateTime createTime;
}
```

**手册强制规定：DO 禁止跨越到 Controller/Web 层**，只能在 DAO 与 Service 之间传输。

### DTO —— 跨层/跨系统传输的标准格式

**DTO（Data Transfer Object，数据传输对象）** 是前后端通信的标准格式，也是服务内部不同模块之间传输数据的载体。它的意义不只是“分层好看”，而是：

- **接口契约**：字段稳定、需要版本管理，改动要谨慎
- **输入白名单**：只暴露需要的字段，天然阻断 Mass Assignment 攻击
- **校验载体**：`@NotNull`、`@Length` 等注解在 DTO 上做参数校验
- **聚合塑形**：可以把多张表的数据聚合成前端友好的一个结构

```java
@Data
public class RegisterDTO {
    @NotBlank
    @Length(min = 4, max = 20)
    private String username;

    @NotBlank
    @Length(min = 6)
    private String password;
    // 没有role、id字段——前端传了也不会被接收
}
```

### VO —— 展示层专属，但在前后端分离场景已经“名不副实”

**VO（View Object，视图对象）** 的手册原始定义是“Web 层向模板渲染引擎传输的对象”——这是服务端渲染（JSP/Thymeleaf）时代的产物：

```java
@GetMapping("/order/view")
public String viewOrder(Long id, Model model) {
    model.addAttribute("order", orderService.buildOrderVO(id));
    return "order-detail"; // 模板引擎渲染成HTML
}
```

在纯前后端分离项目里，这个场景基本消失了，所以很多团队的 `XxxVO` 实际上就是当 DTO 在用，只是命名习惯沿用了下来——遇到这种代码不用纠结，本质没有区别。

**VO 真正值得存在的场景**是有独立于 API 契约、且被多处复用的展示加工逻辑，比如：

- **Excel 导出**：列名、格式跟 JSON 接口字段完全是两套东西，硬塞进 DTO 会让注解满天飞
- **同一份计算结果，多端展示成不同形态**：比如统计数据，后台要明细、小程序只要摘要，可以先算出一个内部 VO，再各自加工成不同的 DTO

### BO —— Service 层内部的业务计算中间产物

**BO（Business Object，业务对象）** 聚合多个 PO/DO 的属性，并封装业务逻辑，是“轻量充血模型”（除了属性还有业务方法，这点和 DO/DTO/VO 的纯贫血模型不同）：

```java
public class OrderSettleBO {
    private BigDecimal originPrice;
    private BigDecimal discountAmount;

    public BigDecimal calcFinalPrice() {  // 充血——带业务方法
        return originPrice.subtract(discountAmount);
    }
}
```

BO 只在 Service 层内部流转，不传到 Controller，也不传到 DAO。

### AO —— 使用频率最低的一个

**AO（Application Object，应用对象）** 手册定义是“Web 层与 Service 层之间抽象的复用对象模型”。实践中很少有项目严格区分这个概念，大部分团队直接用 DTO 顶替这个位置，了解概念即可，不必强求项目中一定要有它。

### Query —— 唯一带强制规约的对象

手册明确要求：**超过 2 个参数的查询，禁止使用 Map 类传输，必须封装成 Query 对象**。

```java
// 反面例子——违反规约
public List<UserDTO> listUsers(Map<String, Object> params) {
    String name = (String) params.get("name");  // 调用方不知道该传什么key，无类型提示
}

// 正确写法
@Data
public class UserQuery {
    private String username;
    private Integer status;
    private Integer pageNum = 1;
    private Integer pageSize = 20;
}
```

Query 专门承载“查询意图”，跟 DTO（数据结果）是相反方向的东西。

## 四、Query 和 Request 是一回事吗

这个问题要分两个层面看，因为“Request 对象”这个词本身有歧义。

### 层面一：如果指 HttpServletRequest（原始请求）

两者完全不在一个抽象层级。`HttpServletRequest` 是 Servlet 规范层面的对象，携带整个 HTTP 请求的原始信息（Header、Cookie、参数流等）；Query 对象是从这些原始参数里**解析、提炼**出来的业务参数载体。Request 是原始输入，Query 是加工后的结果。

### 层面二：如果指接口入参封装类（`XxxRequest`/`XxxReq`）

这种情况下确实经常和 Query 概念重叠，但严格区分的话，二者的语义侧重点不同，并且分别对应不同的参数接收方式：

| | Query 类 | Request 类 |
|---|---|---|
| 语义 | 查询条件，通常对应 `GET`/查询类接口 | 提交的业务数据，可以是查询，也可以是新增/修改等任意操作 |
| 接收注解 | `@RequestParam`（逐个）或不加注解自动绑定 | `@RequestBody` |
| 数据来源 | URL 查询字符串（`?name=xxx&status=1`） | HTTP 请求体（JSON） |
| 是否含分页 | 通常带 `pageNum`/`pageSize` | 不一定 |

```java
// Query —— GET请求,参数在URL上,Spring自动把URL参数绑定到对象字段
@GetMapping("/users")
public List<UserDTO> listUsers(UserQuery query) {
    // 前端请求: GET /users?username=abc&status=1&pageNum=1
}

// Request —— POST请求,参数在请求体里,必须用@RequestBody显式声明
@PostMapping("/order/create")
public OrderDTO createOrder(@RequestBody OrderCreateRequest request) {
    // 前端请求体: { "userId": 1, "productIds": [1,2,3], "addressId": 5 }
}
```

这不是命名喜好，是 HTTP 语义决定的：查询（GET）按 REST 语义不该带请求体，条件天然放 URL 上，用 Query 接收；创建/修改（POST/PUT）往往涉及嵌套结构，必须放请求体，用 `@RequestBody` + Request 对象接收。

### 一个例外：复杂查询也可能走 POST

有些查询条件复杂（多个数组、嵌套对象），放 URL 里编码很丑，会把查询也做成 POST 接口：

```java
// 语义仍是查询,只是接收方式换成了@RequestBody
@PostMapping("/users/search")
public PageResult<UserDTO> searchUsers(@RequestBody UserQuery query) {
    // 请求体: { "username": "abc", "tags": ["vip","active"] }
}
```

这种情况下对象依然该叫 **Query**，因为命名要跟着“业务语义”（是查询还是提交数据），不是跟着“接收注解”。

### 结论

严格按阿里手册语境，Query 是查询类参数的专属命名（且有强制规约）；Request 更多是团队自定义的、泛指所有类型接口入参的命名习惯。很多不严格遵循手册的项目会用 `XxxRequest` 统一命名所有入参，不细分 Query，这种情况下 `XxxRequest` 实际上就承担了 Query 该做的事，本质不冲突，只是命名视角不同。

## 五、完整数据流转图

```
前端请求（筛选条件）
    ↓
Controller 接收 → Query（查询参数对象）
    ↓
Service 层业务处理 → BO（聚合计算，可带业务方法）
    ↓
DAO 层数据库交互 → DO/PO（表结构对象，禁止跨到Controller）
    ↓
Service 层转换 → DTO（对外传输结果）
    ↓
返回前端
```

（AO 理论上卡在 Controller 和 Service 之间，实践中大多数项目直接跳过，用 DTO 或 Query 顶替。）

## 六、实用建议

六个后缀里，**DO/PO、DTO、Query 是高频、值得严格遵守的**；**VO、BO、AO 在实际项目中弹性很大**，很多团队会简化合并（比如直接用 DTO 顶替 VO 的位置）。

不必为了“严格对齐手册”在小项目里硬造六层对象。手册真正的核心精神是两条：

1. **禁止跨层滥用**——尤其是别把 DO 直接返回给前端，别用 Map/JSONObject 跨层传参
2. **职责单一**——每一种对象只承担一个场景的职责，不要混用

遵守这两条核心原则，比死磕命名后缀本身重要得多。
