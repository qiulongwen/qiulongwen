<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { data as notes } from '../notes.data'
import {
  THEME_ORDER,
  getThemeClass,
  getThemeTint,
  mergeThemeTags,
  sortByThemeOrder,
  themeMeta
} from '../themes'

const activeTheme = ref<string>('全部')
const activeTag = ref<string>('全部')

const themes = computed(() => ['全部', ...THEME_ORDER])

const themeStats = computed(() => {
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

  return THEME_ORDER.map((name) => ({
    name,
    count: countMap.get(name) ?? 0,
    tint: getThemeTint(name),
    tags: mergeThemeTags(name, tagMap.get(name) ?? []).slice(0, 4),
    description: themeMeta[name].description
  }))
})

const tagsByTheme = computed(() => {
  const themeTagMap = new Map<string, Map<string, number>>()

  for (const name of THEME_ORDER) {
    const map = new Map<string, number>()
    for (const tag of themeMeta[name].tags) {
      map.set(tag, 0)
    }
    themeTagMap.set(name, map)
  }

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
      tint: getThemeTint(theme),
      tags: [...tagCountMap.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
        .map(([name, count]) => ({ name, count }))
    }))
})

const visibleTagGroups = computed(() => {
  if (activeTheme.value === '全部') {
    return tagsByTheme.value
  }
  return tagsByTheme.value.filter((group) => group.theme === activeTheme.value)
})

const availableTags = computed(() => {
  return new Set(
    visibleTagGroups.value.flatMap((group) => group.tags.map((tag) => tag.name))
  )
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

const tagTotal = computed(() =>
  tagsByTheme.value.reduce((total, group) => total + group.tags.length, 0)
)

function selectTheme(theme: string): void {
  activeTheme.value = activeTheme.value === theme ? '全部' : theme
}

function selectTag(tag: string): void {
  activeTag.value = tag
}

function themeClass(theme: string): string {
  return getThemeClass(theme)
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
    <section class="notes-hero" aria-label="知识库概览">
      <div class="notes-hero__glow" aria-hidden="true" />

      <div class="notes-hero__content">
        <div class="notes-hero__copy">
          <p class="notes-hero__eyebrow">Knowledge Base</p>
          <h1>知识库</h1>
          <p class="notes-hero__meta">按主题浏览，按标签筛选</p>
        </div>

        <div class="notes-hero__stats" aria-label="筛选概览">
          <div class="notes-stat notes-stat--notes">
            <span class="notes-stat__index" aria-hidden="true">01</span>
            <strong>{{ notes.length }}</strong>
            <span class="notes-stat__label">全部笔记</span>
            <span class="notes-stat__en">Notes</span>
          </div>
          <div class="notes-stat notes-stat--filter">
            <span class="notes-stat__index" aria-hidden="true">02</span>
            <strong>{{ filteredNotes.length }}</strong>
            <span class="notes-stat__label">当前结果</span>
            <span class="notes-stat__en">Matched</span>
          </div>
          <div class="notes-stat notes-stat--themes">
            <span class="notes-stat__index" aria-hidden="true">03</span>
            <strong>{{ themeStats.length }}</strong>
            <span class="notes-stat__label">技术主题</span>
            <span class="notes-stat__en">Themes</span>
          </div>
        </div>
      </div>

      <div class="notes-theme-head">
        <p class="kb-eyebrow">Themes</p>
        <h2>技术主题</h2>
        <p v-if="activeTheme !== '全部'" class="notes-theme-head__hint">
          已选「{{ activeTheme }}」· 再点一次可取消
        </p>
      </div>

      <div class="notes-theme-cards">
        <button
          v-for="(theme, index) in themeStats"
          :key="theme.name"
          type="button"
          class="notes-theme-card"
          :class="[
            `notes-theme-card--${theme.tint}`,
            { 'is-active': activeTheme === theme.name }
          ]"
          :style="{ '--delay': `${index * 45}ms` }"
          @click="selectTheme(theme.name)"
        >
          <div class="notes-theme-card__top">
            <span class="notes-theme-card__name">{{ theme.name }}</span>
            <span class="notes-theme-card__count">{{ theme.count }} 篇</span>
          </div>
          <p class="notes-theme-card__desc">{{ theme.description }}</p>
          <div class="notes-theme-card__tags">
            <span v-for="tag in theme.tags" :key="tag">{{ tag }}</span>
          </div>
        </button>
      </div>
    </section>

    <section class="notes-filters" aria-label="标签筛选">
      <div class="notes-section-head">
        <p class="kb-eyebrow">Tags</p>
        <div class="notes-section-head__row">
          <h2>标签筛选</h2>
          <span>{{ tagTotal }} 个标签</span>
        </div>
      </div>

      <div class="filter-row">
        <button
          type="button"
          class="filter-pill"
          :class="{ 'is-active': activeTag === '全部' }"
          @click="selectTag('全部')"
        >
          <span>全部标签</span>
        </button>
        <template v-for="group in visibleTagGroups" :key="group.theme">
          <span
            v-if="activeTheme === '全部'"
            class="tag-filter-divider"
            :class="`tag-filter-divider--${group.tint}`"
          >
            {{ group.theme }}
          </span>
          <button
            v-for="tag in group.tags"
            :key="`${group.theme}-${tag.name}`"
            type="button"
            class="filter-pill"
            :class="[
              `filter-pill--${group.tint}`,
              { 'is-active': activeTag === tag.name }
            ]"
            @click="selectTag(tag.name)"
          >
            <span>{{ tag.name }}</span>
            <em>{{ tag.count }}</em>
          </button>
        </template>
      </div>
    </section>

    <section class="notes-list-wrap" aria-label="笔记列表">
      <div class="notes-section-head">
        <p class="kb-eyebrow">Notes</p>
        <div class="notes-section-head__row">
          <h2>笔记列表</h2>
          <span>{{ filteredNotes.length }} 篇匹配</span>
        </div>
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
