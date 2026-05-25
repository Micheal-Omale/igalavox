<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchEvidence, updateEvidenceStatus, deleteEvidence, getCategoryMeta } from '../services/evidenceService'
import AppButton from '../components/AppButton.vue'
import SocialEmbed from '../components/SocialEmbed.vue'
import BrandLogo from '../components/BrandLogo.vue'
import AdminNavLinks from '../components/admin/AdminNavLinks.vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const signOut = async () => {
  await authStore.signOut()
  router.push('/signin')
}

const evidenceItems = ref([])
const loading = ref(true)
const error = ref(null)

const activeTab = ref('pending') // pending, approved, rejected, all
const selectedItem = ref(null)

const loadEvidence = async () => {
  loading.value = true
  error.value = null
  try {
    evidenceItems.value = await fetchEvidence({}, true) // admin = true
  } catch (err) {
    console.error('Failed to load evidence:', err)
    error.value = 'Could not load evidence submissions.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvidence()
})

const filteredItems = computed(() => {
  if (activeTab.value === 'all') return evidenceItems.value
  
  if (activeTab.value === 'pending') {
    return evidenceItems.value.filter(item => item.approved === false && !item.rejected)
  }
  
  if (activeTab.value === 'approved') {
    return evidenceItems.value.filter(item => item.approved === true)
  }

  if (activeTab.value === 'rejected') {
    return evidenceItems.value.filter(item => item.rejected === true)
  }
  
  return evidenceItems.value
})

const handleStatusChange = async (item, statusData) => {
  try {
    await updateEvidenceStatus(item.id, statusData)
    // update local state
    Object.assign(item, statusData)
    
    // close modal if open and we are rejecting/deleting maybe, or just keep it open so they can see changes
  } catch (err) {
    console.error('Status update failed', err)
    alert('Failed to update status')
  }
}

const handleApprove = (item) => handleStatusChange(item, { approved: true, rejected: false })
const handleReject = (item) => handleStatusChange(item, { approved: false, rejected: true, featured: false })
const handleRevertToPending = (item) => handleStatusChange(item, { approved: false, rejected: false, featured: false })
const handleToggleFeatured = (item) => handleStatusChange(item, { featured: !item.featured })

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to permanently delete this submission?')) return
  try {
    await deleteEvidence(id)
    evidenceItems.value = evidenceItems.value.filter(e => e.id !== id)
    if (selectedItem.value?.id === id) selectedItem.value = null
  } catch (err) {
    console.error('Delete failed', err)
    alert(`Failed to delete from Supabase: ${err.message || 'Unknown error'}`)
  }
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString))
}

const getStatusBadgeClass = (item) => {
  if (item.approved) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (item.rejected) return 'bg-error-container/30 text-error border-error/20'
  return 'bg-amber-100 text-amber-800 border-amber-200'
}

const getStatusText = (item) => {
  if (item.approved) return 'Approved'
  if (item.rejected) return 'Rejected'
  return 'Pending'
}
</script>

