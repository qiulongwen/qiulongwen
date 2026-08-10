<script setup lang="ts">
import { withBase } from 'vitepress'

const directions = [
  {
    title: '前端框架',
    desc: 'React / Vue3 + TypeScript，组件化与状态管理实践。',
    tint: 'peach'
  },
  {
    title: '工程化',
    desc: 'Vite / Webpack、构建优化、可维护架构与发布流程。',
    tint: 'mint'
  },
  {
    title: '知识沉淀',
    desc: '主题归档、标签检索，把经验压成可回查的方法。',
    tint: 'sky'
  }
] as const

const links = [
  {
    title: 'GitHub',
    desc: 'github.com/qiulongwen',
    href: 'https://github.com/qiulongwen',
    external: true
  },
  {
    title: '本站仓库',
    desc: 'QIULONGWEN / QIULONGWEN',
    href: 'https://github.com/qiulongwen/qiulongwen',
    external: true
  },
  {
    title: '知识库',
    desc: '浏览全部技术笔记',
    href: '/notes/',
    external: false
  }
]
</script>

<template>
  <div class="about-page">
    <section class="about-hero">
      <div class="about-hero__glow" aria-hidden="true" />
      <div class="about-hero__inner">
        <img
          class="about-hero__logo"
          :src="withBase('/logo.svg')"
          width="64"
          height="64"
          alt="QIULONGWEN"
        />
        <p class="kb-eyebrow">About</p>
        <h1 class="about-hero__name">QIULONGWEN</h1>
        <p class="about-hero__role">前端工程师 · 技术知识库</p>
        <p class="about-hero__intro">
          把经验压成方法。这里不做流水账，只沉淀能再次用上的前端工程记录。
        </p>
        <div class="about-hero__actions">
          <a class="btn btn--primary" :href="withBase('/notes/')">进入知识库</a>
          <a
            class="btn btn--secondary"
            href="https://github.com/qiulongwen"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>

    <section class="about-section">
      <div class="about-section__head">
        <p class="kb-eyebrow">Focus</p>
        <h2>技术方向</h2>
      </div>
      <div class="about-grid">
        <article
          v-for="item in directions"
          :key="item.title"
          class="about-card"
          :class="`about-card--${item.tint}`"
        >
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="about-section about-section--soft">
      <div class="about-section__head">
        <p class="kb-eyebrow">Links</p>
        <h2>找到我</h2>
      </div>
      <div class="about-links">
        <a
          v-for="link in links"
          :key="link.title"
          class="about-link"
          :href="link.external ? link.href : withBase(link.href)"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
        >
          <div>
            <h3>{{ link.title }}</h3>
            <p>{{ link.desc }}</p>
          </div>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  </div>
</template>
