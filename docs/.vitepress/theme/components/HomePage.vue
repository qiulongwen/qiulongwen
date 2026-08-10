<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as notes } from '../notes.data'
import {
  THEME_ORDER,
  themeMeta,
  mergeThemeTags,
  sortByThemeOrder,
  getThemeClass,
  type ThemeTint
} from '../themes'

interface ThemeCard {
  name: string
  description: string
  href: string
  tint: ThemeTint
  count: number
  tags: string[]
}

interface ThemeTagGroup {
  theme: string
  tint: ThemeTint
  tags: Array<{ name: string; count: number }>
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

  return THEME_ORDER.map((name) => {
    const meta = themeMeta[name]
    const fromNotes = tagMap.get(name) ?? new Set<string>()
    return {
      name,
      count: countMap.get(name) ?? 0,
      tags: mergeThemeTags(name, fromNotes).slice(0, 5),
      description: meta.description,
      href: meta.href,
      tint: meta.tint
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
    .sort(([a], [b]) => sortByThemeOrder(a, b))
    .map(([theme, tagCountMap]) => ({
      theme,
      tint: themeMeta[theme as keyof typeof themeMeta]?.tint ?? 'misc',
      tags: [...tagCountMap.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
        .map(([name, count]) => ({ name, count }))
    }))
})

const noteCount = computed(() => notes.length)
const themeCount = computed(() => THEME_ORDER.length)
const tagCount = computed(() =>
  tagsByTheme.value.reduce((total, group) => total + group.tags.length, 0)
)

const previewNotes = computed(() => {
  const picked: typeof notes = []
  const seen = new Set<string>()

  for (const note of notes) {
    if (seen.has(note.theme)) continue
    seen.add(note.theme)
    picked.push(note)
    if (picked.length >= 5) break
  }

  for (const note of notes) {
    if (picked.some((item) => item.url === note.url)) continue
    picked.push(note)
    if (picked.length >= 5) break
  }

  return picked
})

const themeDistribution = computed(() => {
  const total = Math.max(noteCount.value, 1)
  return themes.value.map((theme) => ({
    name: theme.name,
    tint: theme.tint,
    count: theme.count,
    width: `${Math.max((theme.count / total) * 100, theme.count > 0 ? 8 : 4)}%`
  }))
})
</script>

<template>
  <div class="kb-home">
    <section class="kb-hero" aria-label="首页主视觉">
      <div class="kb-hero__glow" aria-hidden="true" />

      <div class="kb-hero__layout">
        <div class="kb-hero__copy">
          <p class="kb-hero__eyebrow">Knowledge Base</p>
          <h1 class="kb-hero__brand">QIULONGWEN</h1>
          <p class="kb-hero__meta">前端工程师 · 技术知识库</p>
          <div class="kb-hero__actions">
            <a class="btn btn--primary" :href="withBase('/notes/')">进入知识库</a>
            <a class="btn btn--secondary" :href="withBase('/about')">关于我</a>
          </div>
          <div class="kb-hero__stats">
            <div style="--delay: 0ms">
              <strong>{{ noteCount }}</strong>
              <span>篇笔记</span>
            </div>
            <div style="--delay: 60ms">
              <strong>{{ themeCount }}</strong>
              <span>个主题</span>
            </div>
            <div style="--delay: 120ms">
              <strong>{{ tagCount }}</strong>
              <span>个标签</span>
            </div>
          </div>
        </div>

        <aside class="kb-panel" aria-label="最近笔记预览">
          <div class="kb-panel__head">
            <span class="kb-panel__live" aria-hidden="true" />
            <span>Recent Notes</span>
            <em>最近笔记</em>
          </div>

          <div class="kb-panel__dist" aria-label="主题分布">
            <div class="kb-panel__dist-bar">
              <span
                v-for="(item, index) in themeDistribution"
                :key="item.name"
                class="kb-panel__dist-seg"
                :class="`kb-panel__dist-seg--${item.tint}`"
                :style="{
                  width: item.width,
                  '--delay': `${index * 50}ms`
                }"
                :title="`${item.name} ${item.count} 篇`"
              />
            </div>
            <div class="kb-panel__dist-legend">
              <span
                v-for="item in themeDistribution"
                :key="item.name"
                class="kb-panel__dist-item"
              >
                <i :class="`kb-panel__dist-dot--${item.tint}`" aria-hidden="true" />
                {{ item.name }}
                <em>{{ item.count }}</em>
              </span>
            </div>
          </div>

          <div class="kb-panel__list">
            <a
              v-for="(note, index) in previewNotes"
              :key="note.url"
              class="kb-panel__row"
              :class="getThemeClass(note.theme)"
              :href="withBase(note.url)"
              :style="{ '--delay': `${180 + index * 55}ms` }"
            >
              <span class="kb-panel__row-theme">{{ note.theme }}</span>
              <span class="kb-panel__row-title">{{ note.title }}</span>
              <span v-if="note.description" class="kb-panel__row-desc">
                {{ note.description }}
              </span>
            </a>
          </div>

          <a class="kb-panel__foot" :href="withBase('/notes/')">
            浏览全部笔记
            <span aria-hidden="true">→</span>
          </a>
        </aside>
      </div>
    </section>

    <section class="kb-section" aria-label="技术主题">
      <div class="kb-section__inner">
        <div class="kb-section__head">
          <p class="kb-eyebrow">Themes</p>
          <h2>技术主题</h2>
        </div>

        <div class="theme-grid">
          <a
            v-for="(theme, index) in themes"
            :key="theme.name"
            class="theme-card"
            :class="`theme-card--${theme.tint}`"
            :href="withBase(`/notes/?theme=${encodeURIComponent(theme.name)}`)"
            :style="{ '--delay': `${index * 55}ms` }"
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

    <section class="kb-section" aria-label="标签">
      <div class="kb-section__inner">
        <div class="kb-section__head">
          <p class="kb-eyebrow">Tags</p>
          <h2>标签</h2>
        </div>

        <div class="tag-groups">
          <article
            v-for="(group, groupIndex) in tagsByTheme"
            :key="group.theme"
            class="tag-group"
            :class="`tag-group--${group.tint}`"
            :style="{ '--delay': `${groupIndex * 55}ms` }"
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
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
