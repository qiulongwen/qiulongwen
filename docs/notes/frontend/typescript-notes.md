---
title: TypeScript 要点
description: 严格类型、接口约束与常用写法清单
theme: 前端
tags:
  - TypeScript
  - 类型系统
---

## 基本态度

- 打开严格模式，禁止无意义的 `any`
- 函数参数与返回值都要有明确类型
- 接口请求/响应各自定义类型，不混用「大而全」对象

## 常见写法

```ts
interface UserRequest {
  id: string
}

interface UserResponse {
  id: string
  name: string
  email: string
}

async function fetchUser(params: UserRequest): Promise<UserResponse> {
  // 实际请求放在 services 层
  return Promise.resolve({
    id: params.id,
    name: 'qiulongwen',
    email: 'example@example.com'
  })
}
```

## 建议清单

1. 联合类型优于过度继承
2. 用 `unknown` 承接外部数据，再做收窄
3. 工具类型（`Pick` / `Omit` / `Partial`）按场景使用，避免嵌套过深

## 下一步

补充：泛型约束、类型守卫、与 Zod 等运行时校验的协作方式。
