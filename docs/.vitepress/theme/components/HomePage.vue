<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as notes } from '../notes.data'

interface ThemeCard {
  name: string
  description: string
  href: string
  tint: 'peach' | 'mint' | 'sky' | 'lavender'
  count: number
  tags: string[]
}

interface ThemeTagGroup {
  theme: string
  tags: Array<{ name: string; count: number }>
}

const themeMeta: Record<
  string,
  { description: string; href: string; tint: ThemeCard['tint'] }
> = {
  前端: {
    description: 'React、TypeScript 与组件工程实践。',
    href: '/notes/frontend/react-notes',
    tint: 'peach'
  },
  工程化: {
    description: '构建工具、发布流程与工程效率。',
    href: '/notes/engineering/vite-and-build',
    tint: 'mint'
  }
}

const themes = computed<ThemeCard[]>(() => {
  const countMap = new Map<string, number>()
  const tagMap = new Map<string, Set<string>>()

  for (const note of notes) {
    countMap.set(note.theme, (countMap.get(note.theme) ?? 0) + 1)
    if (!tagMap.has(note.theme)) {
      tagMap.set(note.theme, new Set())
    }
    const set = tagMap.get(note.theme)
    if (!set) continue
    for (const tag of note.tags) {
      set.add(tag)
    }
  }

  return [...countMap.entries()].map(([name, count]) => {
    const meta = themeMeta[name] ?? {
      description: '持续补充中的技术主题。',
      href: '/notes/',
      tint: 'sky' as const
    }
    return {
      name,
      count,
      tags: [...(tagMap.get(name) ?? [])].slice(0, 4),
      ...meta
    }
  })
})

const tagsByTheme = computed<ThemeTagGroup[]>(() => {
  const themeTagMap = new Map<string, Map<string, number>>()

  for (const note of notes) {
    if (!themeTagMap.has(note.theme)) {
      themeTagMap.set(note.theme, new Map())
    }
    const tagCountMap = themeTagMap.get(note.theme)
    if (!tagCountMap) continue

    for (const tag of note.tags) {
      tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1)
    }
  }

  return [...themeTagMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
    .map(([theme, tagCountMap]) => ({
      theme,
      tags: [...tagCountMap.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
        .map(([name, count]) => ({ name, count }))
    }))
})

const previewNotes = computed(() => notes.slice(0, 4))
const noteCount = computed(() => notes.length)
const themeCount = computed(() => themes.value.length)
const tagCount = computed(() =>
  tagsByTheme.value.reduce((total, group) => total + group.tags.length, 0)
)
</script>

<template>
  <div class="kb-home">
    <section class="kb-hero" aria-label="首页主视觉">
      <div class="kb-hero__glow" aria-hidden="true" />

      <div class="kb-hero__layout">
        <div class="kb-hero__copy">
          <p class="kb-hero__brand">QIULONGWEN</p>
          <h1 class="kb-hero__title">把经验压成方法</h1>
          <p class="kb-hero__tagline">
            不做流水账博客。主题归档，标签检索，只留能再次用上的前端工程记录。
          </p>
          <div class="kb-hero__actions">
            <a class="btn btn--primary" :href="withBase('/notes/')">进入知识库</a>
            <a class="btn btn--secondary" :href="withBase('/about')">关于我</a>
          </div>
          <div class="kb-hero__stats">
            <div>
              <strong>{{ noteCount }}</strong>
              <span>篇笔记</span>
            </div>
            <div>
              <strong>{{ themeCount }}</strong>
              <span>个主题</span>
            </div>
            <div>
              <strong>{{ tagCount }}</strong>
              <span>个标签</span>
            </div>
          </div>
        </div>

        <div class="kb-panel" role="img" aria-label="知识库结构预览">
          <div class="kb-panel__head">
            <span class="kb-panel__live" />
            <span>Knowledge Map</span>
            <em>实时结构</em>
          </div>

          <div class="kb-panel__themes">
            <a
              v-for="theme in themes"
              :key="theme.name"
              class="kb-panel__theme"
              :class="`kb-panel__theme--${theme.tint}`"
              :href="withBase(`/notes/?theme=${encodeURIComponent(theme.name)}`)"
            >
              <div>
                <strong>{{ theme.name }}</strong>
                <p>{{ theme.count }} 篇</p>
              </div>
              <div class="kb-panel__theme-tags">
                <span v-for="tag in theme.tags" :key="tag">{{ tag }}</span>
              </div>
            </a>
          </div>

          <div class="kb-panel__list">
            <p class="kb-panel__list-label">最近笔记</p>
            <a
              v-for="note in previewNotes"
              :key="note.url"
              class="kb-panel__row"
              :href="withBase(note.url)"
            >
              <span class="kb-panel__row-theme">{{ note.theme }}</span>
              <span class="kb-panel__row-title">{{ note.title }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="kb-section" aria-label="技术主题">
      <div class="kb-section__inner">
        <div class="kb-section__head kb-section__head--row">
          <div>
            <p class="kb-eyebrow">Themes</p>
            <h2>技术主题</h2>
          </div>
          <p>先选主题，再按标签缩小范围。</p>
        </div>

        <div class="theme-grid">
          <a
            v-for="(theme, index) in themes"
            :key="theme.name"
            class="theme-card"
            :class="`theme-card--${theme.tint}`"
            :href="withBase(`/notes/?theme=${encodeURIComponent(theme.name)}`)"
            :style="{ '--delay': `${index * 80}ms` }"
          >
            <div class="theme-card__top">
              <h3>{{ theme.name }}</h3>
              <span class="theme-card__count">{{ theme.count }} 篇</span>
            </div>
            <p>{{ theme.description }}</p>
            <div class="theme-card__tags">
              <span v-for="tag in theme.tags" :key="tag">{{ tag }}</span>
            </div>
            <span class="theme-card__link">进入主题 →</span>
          </a>
        </div>
      </div>
    </section>

    <section class="kb-section kb-section--soft" aria-label="按主题分类的标签">
      <div class="kb-section__inner">
        <div class="kb-section__head kb-section__head--row">
          <div>
            <p class="kb-eyebrow">Tags</p>
            <h2>标签 · 按主题</h2>
          </div>
          <p>标签归属于主题，点击即可筛选。</p>
        </div>

        <div class="tag-groups">
          <div
            v-for="(group, groupIndex) in tagsByTheme"
            :key="group.theme"
            class="tag-group"
            :style="{ '--delay': `${groupIndex * 100}ms` }"
          >
            <div class="tag-group__head">
              <h3>{{ group.theme }}</h3>
              <span>{{ group.tags.length }} 个标签</span>
            </div>
            <div class="tag-cloud">
              <a
                v-for="(tag, index) in group.tags"
                :key="`${group.theme}-${tag.name}`"
                class="tag-chip"
                :href="withBase(`/notes/?theme=${encodeURIComponent(group.theme)}&tag=${encodeURIComponent(tag.name)}`)"
                :style="{ '--delay': `${groupIndex * 100 + index * 40}ms` }"
              >
                <span>{{ tag.name }}</span>
                <em>{{ tag.count }}</em>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
