import { defineConfig } from 'vitepress'
import { generateNotesSidebar } from './notesSidebar'

export default defineConfig({
  title: 'QIULONGWEN',
  description: '前端工程师的个人技术知识库',
  lang: 'zh-CN',
  base: '/qiulongwen/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com'
      }
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: ''
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap'
      }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/qiulongwen/favicon.svg' }
    ],
    ['link', { rel: 'apple-touch-icon', href: '/qiulongwen/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#5645d4' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: false,
    nav: [
      { text: '首页', link: '/' },
      { text: '知识库', link: '/notes/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/notes/': generateNotesSidebar()
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/qiulongwen' }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: {
      label: '章节导航',
      level: [2, 3]
    },

    lastUpdated: {
      text: '最后更新'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    footer: {
      message: '个人技术知识库 · VitePress',
      copyright: `Copyright © ${new Date().getFullYear()} QIULONGWEN`
    }
  },

  markdown: {
    lineNumbers: true
  }
})
