---
title: Spring Boot 鉴权方案全解析：拦截器 vs Shiro vs Spring Security
description: 对比拦截器、Apache Shiro 与 Spring Security 的实现方式、能力边界和适用场景，帮助 Java 项目选择合适的鉴权方案。
date: 2026-09-02
updated: 2026-09-02
tags:
  - Java
  - Spring Boot
  - 安全
  - 后端
cover: /images/cover-debug.svg
featured: false
draft: false
---
> 在 Spring Boot 项目开发中，选择合适的鉴权方案至关重要。本文将深入对比三种主流方案：拦截器、Apache Shiro 和 Spring Security，帮助你根据项目需求做出最佳选择。

## 一、拦截器（Interceptor）方案

### 1.1 什么是拦截器

拦截器是 Spring MVC 提供的轻量级请求拦截机制，工作在 Controller 层之前，可以对请求进行预处理和后处理。

### 1.2 实现方式

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) throws Exception {
        // 从请求头获取 token
        String token = request.getHeader("Authorization");
        
        if (token == null || token.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"未登录\"}");
            return false;
        }
        
        // 从 Redis 验证 token
        Object userInfo = redisTemplate.opsForValue().get("token:" + token);
        if (userInfo == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"登录已过期\"}");
            return false;
        }
        
        // 将用户信息存入 request，供 Controller 使用
        request.setAttribute("currentUser", userInfo);
        return true;
    }
}
```

**配置拦截器**：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private AuthInterceptor authInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/login", "/register", "/public/**");
    }
}
```

### 1.3 特点分析

**优势**：
- ✅ **轻量简洁** — 代码量少，逻辑清晰
- ✅ **完全自主** — 鉴权逻辑完全掌控，灵活度高
- ✅ **学习成本低** — 无需学习复杂框架，快速上手
- ✅ **适合简单场景** — token 验证、session 检查足够用

**劣势**：
- ❌ **功能有限** — 复杂权限控制需要大量手动编码
- ❌ **缺乏标准化** — 没有统一的权限管理规范
- ❌ **安全性依赖开发者** — 需要自己处理加密、CSRF 等安全问题
- ❌ **作用域受限** — 只能拦截到达 Controller 的请求，Filter 层无法拦截

### 1.4 适用场景

- 小型项目或 MVP 快速验证
- 只需要简单的登录态验证
- 单一角色或无需复杂权限控制
- 团队成员对安全框架不熟悉

---

## 二、Apache Shiro 方案

### 2.1 什么是 Shiro

Apache Shiro 是一个功能强大且易用的 Java 安全框架，提供认证、授权、加密和会话管理功能。相比 Spring Security，Shiro 的设计更简洁，学习曲线更平缓。

### 2.2 核心概念

- **Subject（主体）** — 当前操作用户
- **SecurityManager（安全管理器）** — Shiro 的核心，管理所有 Subject
- **Realm（领域）** — 安全数据源，负责获取用户、角色、权限信息

### 2.3 实现方式

**1. 添加依赖**：

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-spring-boot-web-starter</artifactId>
    <version>1.12.0</version>
</dependency>
```

**2. 自定义 Realm**：

```java
@Component
public class UserRealm extends AuthorizingRealm {
    
    @Autowired
    private UserService userService;
    
    // 认证：验证用户身份
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(
            AuthenticationToken token) throws AuthenticationException {
        
        String username = (String) token.getPrincipal();
        
        // 从数据库查询用户
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UnknownAccountException("用户不存在");
        }
        
        // 返回认证信息（Shiro 会自动对比密码）
        return new SimpleAuthenticationInfo(
            username,
            user.getPassword(), // 数据库中的密码（已加密）
            getName()
        );
    }
    
    // 授权：分配角色和权限
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(
            PrincipalCollection principals) {
        
        String username = (String) principals.getPrimaryPrincipal();
        
        // 从数据库查询用户的角色和权限
        Set<String> roles = userService.getUserRoles(username);
        Set<String> permissions = userService.getUserPermissions(username);
        
        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
        info.setRoles(roles);
        info.setStringPermissions(permissions);
        
        return info;
    }
}
```

**3. Shiro 配置**：

```java
@Configuration
public class ShiroConfig {
    
    @Bean
    public ShiroFilterFactoryBean shiroFilter(SecurityManager securityManager) {
        ShiroFilterFactoryBean filter = new ShiroFilterFactoryBean();
        filter.setSecurityManager(securityManager);
        filter.setLoginUrl("/login");
        filter.setUnauthorizedUrl("/unauthorized");
        
        // 配置访问规则
        Map<String, String> filterMap = new LinkedHashMap<>();
        filterMap.put("/login", "anon");           // 匿名访问
        filterMap.put("/register", "anon");
        filterMap.put("/admin/**", "roles[admin]"); // 需要 admin 角色
        filterMap.put("/user/**", "authc");        // 需要认证
        filterMap.put("/**", "authc");
        
        filter.setFilterChainDefinitionMap(filterMap);
        return filter;
    }
    
