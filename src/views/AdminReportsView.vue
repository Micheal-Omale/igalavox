<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BrandLogo from '../components/BrandLogo.vue'
import { deleteImpactReport, fetchImpactReports, getCategoryMeta, updateReportStatus } from '../services/impactService'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const reports = ref([])
const isLoading = ref(true)
const isSaving = ref('')
const errorMessage = ref('')
const selectedReport = ref(null)
let reportsSubscription = null

const pendingCount = computed(() => reports.value.filter((report) => report.status === 'pending').length)
const approvedCount = computed(() => reports.value.filter((report) => report.status === 'approved').length)
const resolvedCount = computed(() => reports.value.filter((report) => report.status === 'resolved').length)

async function loadReports(showLoader = true) {
  if (showLoader) isLoading.value = true
  try {
    reports.value = await fetchImpactReports({}, true)
  } catch (error) {
    errorMessage.value = 'Unable to load reports.'
    console.error('Failed to load admin reports:', error)
  } finally {
    if (showLoader) isLoading.value = false
  }
}

function statusClass(status) {
  return {
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-error-container text-on-error-container',
    resolved: 'bg-primary-fixed text-on-primary-fixed',
    pending: 'bg-tertiary-fixed text-on-tertiary-fixed',
  }[status] || 'bg-surface-container text-on-surface-variant'
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

async function setStatus(report, status) {
  isSaving.value = `${report.id}-${status}`
  try {
    await updateReportStatus(report.id, status, status === 'approved' || status === 'resolved' ? true : report.verified)
    await loadReports(false)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update report.'
  } finally {
    isSaving.value = ''
  }
}

async function removeReport(report) {
  if (!confirm(`Delete report from ${report.community_name}? This cannot be undone.`)) return
  isSaving.value = `${report.id}-delete`
  try {
    await deleteImpactReport(report)
    selectedReport.value = null
    await loadReports(false)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to delete report.'
  } finally {
    isSaving.value = ''
  }
}

async function signOut() {
  await authStore.signOut()
  window.location.href = '/signin'
}

onMounted(() => {
  loadReports()
  if (isSupabaseConfigured) {
    reportsSubscription = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => loadReports(false))
      .subscribe()
  }
})

onUnmounted(() => {
  if (reportsSubscription) supabase.removeChannel(reportsSubscription)
})
</script>

