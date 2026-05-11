import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/authStore'

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
      path: '/contribute',
      name: 'contribute',
      component: () => import('../views/ContributeView.vue'),
      meta: { hideShell: true }
    },
    {
      path: '/signup',
      redirect: '/contribute'
    },
    {
      path: '/submit',
      redirect: '/contribute'
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
    // Legacy redirect — /admin/names now lives inside the main dashboard
    {
      path: '/admin/names',
      redirect: '/admin'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    const authStore = useAuthStore()
    // Simple check. Real app should wait for auth to initialize
    if (!authStore.isAdmin() && !authStore.loading) {
      next({ name: 'signin' })
      return
    }
  }
  next()
})

export default router
