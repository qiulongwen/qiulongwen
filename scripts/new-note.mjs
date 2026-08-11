#!/usr/bin/env node
/**
 * Create a knowledge-base note from a template.
 *
 * Usage:
 *   npm run new-note -- --theme 杂七杂八 --title "macOS 安装 uv"
 *   npm run new-note -- --theme frontend --title "React Server Components" --slug rsc-notes
 *   npm run new-note -- --theme AI --title "RAG 评测清单" --tags "RAG,评测" --desc "评测口径与样例"
 *   npm run new-note
 *     (interactive prompts)
 */

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const NOTES_ROOT = path.join(ROOT, 'docs', 'notes')
const CONFIG_PATH = path.join(ROOT, 'docs', '.vitepress', 'config.mts')

/** @typedef {{ name: string, dir: string, aliases: string[], defaultTags: string[] }} ThemeDef */

/** @type {ThemeDef[]} */
const THEMES = [
  {
    name: '前端',
    dir: 'frontend',
    aliases: ['前端', 'frontend', 'fe'],
    defaultTags: ['React', 'TypeScript']
  },
  {
    name: 'AI',
    dir: 'ai',
    aliases: ['AI', 'ai'],
    defaultTags: ['Prompt', 'Agent']
  },
  {
    name: '后端',
    dir: 'backend',
    aliases: ['后端', 'backend', 'be'],
    defaultTags: ['API', 'Node.js']
  },
  {
    name: '云原生',
    dir: 'cloud-native',
    aliases: ['云原生', 'cloud', 'cloud-native', 'k8s'],
    defaultTags: ['Kubernetes', 'Docker']
  },
  {
    name: '图形学',
    dir: 'graphics',
    aliases: ['图形学', 'graphics', 'webgl'],
    defaultTags: ['WebGL', 'Three.js']
  },
  {
    name: '杂七杂八',
    dir: 'misc',
    aliases: ['杂七杂八', 'misc', 'other'],
    defaultTags: ['效率工具', '随记']
  }
]

/**
 * @param {string[]} argv
 * @returns {Record<string, string | boolean>}
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      out[key] = true
      continue
    }
    out[key] = next
    i += 1
  }
  return out
}

/**
 * @param {string} question
 * @param {string} [fallback]
 * @returns {Promise<string>}
 */
function ask(question, fallback = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const tip = fallback ? `${question}（默认: ${fallback}）` : question
  return new Promise((resolve) => {
    rl.question(`${tip}: `, (answer) => {
      rl.close()
      const value = answer.trim()
      resolve(value || fallback)
    })
  })
}

/**
 * @param {string} input
 * @returns {ThemeDef}
 */
function resolveTheme(input) {
  const key = input.trim()
  const found = THEMES.find(
    (theme) =>
      theme.aliases.some((alias) => alias.toLowerCase() === key.toLowerCase()) ||
      theme.name === key
  )
  if (!found) {
    const list = THEMES.map((t) => `${t.name} (${t.aliases.join('/')})`).join(
      '\n  - '
    )
    throw new Error(`未知主题「${input}」。可选：\n  - ${list}`)
  }
  return found
}

/**
 * @param {string} title
 * @param {string} [slugInput]
 * @returns {string}
 */
function toSlug(title, slugInput) {
  if (slugInput && String(slugInput).trim()) {
    return slugify(String(slugInput))
  }
  const fromTitle = slugify(title)
  if (fromTitle) return fromTitle
  const stamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll('-', '')
  return `note-${stamp}`
}

/**
 * @param {string} value
 * @returns {string}
 */
function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeSingleQuotes(value) {
  return value.replaceAll("'", "\\'")
}

/**
 * @param {string} title
 * @param {string} description
 * @param {string} themeName
 * @param {string[]} tags
 * @returns {string}
 */
function buildTemplate(title, description, themeName, tags) {
  const tagLines =
    tags.length > 0 ? tags.map((tag) => `  - ${tag}`).join('\n') : '  - 随记'

  return `---
title: ${title}
description: ${description}
theme: ${themeName}
tags:
${tagLines}
---

## 概述

在这里写下这篇笔记要解决的问题，以及适用场景。

## 要点

1. 
2. 
3. 

## 示例

\`\`\`ts
// 需要时补充代码示例
\`\`\`

## 下一步

- [ ] 补充实操步骤
- [ ] 补上常见坑与排查方式
`
}

/**
 * @param {string} source
 * @param {string} themeName
 * @param {string} title
 * @param {string} link
 * @returns {string}
 */