<template>
  <main class="min-h-screen bg-surface-container-low">
    <div class="flex min-h-screen">
      <aside class="hidden w-72 border-r border-outline-variant/40 bg-surface-container-lowest lg:flex lg:flex-col">
        <div class="border-b border-outline-variant/30 px-5 py-5">
          <BrandLogo image-class="h-11 w-auto" />
          <p class="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Impact Reports</p>
        </div>
        <nav class="flex-1 space-y-1 px-3 py-4">
          <RouterLink to="/admin" class="flex items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold text-on-surface-variant hover:bg-surface-variant hover:text-primary">
            <span class="material-symbols-outlined text-[20px]">library_music</span>
            Audio Archive
          </RouterLink>
          <RouterLink to="/admin/impact" class="flex items-center gap-3 rounded-lg bg-primary-container/10 px-4 py-3 font-label text-sm font-semibold text-primary">
            <span class="material-symbols-outlined text-[20px]">campaign</span>
            Community Impact
          </RouterLink>
        </nav>
        <button class="m-4 rounded border border-outline-variant px-4 py-3 font-label text-sm font-semibold text-secondary" type="button" @click="signOut">Sign out</button>
      </aside>

      <section class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Admin</p>
              <h1 class="font-display text-3xl font-bold text-primary">Community Impact Reports</h1>
            </div>
            <RouterLink to="/" class="font-label text-sm font-semibold text-tertiary hover:underline">Back to site</RouterLink>
          </div>

          <div class="mb-6 grid gap-4 sm:grid-cols-3">
            <article class="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
              <p class="font-label text-xs uppercase tracking-[0.12em] text-on-surface-variant">Pending</p>
              <p class="mt-2 font-display text-3xl font-bold text-primary">{{ pendingCount }}</p>
            </article>
            <article class="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
              <p class="font-label text-xs uppercase tracking-[0.12em] text-on-surface-variant">Approved</p>
              <p class="mt-2 font-display text-3xl font-bold text-primary">{{ approvedCount }}</p>
            </article>
            <article class="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
              <p class="font-label text-xs uppercase tracking-[0.12em] text-on-surface-variant">Resolved</p>
              <p class="mt-2 font-display text-3xl font-bold text-primary">{{ resolvedCount }}</p>
            </article>
          </div>

          <p v-if="errorMessage" class="mb-4 rounded bg-error-container px-4 py-3 font-body text-sm text-on-error-container">{{ errorMessage }}</p>

          <div class="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
            <div v-if="isLoading" class="p-12 text-center text-on-surface-variant">Loading reports...</div>
            <div v-else-if="reports.length === 0" class="p-12 text-center text-on-surface-variant">No reports yet.</div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-outline-variant/30">
                <thead class="bg-surface-container-low">
                  <tr class="text-left font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                    <th class="px-5 py-4">Community</th>
                    <th class="px-5 py-4">Category</th>
                    <th class="px-5 py-4">Status</th>
                    <th class="px-5 py-4">Date</th>
                    <th class="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/20">
                  <tr v-for="report in reports" :key="report.id" class="hover:bg-surface-container-low/40">
                    <td class="px-5 py-4">
                      <button class="text-left" type="button" @click="selectedReport = report">
                        <p class="font-label text-sm font-semibold text-primary">{{ report.community_name }}</p>
                        <p class="font-body text-xs text-on-surface-variant">{{ report.lga }}</p>
                      </button>
                    </td>
                    <td class="px-5 py-4">
                      <span class="inline-flex items-center gap-1 font-body text-sm text-on-surface-variant">
                        <span class="material-symbols-outlined text-[15px]">{{ getCategoryMeta(report.category).icon }}</span>
                        {{ getCategoryMeta(report.category).label }}
                      </span>
                    </td>
                    <td class="px-5 py-4"><span :class="['rounded-full px-3 py-1 font-label text-xs font-semibold capitalize', statusClass(report.status)]">{{ report.status }}</span></td>
                    <td class="px-5 py-4 font-body text-sm text-on-surface-variant">{{ formatDate(report.created_at) }}</td>
                    <td class="px-5 py-4">
                      <div class="flex justify-end gap-2">
                        <button class="rounded border px-3 py-1 text-xs font-semibold text-primary" type="button" :disabled="isSaving" @click="setStatus(report, 'approved')">Approve</button>
                        <button class="rounded border px-3 py-1 text-xs font-semibold text-clay" type="button" :disabled="isSaving" @click="setStatus(report, 'rejected')">Reject</button>
                        <button class="rounded border px-3 py-1 text-xs font-semibold text-secondary" type="button" :disabled="isSaving" @click="setStatus(report, 'resolved')">Resolve</button>
                        <button class="rounded border px-3 py-1 text-xs font-semibold text-error" type="button" :disabled="isSaving" @click="removeReport(report)">Delete</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="selectedReport" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="selectedReport = null">
      <article class="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-surface p-6 shadow-xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="font-headline text-2xl font-semibold text-primary">{{ selectedReport.title || selectedReport.community_name }}</h2>
            <p class="mt-1 text-sm text-on-surface-variant">{{ selectedReport.community_name }}, {{ selectedReport.lga }}</p>
          </div>
          <button class="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" type="button" @click="selectedReport = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <p class="mt-5 whitespace-pre-line font-body leading-7 text-on-surface-variant">{{ selectedReport.description }}</p>
        <div v-if="selectedReport.image_urls?.length || selectedReport.image_url" class="mt-5 grid gap-3 sm:grid-cols-2">
          <img v-for="url in (selectedReport.image_urls?.length ? selectedReport.image_urls : [selectedReport.image_url])" :key="url" :src="url" alt="Report evidence" class="h-52 w-full rounded object-cover" />
        </div>
      </article>
    </div>
  </main>
</template>
