import localCommunities from '../data/local_govt_area.json'
import { isSupabaseConfigured, supabase } from './supabase'

export const IMPACT_BUCKET = 'impact-reports'

export const impactCategories = [
  { key: 'water', label: 'Water', icon: 'water_drop', marker: '#2563eb' },
  { key: 'electricity', label: 'Electricity', icon: 'bolt', marker: '#ca8a04' },
  { key: 'roads', label: 'Roads', icon: 'route', marker: '#a44a3f' },
  { key: 'healthcare', label: 'Healthcare', icon: 'local_hospital', marker: '#047857' },
]

const fallbackCommunities = Array.isArray(localCommunities) ? localCommunities : []
const fallbackLgas = [...new Set(fallbackCommunities.map((item) => item.lga).filter(Boolean))].sort()

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))]
}

function asCount(value) {
  return Number(value || 0)
}

function isMissingTableError(error, tableName) {
  if (!error) return false
  if (error.code === 'PGRST205') return true
  return String(error.message || '').includes(`Could not find the table 'public.${tableName}'`)
}

function buildStoragePath(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase() || 'jpg'
  const date = new Date()
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `reports/${year}/${month}/${crypto.randomUUID()}.${extension}`
}

function cleanImageUrls(payload) {
  const urls = Array.isArray(payload.image_urls) ? payload.image_urls.filter(Boolean).slice(0, 3) : []
  if (payload.image_url && !urls.length) urls.push(payload.image_url)
  return urls
}

function cleanPayload(payload) {
  const imageUrls = cleanImageUrls(payload)

  return {
    category: payload.category,
    title: payload.title || null,
    description: payload.description,
    community_name: payload.community_name || 'Pinned community location',
    lga: payload.lga || 'Unspecified',
    latitude: normalizeCoordinate(payload.latitude),
    longitude: normalizeCoordinate(payload.longitude),
    image_url: imageUrls[0] || null,
    image_urls: imageUrls,
    status: payload.status || 'pending',
    verified: payload.verified || false,
  }
}

export function getCategoryMeta(category) {
  return impactCategories.find((item) => item.key === category) || impactCategories[0]
}

export function normalizeCoordinate(value) {
  if (value === '' || value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Number(numeric.toFixed(6)) : null
}

export function hasCoordinates(report) {
  return normalizeCoordinate(report?.latitude) !== null && normalizeCoordinate(report?.longitude) !== null
}

const locationContextPatterns = {
  nearbyLandmark: /^Nearby landmark:\s*(.+)$/im,
  marketName: /^Market:\s*(.+)$/im,
  schoolOrHospitalNearby: /^School\/Hospital nearby:\s*(.+)$/im,
  localDescription: /^Local description:\s*(.+)$/im,
}

export function parseLocationContext(description = '') {
  const text = String(description || '')
  const context = {
    nearbyLandmark: '',
    marketName: '',
    schoolOrHospitalNearby: '',
    localDescription: '',
    issueDescription: text,
  }

  Object.entries(locationContextPatterns).forEach(([key, pattern]) => {
    const match = text.match(pattern)
    if (match?.[1]) {
      context[key] = match[1].trim()
    }
  })

  const lines = text.split('\n')
  let issueStart = 0

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) {
      issueStart = index + 1
      continue
    }

    const isContextLine = Object.values(locationContextPatterns).some((pattern) => pattern.test(lines[index]))
    if (isContextLine) {
      issueStart = index + 1
      continue
    }

    break
  }

  const body = lines.slice(issueStart).join('\n').trim()
  if (body) context.issueDescription = body

  return context
}

export function buildLocationDescription({
  nearbyLandmark = '',
  marketName = '',
  schoolOrHospitalNearby = '',
  localDescription = '',
  description = '',
} = {}) {
  const lines = []

  if (nearbyLandmark.trim()) lines.push(`Nearby landmark: ${nearbyLandmark.trim()}`)
  if (marketName.trim()) lines.push(`Market: ${marketName.trim()}`)
  if (schoolOrHospitalNearby.trim()) lines.push(`School/Hospital nearby: ${schoolOrHospitalNearby.trim()}`)
  if (localDescription.trim()) lines.push(`Local description: ${localDescription.trim()}`)

  const body = String(description || '').trim()
  if (!lines.length) return body
  if (!body) return lines.join('\n')
  return `${lines.join('\n')}\n\n${body}`
}

