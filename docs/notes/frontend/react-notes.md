---
title: React 实践笔记
description: 组件、状态分层与副作用的可执行结论
theme: 前端
tags:
  - React
  - Hooks
  - 状态管理
---

> 持续更新的摘要页。偏「可执行结论」，不是教程全文。

## 组件约定

- 优先函数组件 + Hooks
- Props 用 `interface` 明确声明，避免隐式 any
- 复杂交互抽到 hooks / 局部状态，而不是堆在页面组件里

## 状态分层

| 层级 | 建议 |
|------|------|
| 局部 UI | `useState` / `useReducer` |
| 跨组件业务 | Zustand / Redux Toolkit |
| 服务端数据 | 请求层统一封装，页面只消费结果 |

## 副作用

- `useEffect` 必须写清依赖
- 订阅、定时器、事件监听要有清理函数
- 能在事件里做的事，不要挪进 effect

## 下一步

后续会补充：列表虚拟化、并发渲染相关实践、表单与校验模式。
