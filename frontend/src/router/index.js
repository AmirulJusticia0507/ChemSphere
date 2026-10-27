import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import TablePage from '../pages/TablePage.vue'
import ElementDetailPage from '../pages/ElementDetailPage.vue'
import LoginView from '../pages/LoginView.vue'
import AdminView from '../pages/AdminView.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

import { useAuth } from '@/composables/useAuth.js'

const auth = useAuth()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/tabel', name: 'table', component: TablePage },
    { path: '/unsur/:id', name: 'element', component: ElementDetailPage, props: true },
    { path: '/masuk', name: 'login', component: LoginView },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      beforeEnter: (to, from, next) => {
        if (!auth.isAuthenticated.value) {
          return next({ name: 'login', query: { redirect: to.fullPath } })
        }
        if (auth.user.value?.role !== 'admin') {
          return next({ name: 'home' })
        }
        next()
      },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