<template>
  <main class="min-h-screen bg-surface-container-low">
    <div class="flex min-h-screen">
      <!-- Admin Sidebar Layout -->
      <aside class="hidden w-72 border-r border-outline-variant/40 bg-surface-container-lowest lg:flex lg:flex-col">
        <div class="border-b border-outline-variant/30 px-5 py-5">
          <BrandLogo image-class="h-11 w-auto" />
          <p class="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Evidence</p>
        </div>
        <div class="flex-1 px-3 py-4">
          <AdminNavLinks />
        </div>
        <button class="m-4 rounded border border-outline-variant px-4 py-3 font-label text-sm font-semibold text-secondary" type="button" @click="signOut">Sign out</button>
      </aside>

      <!-- Main Content -->
      <section class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Admin</p>
              <h1 class="font-display text-3xl font-bold text-primary">Evidence Moderation</h1>
            </div>
            <div class="flex items-center gap-4">
              <RouterLink to="/" class="font-label text-sm font-semibold text-tertiary hover:underline">Back to site</RouterLink>
              <AppButton @click="loadEvidence" variant="secondary" size="sm">
                <span class="material-symbols-outlined text-[18px]">refresh</span> Refresh
              </AppButton>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-6 border-b border-outline-variant/30">
            <nav class="-mb-px flex space-x-6" aria-label="Tabs">
              <button 
                @click="activeTab = 'pending'" 
                class="whitespace-nowrap border-b-2 py-3 px-1 font-label text-sm font-semibold transition-colors"
                :class="activeTab === 'pending' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface'"
              >
                Pending
                <span v-if="evidenceItems.filter(i => !i.approved && !i.rejected).length" class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  {{ evidenceItems.filter(i => !i.approved && !i.rejected).length }}
                </span>
              </button>
              
              <button 
                @click="activeTab = 'approved'" 
                class="whitespace-nowrap border-b-2 py-3 px-1 font-label text-sm font-semibold transition-colors"
                :class="activeTab === 'approved' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface'"
              >
                Approved
              </button>

              <button 
                @click="activeTab = 'rejected'" 
                class="whitespace-nowrap border-b-2 py-3 px-1 font-label text-sm font-semibold transition-colors"
                :class="activeTab === 'rejected' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface'"
              >
                Rejected
              </button>

              <button 
                @click="activeTab = 'all'" 
                class="whitespace-nowrap border-b-2 py-3 px-1 font-label text-sm font-semibold transition-colors"
                :class="activeTab === 'all' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface'"
              >
                All Submissions
              </button>
            </nav>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary/30 border-t-brand-primary"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="rounded-xl border border-error/20 bg-error-container/10 p-6 text-center text-error">
            {{ error }}
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredItems.length === 0" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest py-16 text-center">
            <span class="material-symbols-outlined text-4xl text-outline mb-4">video_library</span>
            <h3 class="font-display text-lg font-semibold text-on-surface">No submissions found</h3>
            <p class="font-body text-sm text-on-surface-variant">There are currently no items in this tab.</p>
          </div>

          <!-- Evidence Grid/List -->
          <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-3">
            
            <!-- List Panel -->
            <div class="col-span-1 xl:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              <div 
                v-for="item in filteredItems" 
                :key="item.id"
                @click="selectedItem = item"
                class="cursor-pointer rounded-xl border p-4 transition-all hover:border-brand-primary/50"
                :class="selectedItem?.id === item.id ? 'border-brand-primary bg-primary-container/10' : 'border-outline-variant/30 bg-surface-container-lowest'"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold font-label capitalize" :class="getStatusBadgeClass(item)">
                    {{ getStatusText(item) }}
                  </span>
                  <span class="text-xs text-on-surface-variant">{{ formatDate(item.created_at) }}</span>
                </div>
                
                <h4 class="font-label font-bold text-on-surface line-clamp-2 mb-1">
                  {{ item.title || 'Untitled Submission' }}
                </h4>
                
                <p class="text-xs text-on-surface-variant line-clamp-2 mb-3">{{ item.description }}</p>
                
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/20">
                  <div class="flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    <span class="flex items-center gap-1 capitalize"><span class="material-symbols-outlined text-[14px]">play_circle</span> {{ item.media_type }}</span>
                    <span v-if="item.lga" class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">location_on</span> {{ item.lga }}</span>
                  </div>
                  <button @click.stop="handleDelete(item.id)" class="inline-flex items-center justify-center rounded text-error/70 transition-colors hover:bg-error-container/20 hover:text-error p-1" title="Delete">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Detail Panel -->
            <div class="col-span-1 xl:col-span-2">
              <div v-if="selectedItem" class="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden flex flex-col h-full max-h-[calc(100vh-250px)]">
                
                <!-- Modal Header -->
                <div class="flex items-center justify-between flex-wrap gap-3 border-b border-outline-variant/30 bg-surface p-4">
                  <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold font-label capitalize" :class="getStatusBadgeClass(selectedItem)">
                      {{ getStatusText(selectedItem) }}
                    </span>
                    <span v-if="selectedItem.featured" class="inline-flex items-center gap-1 rounded-md bg-primary text-on-primary px-2 py-1 text-xs font-bold font-label">
                      <span class="material-symbols-outlined text-[14px]">star</span> Featured
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      v-if="!selectedItem.approved" 
                      @click="handleApprove(selectedItem)" 
                      class="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <span class="material-symbols-outlined text-[16px]">check</span> Approve
                    </button>
                    <button 
                      v-if="!selectedItem.rejected" 
                      @click="handleReject(selectedItem)" 
                      class="flex items-center gap-1 rounded-lg border border-error text-error px-3 py-1.5 text-sm font-semibold hover:bg-error-container/20 transition-colors"
                    >
                      <span class="material-symbols-outlined text-[16px]">close</span> Reject
                    </button>
                    <button 
                      v-if="selectedItem.approved || selectedItem.rejected"
                      @click="handleRevertToPending(selectedItem)" 
                      class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-semibold text-on-surface hover:bg-surface-variant transition-colors"
                    >
                      Revert to Pending
                    </button>
                  </div>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-grow overflow-y-auto p-6">
                  <div class="mb-6 space-y-6">
                    <div class="rounded-2xl border border-outline-variant/30 bg-surface-variant/30 p-4 sm:p-5">
                      <div class="mb-3 flex items-center justify-between gap-3">
                        <h3 class="font-label text-sm font-bold uppercase tracking-wider text-secondary">Media Preview</h3>
                        <a :href="selectedItem.media_url" target="_blank" rel="noopener noreferrer" class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline">
                          Open source
                        </a>
                      </div>

                      <div class="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-outline-variant/30 bg-black/5">
                        <SocialEmbed :url="selectedItem.media_url" />
                      </div>
                    </div>

                    <div class="grid gap-6 md:grid-cols-2">
                      <div class="space-y-4">
                      <div>
                        <h3 class="font-label text-sm font-bold text-secondary uppercase tracking-wider mb-1">Title</h3>
                        <p class="font-body text-on-surface font-semibold">{{ selectedItem.title || 'N/A' }}</p>
                      </div>
                      <div>
                        <h3 class="font-label text-sm font-bold text-secondary uppercase tracking-wider mb-1">Description</h3>
                        <p class="font-body text-on-surface">{{ selectedItem.description }}</p>
                      </div>
                      <div>
                        <h3 class="font-label text-sm font-bold text-secondary uppercase tracking-wider mb-1">Location</h3>
                        <p class="font-body text-on-surface">{{ selectedItem.community_name || 'Unknown' }} <span v-if="selectedItem.lga">({{ selectedItem.lga }})</span></p>
                      </div>
                      <div>
                        <h3 class="font-label text-sm font-bold text-secondary uppercase tracking-wider mb-1">Category</h3>
                        <div class="flex items-center gap-2 text-on-surface">
                          <span class="material-symbols-outlined text-[18px]">{{ getCategoryMeta(selectedItem.category).icon }}</span>
                          {{ getCategoryMeta(selectedItem.category).label }}
                        </div>
                      </div>
                      </div>

                      <div class="space-y-3 rounded-xl border border-outline-variant/30 bg-surface p-4">
                        <h3 class="font-label text-sm font-bold uppercase tracking-wider text-secondary">Source URL</h3>
                        <div class="break-all font-body text-sm leading-6 text-on-surface-variant">
                          <a :href="selectedItem.media_url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">{{ selectedItem.media_url }}</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Admin Actions Footer -->
                  <div class="border-t border-outline-variant/30 pt-6 mt-6 flex flex-wrap items-center justify-between gap-4">
                    
                    <div class="flex items-center gap-3">
                      <button 
                        v-if="selectedItem.approved"
                        @click="handleToggleFeatured(selectedItem)" 
                        class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                        :class="selectedItem.featured ? 'border-primary text-primary bg-primary-container/20 hover:bg-primary-container/40' : 'border-outline-variant text-on-surface hover:bg-surface-variant'"
                      >
                        <span class="material-symbols-outlined text-[18px]" :class="selectedItem.featured ? 'fill-current' : ''">star</span>
                        {{ selectedItem.featured ? 'Unfeature Submission' : 'Feature on Archive' }}
                      </button>
                    </div>
                    
                    <button 
                      @click="handleDelete(selectedItem.id)" 
                      class="flex items-center gap-2 rounded-lg bg-error-container/20 px-4 py-2 text-sm font-semibold text-error hover:bg-error-container/40 transition-colors"
                    >
                      <span class="material-symbols-outlined text-[18px]">delete</span> Delete Permanently
                    </button>
                    
                  </div>
                </div>
                
              </div>
              
              <div v-else class="flex h-full items-center justify-center rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-12 text-center text-on-surface-variant">
                <div>
                  <span class="material-symbols-outlined text-4xl mb-3">ads_click</span>
                  <p>Select a submission from the list to review it.</p>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </section>
    </div>
  </main>
</template>
