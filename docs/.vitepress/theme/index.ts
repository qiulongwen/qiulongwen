import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import AboutPage from './components/AboutPage.vue'
import HomePage from './components/HomePage.vue'
import NotesHome from './components/NotesHome.vue'
import SiteBrand from './components/SiteBrand.vue'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-title-after': () => h(SiteBrand)
    }),
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('NotesHome', NotesHome)
    app.component('AboutPage', AboutPage)
  }
}

export default theme
