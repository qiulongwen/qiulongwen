import { createContentLoader } from 'vitepress'

export interface NoteItem {
  title: string
  url: string
  theme: string
  tags: string[]
  description: string
}

declare const data: NoteItem[]
export { data }

export default createContentLoader('notes/**/*.md', {
  transform(raw): NoteItem[] {
    return raw
      .filter(
        (page) => page.url !== '/notes/' && !page.url.endsWith('/notes/index')
      )
      .map(({ url, frontmatter }) => ({
        title: String(frontmatter.title ?? '未命名'),
        url,
        theme: String(frontmatter.theme ?? '未分类'),
        tags: Array.isArray(frontmatter.tags)
          ? frontmatter.tags.map(String)
          : [],
        description: String(frontmatter.description ?? '')
      }))
      .sort((a, b) => a.theme.localeCompare(b.theme, 'zh-CN'))
  }
})