export function getFallbackCommunities() {
  return fallbackCommunities
}

export async function fetchImpactStats() {
  if (!isSupabaseConfigured) {
    return {
      totalReports: 0,
      waterIssues: 0,
      electricityIssues: 0,
      verifiedCommunities: 0,
    }
  }

  const [total, water, electricity, verified] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('category', 'water'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('category', 'electricity'),
    supabase.from('reports').select('community_name').eq('verified', true),
  ])

  const errors = [total.error, water.error, electricity.error, verified.error].filter(Boolean)
  if (errors.length) throw errors[0]

  return {
    totalReports: asCount(total.count),
    waterIssues: asCount(water.count),
    electricityIssues: asCount(electricity.count),
    verifiedCommunities: new Set((verified.data || []).map((item) => item.community_name).filter(Boolean)).size,
  }
}

export async function fetchLgas() {
  if (!isSupabaseConfigured) return fallbackLgas

  const { data, error } = await supabase
    .from('communities')
    .select('lga')
    .order('lga', { ascending: true })

  if (error) {
    if (isMissingTableError(error, 'communities')) return fallbackLgas
    throw error
  }

  const lgas = uniqueStrings((data || []).map((item) => item.lga))
  return lgas.length ? lgas : fallbackLgas
}

export async function fetchCommunitiesByLga(lga) {
  if (!lga) return []

  if (!isSupabaseConfigured) {
    return fallbackCommunities.filter((item) => item.lga === lga)
  }

  const { data, error } = await supabase
    .from('communities')
    .select('id, community_name, lga, latitude, longitude')
    .eq('lga', lga)
    .order('community_name', { ascending: true })

  if (error) {
    if (isMissingTableError(error, 'communities')) {
      return fallbackCommunities.filter((item) => item.lga === lga)
    }
    throw error
  }

  return (data || []).length ? data : fallbackCommunities.filter((item) => item.lga === lga)
}

export async function fetchImpactReports(filters = {}, admin = false) {
  if (!isSupabaseConfigured) return []

  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (!admin && !filters.status) {
    query = query.in('status', ['approved', 'resolved'])
  }

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.verifiedOnly) query = query.eq('verified', true)
  if (filters.lga) query = query.eq('lga', filters.lga)
  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchImpactStory(id, admin = false) {
  if (!isSupabaseConfigured || !id) return null

  let query = supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!admin) {
    query = query.in('status', ['approved', 'resolved'])
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const fetchImpactReportById = fetchImpactStory

export async function uploadImpactImage(file) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  if (!file) return null

  const filePath = buildStoragePath(file)
  const { data, error } = await supabase.storage
    .from(IMPACT_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data: publicData } = supabase.storage.from(IMPACT_BUCKET).getPublicUrl(data.path)
  return publicData.publicUrl
}

export async function uploadImpactImages(files = []) {
  const selectedFiles = Array.from(files).filter(Boolean).slice(0, 3)
  return Promise.all(selectedFiles.map((file) => uploadImpactImage(file)))
}

export async function submitImpactReport(payload) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('reports')
    .insert(cleanPayload(payload))
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateReportStatus(id, status, verified = undefined) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const patch = { status }
  if (verified !== undefined) patch.verified = verified

  const { error } = await supabase.from('reports').update(patch).eq('id', id)
  if (error) throw error
}

export function getStoragePathFromPublicUrl(url, bucket = IMPACT_BUCKET) {
  if (!url) return ''
  const marker = `/storage/v1/object/public/${bucket}/`
  const parts = String(url).split(marker)
  return parts[1] || ''
}

export async function deleteImpactReport(report) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const reportId = typeof report === 'string' ? report : report?.id
  const reportObject = typeof report === 'object' ? report : null

  if (reportObject) {
    const imagePaths = cleanImageUrls(reportObject)
      .map((url) => getStoragePathFromPublicUrl(url))
      .filter(Boolean)

    if (imagePaths.length) {
      const { error: storageError } = await supabase.storage.from(IMPACT_BUCKET).remove(imagePaths)
      if (storageError) {
        console.error('Failed to remove impact report images:', storageError)
      }
    }
  }

  const { error } = await supabase.from('reports').delete().eq('id', reportId)
  if (error) throw error
}
