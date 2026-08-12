## Hi, I'm QIULONGWEN 👋

前端工程师。这个仓库是我的 **GitHub Profile** 与 **个人技术知识库** 源码。

### 📡 站点

- 技术知识库：[qiulongwen.github.io/qiulongwen](https://qiulongwen.github.io/qiulongwen/)
- 本地开发：`npm install && npm run dev`

### 🗂️ 仓库结构

```text
docs/
  notes/         # 技术知识库（主题 + 标签）
  .vitepress/    # VitePress 配置与主题
scripts/
  new-note.mjs   # 新建笔记模板（写文件 + 更新侧栏）
```

### ✍️ 新建笔记

```bash
# 交互式
npm run new-note

# 或一次性传参
npm run new-note -- --theme 杂七杂八 --title "macOS 安装 uv" --slug macos-uv-install
npm run new-note -- --theme frontend --title "React Server Components" --tags "React,Hooks"
```

主题可用中文或别名：`前端/frontend`、`AI/ai`、`后端/backend`、`云原生/cloud`、`图形学/graphics`、`杂七杂八/misc`。

文章侧栏会根据笔记 frontmatter 的 `theme` / `title` **自动生成**，只需写 Markdown，不用改 `config.mts`。

### 🔭 近期关注

- 前端工程化与可维护架构
- React / Vue3 + TypeScript 实践沉淀
- 用 Markdown 持续建设个人知识库

### 📫 找到我

- GitHub: [QIULONGWEN](https://github.com/qiulongwen)