    @Bean
    public SecurityManager securityManager(UserRealm realm) {
        DefaultWebSecurityManager manager = new DefaultWebSecurityManager();
        manager.setRealm(realm);
        
        // 配置缓存管理器（可选，用于缓存权限信息）
        manager.setCacheManager(new MemoryConstrainedCacheManager());
        
        return manager;
    }
    
    @Bean
    public UserRealm userRealm() {
        UserRealm realm = new UserRealm();
        // 配置密码匹配器
        realm.setCredentialsMatcher(new HashedCredentialsMatcher("SHA-256"));
        return realm;
    }
}
```

**4. 在代码中使用**：

```java
@RestController
public class UserController {
    
    // 登录
    @PostMapping("/login")
    public Result login(@RequestBody LoginDTO dto) {
        Subject subject = SecurityUtils.getSubject();
        UsernamePasswordToken token = new UsernamePasswordToken(
            dto.getUsername(), 
            dto.getPassword()
        );
        
        try {
            subject.login(token);
            return Result.success("登录成功");
        } catch (UnknownAccountException e) {
            return Result.error("用户不存在");
        } catch (IncorrectCredentialsException e) {
            return Result.error("密码错误");
        } catch (LockedAccountException e) {
            return Result.error("账号已锁定");
        }
    }
    
    // 注解式权限控制
    @GetMapping("/admin/users")
    @RequiresRoles("admin")
    public Result getUserList() {
        return Result.success(userService.list());
    }
    
    @PostMapping("/user/update")
    @RequiresPermissions("user:update")
    public Result updateUser(@RequestBody User user) {
        userService.updateById(user);
        return Result.success();
    }
    
    // 编程式权限控制
    @GetMapping("/data")
    public Result getData() {
        Subject subject = SecurityUtils.getSubject();
        
        if (subject.hasRole("admin")) {
            return Result.success(allData);
        } else if (subject.hasRole("user")) {
            return Result.success(userData);
        }
        
        return Result.error("无权限");
    }
    
    // 登出
    @PostMapping("/logout")
    public Result logout() {
        Subject subject = SecurityUtils.getSubject();
        subject.logout();
        return Result.success("退出成功");
    }
}
```

### 2.4 特点分析

**优势**：
- ✅ **简单易用** — API 设计直观，比 Spring Security 容易上手
- ✅ **功能完整** — 认证、授权、加密、会话管理一应俱全
- ✅ **独立性强** — 不依赖 Spring，可用于任何 Java 项目
- ✅ **灵活配置** — 支持注解式和编程式权限控制
- ✅ **会话管理强大** — 支持分布式会话，可集成 Redis

**劣势**：
- ❌ **社区活跃度下降** — 更新频率不如 Spring Security
- ❌ **Spring 集成不够深** — 需要较多手动配置
- ❌ **现代协议支持弱** — OAuth2、JWT 等需要额外扩展

### 2.5 适用场景

- 中小型项目，需要完整的权限管理
- 需要角色和权限的细粒度控制
- 团队不想学习 Spring Security 的复杂配置
- 非 Spring 项目（如原生 Servlet 应用）

---

## 三、Spring Security 方案

### 3.1 什么是 Spring Security

Spring Security 是 Spring 生态的安全框架，提供企业级的认证和授权解决方案，深度集成 Spring Boot，支持 OAuth2、JWT、LDAP 等标准协议。

### 3.2 实现方式

**1. 添加依赖**：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**2. 安全配置**：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // 生产环境谨慎禁用
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/register", "/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/home")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login")
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // JWT 模式
            )
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**3. 自定义 UserDetailsService**：

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserDetails loadUserByUsername(String username) 
            throws UsernameNotFoundException {
        
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        
        // 查询用户权限
        List<String> authorities = userMapper.getUserAuthorities(user.getId());
        
        return org.springframework.security.core.userdetails.User
            .withUsername(username)
            .password(user.getPassword())
            .authorities(authorities.toArray(new String[0]))
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }
}
```

**4. 方法级权限控制**：

```java
@RestController
@RequestMapping("/api")
public class ApiController {
    
    @GetMapping("/admin/data")
    @PreAuthorize("hasRole('ADMIN')")
    public Result getAdminData() {
        return Result.success(data);
    }
    
    @PostMapping("/user/update")
    @PreAuthorize("hasAuthority('user:update')")
    public Result updateUser(@RequestBody User user) {
        return Result.success();
    }
    
    @GetMapping("/data")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Result getData() {
        // 获取当前登录用户
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return Result.success(data);
    }
}
```

