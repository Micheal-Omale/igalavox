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
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue')
    },
    {
      path: '/names',
      name: 'names',
      component: () => import('../views/NamesView.vue')
    },
    {
      path: '/learn-igala',
      name: 'learn-igala',
      component: () => import('../views/LearnIgalaView.vue')
    },
    {
      path: '/contribute',
      name: 'contribute',
      component: () => import('../views/ContributeView.vue'),
      meta: { hideShell: true }
    },
    {
      path: '/impact',
      name: 'impact',
      component: () => import('../views/ImpactLandingView.vue')
    },
    {
      path: '/impact/report',
      name: 'impact-report',
      component: () => import('../views/ImpactReportView.vue')
    },
    {
      path: '/impact/map',
      name: 'impact-map',
      component: () => import('../views/ImpactMapView.vue')
    },
    {
      path: '/impact/stories',
      name: 'impact-stories',
      component: () => import('../views/ImpactStoriesFeedView.vue')
    },
    {
      path: '/impact/stories/:id',
      name: 'impact-story-detail',
      component: () => import('../views/ImpactStoryDetailView.vue')
    },
    {
      path: '/impact/evidence',
      name: 'impact-evidence',
      component: () => import('../views/CommunityEvidenceView.vue')
    },
    {
      path: '/impact/evidence/submit',
      name: 'submit-evidence',
      component: () => import('../views/SubmitEvidenceView.vue')
    },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: () => import('../views/MarketplaceView.vue')
    },
    {
      path: '/marketplace/:slug',
      name: 'marketplace-detail',
      component: () => import('../views/MarketplaceProductDetailView.vue')
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
      meta: { hideShell: true, requiresAdmin: true }
    },
    {
      path: '/admin/impact',
      name: 'admin-reports',
      component: () => import('../views/AdminReportsView.vue'),
      meta: { hideShell: true, requiresAdmin: true }
    },
    {
      path: '/admin/marketplace',
      name: 'admin-marketplace',
      component: () => import('../views/MarketplaceDashboardView.vue'),
      meta: { hideShell: true, requiresAdmin: true }
    },
    {
      path: '/admin/evidence',
      name: 'admin-evidence',
      component: () => import('../views/AdminEvidenceView.vue'),
      meta: { hideShell: true, requiresAdmin: true }
    },
    {
      path: '/admin/reports',
      redirect: '/admin/impact'
    },
    // Legacy redirect — /admin/names now lives inside the main dashboard
    {
      path: '/admin/names',
      redirect: '/admin'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true

  const authStore = useAuthStore()
  await authStore.initializeAuth()

  if (authStore.isAdmin()) return true

  return {
    name: 'signin',
    query: { redirect: to.fullPath },
  }
})

export default router
