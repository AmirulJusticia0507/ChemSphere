import { createRouter, createWebHistory } from 'vue-router'

import AdminView from '../pages/AdminView.vue'
import ElementDetailPage from '../pages/ElementDetailPage.vue'
import HomePage from '../pages/HomePage.vue'
import LoginView from '../pages/LoginView.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import RegisterView from '../pages/RegisterView.vue'
import TablePage from '../pages/TablePage.vue'

import { useAuth } from '@/composables/useAuth.js'

const auth = useAuth()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/tabel', name: 'table', component: TablePage },
    { path: '/unsur/:id', name: 'element', component: ElementDetailPage, props: true },
    { path: '/masuk', name: 'login', component: LoginView },
    { path: '/daftar', name: 'register', component: RegisterView },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      beforeEnter: async (to) => {
        if (!auth.isAuthenticated.value) {
          return { name: 'login', query: { redirect: to.fullPath } }
        }

        if (!auth.user.value) {
          await auth.fetchMe()
        }

        if (auth.user.value?.role !== 'admin') {
          return { name: 'home' }
        }

        return true
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
