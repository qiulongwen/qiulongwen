---
title: Vite 与构建优化
description: 开发体验、分包与静态资源相关笔记
theme: 工程化
tags:
  - Vite
  - 构建优化
  - 工程化
---

# Vite 与构建优化

## 为什么常用 Vite

- 开发启动快，HMR 体验好
- 配置面相对干净，和现代前端工具链契合
- 生产构建基于 Rollup，生态成熟

## 可关注的优化点

1. **依赖预构建**：大型依赖尽量走 optimizeDeps
2. **分包策略**：按路由 / 按 vendor 拆 chunk，避免首包过大
3. **静态资源**：图片与字体走合适的加载策略，避免阻塞首屏
4. **环境变量**：用 `import.meta.env`，不要把密钥打进前端包

## 和本站的关系

本站使用 VitePress（基于 Vite）。本地开发：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

## 下一步

补充：Monorepo 下的 Vite 配置共享、CI 缓存策略。
