export const THEME_ORDER = [
  '前端',
  'AI',
  '后端',
  '云原生',
  '图形学',
  '杂七杂八'
] as const

export type ThemeName = (typeof THEME_ORDER)[number]

/** One stable tint key per theme — used by CSS class suffixes. */
export type ThemeTint =
  | 'frontend'
  | 'ai'
  | 'backend'
  | 'cloud'
  | 'graphics'
  | 'misc'

export interface ThemeMeta {
  description: string
  href: string
  tint: ThemeTint
  /** Directory under docs/notes/ */
  dir: string
  /** Built-in tags shown on theme cards; sample docs should reuse these. */
  tags: string[]
}

export const themeMeta: Record<ThemeName, ThemeMeta> = {
  前端: {
    description:
      '组件、类型系统与构建工具。覆盖 React / TypeScript / Vite 等日常开发结论。',
    href: '/notes/?theme=%E5%89%8D%E7%AB%AF',
    tint: 'frontend',
    dir: 'frontend',
    tags: ['React', 'TypeScript', 'Vite', 'Hooks', '状态管理', 'VitePress']
  },
  AI: {
    description:
      '从 Prompt 约定到 Agent 流程。记录可复用的模型应用与评测方法。',
    href: '/notes/?theme=AI',
    tint: 'ai',
    dir: 'ai',
    tags: ['Prompt', 'Agent', 'RAG', 'LLM', '评测']
  },
  后端: {
    description:
      '接口设计、鉴权与数据层。沉淀服务端可直接套用的约定与清单。',
    href: '/notes/?theme=%E5%90%8E%E7%AB%AF',
    tint: 'backend',
    dir: 'backend',
    tags: ['API', '数据库', '缓存', '鉴权', 'Node.js']
  },
  云原生: {
    description:
      '容器、编排与发布。关注 Kubernetes / Docker 与可观测性落地要点。',
    href: '/notes/?theme=%E4%BA%91%E5%8E%9F%E7%94%9F',
    tint: 'cloud',
    dir: 'cloud-native',
    tags: ['Kubernetes', 'Docker', 'CI/CD', '可观测性', '服务网格']
  },
  图形学: {
    description:
      '渲染管线、Shader 与可视化。从 WebGL 心智模型到引擎侧实践。',
    href: '/notes/?theme=%E5%9B%BE%E5%BD%A2%E5%AD%A6',
    tint: 'graphics',
    dir: 'graphics',
    tags: ['WebGL', 'Three.js', 'Shader', '渲染管线', '可视化']
  },
  杂七杂八: {
    description:
      '跨主题的效率、写作与方法论。暂未归入主线、但会反复用到的记录。',
    href: '/notes/?theme=%E6%9D%82%E4%B8%83%E6%9D%82%E5%85%AB',
    tint: 'misc',
    dir: 'misc',
    tags: ['效率工具', '写作', '方法论', '软技能', '随记']
  }
}

export function getThemeTint(theme: string): ThemeTint {
  if (theme in themeMeta) {
    return themeMeta[theme as ThemeName].tint
  }
  return 'misc'
}

export function getThemeClass(theme: string): string {
  return `is-${getThemeTint(theme)}`
}

export function getThemeTags(theme: string): string[] {
  if (theme in themeMeta) {
    return [...themeMeta[theme as ThemeName].tags]
  }
  return []
}

export function sortByThemeOrder(a: string, b: string): number {
  const ai = THEME_ORDER.indexOf(a as ThemeName)
  const bi = THEME_ORDER.indexOf(b as ThemeName)
  if (ai === -1 && bi === -1) return a.localeCompare(b, 'zh-CN')
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
}

/** Merge built-in tags with tags found in notes (built-in first, unique). */
export function mergeThemeTags(
  theme: string,
  noteTags: Iterable<string>
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const tag of [...getThemeTags(theme), ...noteTags]) {
    if (seen.has(tag)) continue
    seen.add(tag)
    result.push(tag)
  }

  return result
}