function insertSidebarItem(source, themeName, title, link) {
  if (source.includes(`link: '${link}'`) || source.includes(`link: "${link}"`)) {
    console.log(`侧栏已存在链接，跳过更新: ${link}`)
    return source
  }

  const marker = `text: '${themeName}'`
  const markerIdx = source.indexOf(marker)
  if (markerIdx === -1) {
    throw new Error(`在 config.mts 中找不到主题分组: ${themeName}`)
  }

  const itemsKey = 'items: ['
  const itemsIdx = source.indexOf(itemsKey, markerIdx)
  if (itemsIdx === -1) {
    throw new Error(`主题「${themeName}」缺少 items 数组`)
  }

  const openIdx = itemsIdx + itemsKey.length
  let depth = 1
  let closeIdx = -1
  for (let i = openIdx; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === '[') depth += 1
    if (ch === ']') {
      depth -= 1
      if (depth === 0) {
        closeIdx = i
        break
      }
    }
  }

  if (closeIdx === -1) {
    throw new Error(`无法解析主题「${themeName}」的 items 数组`)
  }

  const inner = source.slice(openIdx, closeIdx)
  const trimmedInner = inner.replace(/\s+$/, '')
  const itemBlock = `{
              text: '${escapeSingleQuotes(title)}',
              link: '${link}'
            }`

  const nextInner =
    trimmedInner.trim().length === 0
      ? `\n            ${itemBlock}\n          `
      : `${trimmedInner},\n            ${itemBlock}\n          `

  return `${source.slice(0, openIdx)}${nextInner}${source.slice(closeIdx)}`
}

/**
 * @param {string} value
 * @returns {string[]}
 */
function parseTags(value) {
  if (!value.trim()) return []
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || args.h) {
    console.log(`用法:
  npm run new-note -- --theme <主题> --title <标题> [--slug <文件名>] [--tags <a,b>] [--desc <描述>]

主题可选:
${THEMES.map((t) => `  - ${t.name}  (${t.aliases.join(', ')})`).join('\n')}
`)
    return
  }

  let themeInput = typeof args.theme === 'string' ? args.theme : ''
  let title = typeof args.title === 'string' ? args.title : ''
  let slugInput = typeof args.slug === 'string' ? args.slug : ''
  let tagsInput = typeof args.tags === 'string' ? args.tags : ''
  let description =
    typeof args.desc === 'string'
      ? args.desc
      : typeof args.description === 'string'
        ? args.description
        : ''

  if (!themeInput || !title) {
    console.log('创建知识库笔记（可直接回车使用默认值）\n')
    if (!themeInput) {
      themeInput = await ask(
        `主题 [${THEMES.map((t) => t.name).join(' / ')}]`,
        '杂七杂八'
      )
    }
    if (!title) {
      title = await ask('标题', '未命名笔记')
    }
    if (!slugInput) {
      slugInput = await ask('文件名 slug（可空，自动生成）', '')
    }
    if (!tagsInput) {
      tagsInput = await ask('标签（逗号分隔，可空）', '')
    }
    if (!description) {
      description = await ask('简介 description（可空）', title)
    }
  }

  const theme = resolveTheme(themeInput)
  const slug = toSlug(title, slugInput)
  const tags =
    parseTags(tagsInput).length > 0
      ? parseTags(tagsInput)
      : theme.defaultTags.slice(0, 2)
  const desc = description.trim() || title
  const dirPath = path.join(NOTES_ROOT, theme.dir)
  const filePath = path.join(dirPath, `${slug}.md`)
  const link = `/notes/${theme.dir}/${slug}`

  if (fs.existsSync(filePath)) {
    throw new Error(`文件已存在: ${path.relative(ROOT, filePath)}`)
  }

  fs.mkdirSync(dirPath, { recursive: true })
  fs.writeFileSync(filePath, buildTemplate(title, desc, theme.name, tags), 'utf8')

  const configSource = fs.readFileSync(CONFIG_PATH, 'utf8')
  const nextConfig = insertSidebarItem(configSource, theme.name, title, link)
  if (nextConfig !== configSource) {
    fs.writeFileSync(CONFIG_PATH, nextConfig, 'utf8')
  }

  console.log(`
✓ 已创建笔记
  文件: ${path.relative(ROOT, filePath)}
  主题: ${theme.name}
  链接: ${link}
  侧栏: docs/.vitepress/config.mts

下一步:
  npm run dev
  打开 ${link}
`)
}

main().catch((error) => {
  console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
