<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { data as notes } from '../notes.data'

const activeTheme = ref<string>('全部')
const activeTag = ref<string>('全部')

const themeTint: Record<string, string> = {
  前端: 'peach',
  工程化: 'mint'
}

const themes = computed(() => {
  const set = new Set(notes.map((note) => note.theme))
  return ['全部', ...[...set].sort((a, b) => a.localeCompare(b, 'zh-CN'))]
})

const themeStats = computed(() => {
  const map = new Map<string, number>()
  for (const note of notes) {
    map.set(note.theme, (map.get(note.theme) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
    .map(([name, count]) => ({
      name,
      count,
      tint: themeTint[name] ?? 'sky'
    }))
})

const tagsByTheme = computed(() => {
  const themeTagMap = new Map<string, Set<string>>()

  for (const note of notes) {
    if (!themeTagMap.has(note.theme)) {
      themeTagMap.set(note.theme, new Set())
    }
    const tagSet = themeTagMap.get(note.theme)
    if (!tagSet) continue
    for (const tag of note.tags) {
      tagSet.add(tag)
    }
  }

  return [...themeTagMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
    .map(([theme, tagSet]) => ({
      theme,
      tags: [...tagSet].sort((a, b) => a.localeCompare(b, 'zh-CN'))
    }))
})

const visibleTagGroups = computed(() => {
  if (activeTheme.value === '全部') {
    return tagsByTheme.value
  }
  return tagsByTheme.value.filter((group) => group.theme === activeTheme.value)
})

const availableTags = computed(() => {
  return new Set(visibleTagGroups.value.flatMap((group) => group.tags))
})

const filteredNotes = computed(() =>
  notes.filter((note) => {
    const themeOk =
      activeTheme.value === '全部' || note.theme === activeTheme.value
    const tagOk =
      activeTag.value === '全部' || note.tags.includes(activeTag.value)
    return themeOk && tagOk
  })
)

function selectTheme(theme: string): void {
  activeTheme.value = theme
}

function selectTag(tag: string): void {
  activeTag.value = tag
}

function themeClass(theme: string): string {
  return `is-${themeTint[theme] ?? 'sky'}`
}

watch(activeTheme, () => {
  if (
    activeTag.value !== '全部' &&
    !availableTags.value.has(activeTag.value)
  ) {
    activeTag.value = '全部'
  }
})

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const theme = params.get('theme')
  const tag = params.get('tag')

  if (theme && themes.value.includes(theme)) {
    activeTheme.value = theme
  }
  if (
    tag &&
    (tag === '全部' ||
      availableTags.value.has(tag) ||
      notes.some((n) => n.tags.includes(tag)))
  ) {
    activeTag.value = tag
  }
})
</script>

<template>
  <div class="notes-home">
    <section class="notes-hero">
      <div class="notes-hero__glow" aria-hidden="true" />
      <div class="notes-hero__content">
        <div class="notes-hero__copy">
          <p class="kb-eyebrow">Knowledge Base</p>
          <h1>知识库</h1>
          <p>
            把经验压成方法。先选主题，再按标签缩小范围。
          </p>
        </div>
        <div class="notes-hero__stats">
          <div class="notes-stat">
            <strong>{{ notes.length }}</strong>
            <span>全部笔记</span>
          </div>
          <div class="notes-stat">
            <strong>{{ filteredNotes.length }}</strong>
            <span>当前结果</span>
          </div>
          <div class="notes-stat">
            <strong>{{ themeStats.length }}</strong>
            <span>技术主题</span>
          </div>
        </div>
      </div>

      <div class="notes-theme-cards">
        <button
          type="button"
          class="notes-theme-card"
          :class="{ 'is-active': activeTheme === '全部' }"
          @click="selectTheme('全部')"
        >
          <span class="notes-theme-card__name">全部</span>
          <span class="notes-theme-card__count">{{ notes.length }} 篇</span>
        </button>
        <button
          v-for="theme in themeStats"
          :key="theme.name"
          type="button"
          class="notes-theme-card"
          :class="[
            `notes-theme-card--${theme.tint}`,
            { 'is-active': activeTheme === theme.name }
          ]"
          @click="selectTheme(theme.name)"
        >
          <span class="notes-theme-card__name">{{ theme.name }}</span>
          <span class="notes-theme-card__count">{{ theme.count }} 篇</span>
        </button>
      </div>
    </section>

    <section class="notes-filters">
      <div class="filter-block">
        <p class="filter-label">标签筛选</p>
        <div class="filter-row">
          <button
            type="button"
            class="filter-pill filter-pill--tag"
            :class="{ 'is-active': activeTag === '全部' }"
            @click="selectTag('全部')"
          >
            全部标签
          </button>
          <template v-for="group in visibleTagGroups" :key="group.theme">
            <span
              v-if="activeTheme === '全部'"
              class="tag-filter-divider"
            >
              {{ group.theme }}
            </span>
            <button
              v-for="tag in group.tags"
              :key="`${group.theme}-${tag}`"
              type="button"
              class="filter-pill filter-pill--tag"
              :class="{ 'is-active': activeTag === tag }"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </button>
          </template>
        </div>
      </div>
    </section>

    <section class="notes-list-wrap">
      <div class="notes-list-head">
        <h2>笔记列表</h2>
        <p>{{ filteredNotes.length }} 篇匹配</p>
      </div>

      <div class="notes-list">
        <a
          v-for="(note, index) in filteredNotes"
          :key="note.url"
          class="note-item"
          :class="themeClass(note.theme)"
          :href="withBase(note.url)"
          :style="{ '--delay': `${index * 40}ms` }"
        >
          <div class="note-item__accent" aria-hidden="true" />
          <div class="note-item__body">
            <div class="note-item__meta">
              <span class="note-item__theme">{{ note.theme }}</span>
              <span
                v-for="tag in note.tags"
                :key="tag"
                class="note-item__tag"
              >
                {{ tag }}
              </span>
            </div>
            <h3>{{ note.title }}</h3>
            <p v-if="note.description">{{ note.description }}</p>
          </div>
          <span class="note-item__arrow" aria-hidden="true">→</span>
        </a>

        <p v-if="filteredNotes.length === 0" class="notes-empty">
          当前筛选下暂无笔记，试试切换主题或标签。
        </p>
      </div>
    </section>
  </div>
</template>
