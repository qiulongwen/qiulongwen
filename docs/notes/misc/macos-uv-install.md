---
title: macos安装uv
description: macos安装uv
theme: 杂七杂八
tags:
  - 效率工具
  - 写作
  - 方法论
---

> 写在前面

## 安装

1. 在 macOS 上安装 uv
```bash
# 使用 Homebrew 安装（推荐）
brew install uv
```
2. 查看 Python 版本
```bash
# 列出当前已安装和可下载的版本
uv python list

# 仅查看已安装在本地的版本
uv python list --only-installed
```
3. 下载与安装 Python
```bash
# 安装指定大版本（自动下载最新的小版本修补包）
uv python install 3.12

# 安装具体版本
uv python install 3.11.8

# 同时安装多个版本
uv python install 3.10 3.11 3.12

# 卸载指定版本（直接使用 uninstall 即可）
uv python uninstall 3.10
```
4. 切换与锁定 Python 版本
```bash
# 将当前项目锁定为 Python 3.12
uv python pin 3.12

# 设置全局默认使用的 Python 版本
uv python pin --global 3.12
```

## 使用
1. 生成全局 python
```bash
# 1. 加上 --default 重新安装/链接默认解释器
uv python install 3.12 --default

# 2. 自动把 uv 的二进制可执行文件路径写入终端配置文件中
uv python update-shell
```
2. 项目实战
```
# 1. 进入项目目录
cd my-project

# 2. 使用指定 Python 版本创建虚拟环境（若本地无此版本，uv 会自动下载）
uv venv --python 3.12

# 3. 激活虚拟环境 (macOS / Linux)
source .venv/bin/activate

# 4. 在当前环境运行 Python 脚本（如果不激活环境，也可以通过 uv run 运行）
uv run python app.py
```


## 总结



## 下一步

