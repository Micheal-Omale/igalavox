import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/names',
      name: 'names',
      component: () => import('../views/NamesView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
      meta: { hideShell: true }
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/SigninView.vue'),
      meta: { hideShell: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: { hideShell: true }
    },
    {
      path: '/admin/names',
      name: 'admin-names',
      component: () => import('../views/ManageNameArchiveView.vue'),
      meta: { hideShell: true }
    }
  ]
})

export default router