### 3.3 特点分析

**优势**：
- ✅ **功能最完整** — 企业级安全解决方案
- ✅ **Spring 深度集成** — 与 Spring Boot 无缝配合
- ✅ **标准协议支持** — OAuth2、JWT、SAML、LDAP 开箱即用
- ✅ **细粒度控制** — 方法级别的权限注解
- ✅ **社区活跃** — 文档丰富，问题容易解决
- ✅ **安全性高** — 内置 CSRF、XSS、会话固定等防护

**劣势**：
- ❌ **学习曲线陡峭** — 配置复杂，概念较多
- ❌ **过度设计** — 简单项目会显得笨重
- ❌ **调试困难** — 过滤器链较长，问题定位不易

### 3.4 适用场景

- 企业级应用，需要符合安全标准
- 需要 OAuth2、JWT 等现代认证协议
- 微服务架构，需要统一认证中心
- 需要方法级别的细粒度权限控制
- 项目长期维护，需要稳定的技术栈

---

## 四、三大方案全面对比

| 对比维度 | 拦截器 | Shiro | Spring Security |
|---------|--------|-------|----------------|
| **学习难度** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 较高 |
| **配置复杂度** | 手动编写 | 适中 | 较复杂 |
| **功能完整性** | 基础验证 | 完整 | 非常完整 |
| **Spring 集成** | 原生支持 | 需配置 | 深度集成 |
| **社区生态** | — | 中等 | 庞大 |
| **作用层** | Controller 层 | Filter 层 | Filter 层 |
| **OAuth2 支持** | 需手动实现 | 需扩展 | 开箱即用 |
| **JWT 支持** | 需手动实现 | 需扩展 | 原生支持 |
| **方法级权限** | 需手动实现 | `@RequiresRoles` | `@PreAuthorize` |
| **密码加密** | 需手动实现 | 内置 | BCrypt 等 |
| **会话管理** | 需手动实现 | 强大（支持分布式） | 完善 |
| **CSRF 防护** | 需手动实现 | 需手动配置 | 内置 |
| **适用项目规模** | 小型 | 中小型 | 中大型 |

---

## 五、实战选择建议

### 5.1 场景驱动选择

**选择拦截器 + Redis**：
```
✓ 只需要验证用户是否登录
✓ 单一角色或无需权限控制
✓ 快速 MVP 验证
✓ 团队技术栈简单
```

**选择 Shiro**：
```
✓ 需要完整的认证授权功能
✓ 多角色、多权限管理
✓ 不想学习 Spring Security 的复杂配置
✓ 中小型项目，长期维护成本可控
```

**选择 Spring Security**：
```
✓ 企业级应用，安全要求高
✓ 需要 OAuth2、JWT、LDAP 等标准协议
✓ 微服务架构，统一认证中心
✓ 需要方法级细粒度权限控制
✓ 项目基于 Spring Boot/Cloud
```

### 5.2 技术栈组合建议

| 项目类型 | 推荐方案 | 存储方案 |
|---------|---------|---------|
| 个人博客 | 拦截器 | Redis Session |
| 后台管理系统 | Shiro | MySQL + Redis |
| 电商平台 | Spring Security | MySQL + Redis + JWT |
| 开放平台 | Spring Security | OAuth2 + JWT |
| 微服务 | Spring Security | Gateway + JWT |

---

## 六、总结

三种鉴权方案各有千秋，没有绝对的优劣，关键在于**匹配项目需求**：

- **拦截器** 适合快速验证和小型项目，灵活但需要自己把控安全性
- **Shiro** 是功能和复杂度的平衡点，适合中小型项目的完整权限管理
- **Spring Security** 是企业级标准方案，功能最强但学习成本最高

对于学习 Spring Boot 的开发者，建议按以下路径逐步深入：

1. **入门阶段**：用拦截器理解鉴权的基本原理
2. **进阶阶段**：学习 Shiro 掌握完整的权限管理思想
3. **高级阶段**：深入 Spring Security 应对企业级需求

记住：**没有最好的方案，只有最合适的方案**。根据项目规模、团队能力和业务需求做出理性选择，才是优秀架构师的必备素质。

---

## 参考资料

- [Spring MVC Interceptor 官方文档](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/interceptors.html)
- [Apache Shiro 官方文档](https://shiro.apache.org/)
- [Spring Security 官方文档](https://spring.io/projects/spring-security)

---

**本文首发于个人博客，转载请注明出处。**

*最后更新时间：2026-09-02*

