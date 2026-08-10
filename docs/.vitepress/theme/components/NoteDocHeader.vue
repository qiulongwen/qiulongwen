<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { getThemeClass } from '../themes'

const { frontmatter, page } = useData()

const isNoteArticle = computed(
  () =>
    page.value.relativePath.startsWith('notes/') &&
    !page.value.relativePath.endsWith('index.md')
)

const theme = computed(() => String(frontmatter.value.theme ?? ''))
const tags = computed(() =>
  Array.isArray(frontmatter.value.tags)
    ? frontmatter.value.tags.map(String)
    : []
)
const description = computed(() => String(frontmatter.value.description ?? ''))
const title = computed(() => String(frontmatter.value.title ?? ''))

const themeClass = computed(() => getThemeClass(theme.value))
</script>

<template>
  <div v-if="isNoteArticle" class="note-doc-header" :class="themeClass">
    <a class="note-doc-header__back" :href="withBase('/notes/')">← 知识库</a>
    <div class="note-doc-header__meta">
      <span v-if="theme" class="note-doc-header__theme">{{ theme }}</span>
      <span
        v-for="tag in tags"
        :key="tag"
        class="note-doc-header__tag"
      >
        {{ tag }}
      </span>
    </div>
    <h1 class="note-doc-header__title">{{ title }}</h1>
    <p v-if="description" class="note-doc-header__desc">{{ description }}</p>
  </div>
</template>
