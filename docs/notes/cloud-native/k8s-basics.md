---
title: Kubernetes 基础笔记
description: Pod、Workload 与发布相关的最小可用认知
theme: 云原生
tags:
  - Kubernetes
  - Docker
  - 可观测性
---

> 示例笔记。从「能跑起来」到「敢发布」的骨架。

## 核心对象（先记这些）

- **Pod**：最小调度单元，一般不直接管长期 Pod
- **Deployment / StatefulSet**：无状态 / 有状态工作负载
- **Service**：稳定访问入口
- **ConfigMap / Secret**：配置与密钥外置

## 发布检查清单

1. 镜像 tag 可追溯（避免只靠 `latest`）
2. readiness / liveness 探针合理
3. 资源 request / limit 有底线
4. 回滚路径演练过一次

## 可观测性起步

- 日志：结构化 + 请求 ID
- 指标：延迟、错误率、饱和度
- 链路：跨服务至少能串起关键路径

## 下一步

补充：Helm 打包约定、HPA 调参、服务网格何时值得上。
