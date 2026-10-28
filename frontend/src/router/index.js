import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/composables/useAuth.js'

const auth = useAuth()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../pages/HomePage.vue') },
    { path: '/tabel', name: 'table', component: () => import('../pages/TablePage.vue') },
    { path: '/bandingkan', name: 'compare', component: () => import('../pages/ComparePage.vue') },
    {
      path: '/ion/:id',
      name: 'ion',
      component: () => import('../pages/IonDetailPage.vue'),
      props: true,
    },
    {
      path: '/eksperimen',
      name: 'experiment',
      component: () => import('../pages/ExperimentPage.vue'),
    },
    {
      path: '/kalkulator',
      name: 'calculator',
      component: () => import('../pages/CalculatorPage.vue'),
    },
    { path: '/kuis', name: 'quiz', component: () => import('../pages/QuizPage.vue') },
    { path: '/progres', name: 'progress', component: () => import('../pages/ProgressPage.vue') },
    {
      path: '/unsur/:id',
      name: 'element',
      component: () => import('../pages/ElementDetailPage.vue'),
      props: true,
    },
    { path: '/masuk', name: 'login', component: () => import('../pages/LoginView.vue') },
    { path: '/daftar', name: 'register', component: () => import('../pages/RegisterView.vue') },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../pages/AdminView.vue'),
      beforeEnter: async (to) => {
        if (!auth.isAuthenticated.value) {
          return { name: 'login', query: { redirect: to.fullPath } }
        }

        if (!auth.user.value) {
          await auth.fetchMe()
        }

        if (!['admin', 'editor'].includes(auth.user.value?.role)) {
          return { name: 'home' }
        }

        return true
      },
    },
    {
      path: '/admin/pengguna',
      name: 'admin-users',
      component: () => import('../pages/AdminUsersPage.vue'),
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
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
