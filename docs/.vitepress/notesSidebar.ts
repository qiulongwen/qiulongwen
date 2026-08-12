import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'
import {
  THEME_ORDER,
  themeMeta,
  type ThemeName
} from './theme/themes'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NOTES_ROOT = path.resolve(__dirname, '../notes')

interface NoteSidebarEntry {
  title: string
  theme: string
  link: string
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const raw = match[1]
  const result: Record<string, unknown> = {}
  let currentKey = ''
  let inArray = false
  const arrayValues: string[] = []

  for (const line of raw.split(/\r?\n/)) {
    const arrayItem = line.match(/^\s*-\s+(.+)\s*$/)
    if (inArray && arrayItem) {
      arrayValues.push(stripQuotes(arrayItem[1]))
      continue
    }

    if (inArray && currentKey) {
      result[currentKey] = [...arrayValues]
      arrayValues.length = 0
      inArray = false
      currentKey = ''
    }

    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!field) continue

    const key = field[1]
    const value = field[2].trim()
    if (value === '' || value === '|' || value === '>') {
      currentKey = key
      inArray = true
      continue
    }

    result[key] = stripQuotes(value)
    currentKey = ''
    inArray = false
  }

  if (inArray && currentKey) {
    result[currentKey] = [...arrayValues]
  }

  return result
}

function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

function toNoteLink(absolutePath: string): string {
  const relative = path.relative(NOTES_ROOT, absolutePath).split(path.sep).join('/')
  const withoutExt = relative.replace(/\.md$/, '')
  return `/notes/${withoutExt}`
}

function collectNotes(): NoteSidebarEntry[] {
  return walkMarkdownFiles(NOTES_ROOT)
    .filter((filePath) => path.basename(filePath) !== 'index.md')
    .map((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8')
      const frontmatter = parseFrontmatter(content)
      const title = String(frontmatter.title ?? path.basename(filePath, '.md'))
      const theme = String(frontmatter.theme ?? '杂七杂八')
      return {
        title,
        theme,
        link: toNoteLink(filePath)
      }
    })
}

/**
 * Build VitePress sidebar for /notes/ from markdown frontmatter.
 * Groups follow THEME_ORDER so CSS nth-of-type theme icons stay aligned.
 * Empty themes are still emitted (items: []) to keep icon mapping stable.
 */
export function generateNotesSidebar(): DefaultTheme.SidebarItem[] {
  const notes = collectNotes()
  const grouped = new Map<string, NoteSidebarEntry[]>()

  for (const name of THEME_ORDER) {
    grouped.set(name, [])
  }

  for (const note of notes) {
    const themeName =
      note.theme in themeMeta ? (note.theme as ThemeName) : '杂七杂八'
    const list = grouped.get(themeName)
    if (!list) continue
    list.push(note)
  }

  return THEME_ORDER.map((name) => {
    const items = (grouped.get(name) ?? [])
      .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
      .map((note) => ({
        text: note.title,
        link: note.link
      }))

    return {
      text: name,
      collapsed: false,
      items
    }
  })
}
