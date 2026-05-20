import { isSupabaseConfigured, requireSupabase } from './supabase'

export const MARKETPLACE_BUCKET = 'marketplace-products'

export const marketplaceCategories = [
  {
    key: 'Traditional Fabrics',
    label: 'Traditional Fabrics',
    icon: 'checkroom',
    description: 'Handwoven textiles, ceremonial cloth, and garments shaped by memory and craft.',
  },
  {
    key: 'Handmade Crafts',
    label: 'Handmade Crafts',
    icon: 'handyman',
    description: 'Carefully made objects that carry everyday artistry and cultural function.',
  },
  {
    key: 'Art & Sculptures',
    label: 'Art & Sculptures',
    icon: 'palette',
    description: 'Visual pieces that translate Igala imagination into lasting contemporary form.',
  },
  {
    key: 'Cultural Books',
    label: 'Cultural Books',
    icon: 'menu_book',
    description: 'Texts, educational materials, and historical references rooted in heritage.',
  },
  {
    key: 'Fashion & Accessories',
    label: 'Fashion & Accessories',
    icon: 'diamond',
    description: 'Modern expressions of identity through wearable culture and detail.',
  },
  {
    key: 'Digital Heritage Products',
    label: 'Digital Heritage Products',
    icon: 'library_books',
    description: 'Digital works that preserve stories, knowledge, and cultural materials.',
  },
]

const fallbackProducts = [
  {
    id: 'mkp-1',
    title: 'Royal Anyigba Aso-Oke Wrap',
    slug: 'royal-anyigba-aso-oke-wrap',
    description: 'A ceremonial textile woven in warm earth tones for dignified occasions and heirloom gifting.',
    cultural_story: 'Inspired by celebratory dressing traditions, this wrap honors the visual richness of community gatherings and the quiet status that cloth can carry across generations.',
    category: 'Traditional Fabrics',
    vendor_name: 'Attah Loom House',
    vendor_whatsapp: '2348012345678',
    vendor_email: 'loomhouse@example.com',
    price: 85000,
    inventory_count: 4,
    featured: true,
    published: true,
    image_urls: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    ],
    materials_used: 'Handwoven cotton blend, natural dye accents',
    availability: 'Limited edition',
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'mkp-2',
    title: 'Ochaja Clay Story Vessel',
    slug: 'ochaja-clay-story-vessel',
    description: 'A hand-finished vessel designed as both decor and a conversation piece for heritage-centered homes.',
    cultural_story: 'The vessel reflects domestic craft traditions where beauty and utility met. Its etched patterns echo the layered storytelling found in family compounds and oral memory.',
    category: 'Handmade Crafts',
    vendor_name: 'Inikpi Artisan Studio',
    vendor_whatsapp: '2348098765432',
    vendor_email: 'studio@example.com',
    price: 42000,
    inventory_count: 6,
    featured: true,
    published: true,
    image_urls: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    ],
    materials_used: 'Locally fired clay, etched detailing',
    availability: 'In stock',
    created_at: '2026-05-02T10:00:00Z',
  },
  {
    id: 'mkp-3',
    title: 'Voices of Igala History',
    slug: 'voices-of-igala-history',
    description: 'A curated cultural reader for students, families, and diaspora learners reconnecting with home.',
    cultural_story: 'This volume is designed to bridge distance with memory, assembling language, history, and reflective essays into one gentle point of return.',
    category: 'Cultural Books',
    vendor_name: 'Akpoti Heritage Press',
    vendor_whatsapp: '2348070001122',
    vendor_email: 'press@example.com',
    price: 18500,
    inventory_count: 18,
    featured: false,
    published: true,
    image_urls: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    ],
    materials_used: 'Paperback print edition',
    availability: 'In stock',
    created_at: '2026-05-03T10:00:00Z',
  },
  {
    id: 'mkp-4',
    title: 'Ene Festival Beaded Set',
    slug: 'ene-festival-beaded-set',
    description: 'A warm-toned accessory set made for festive dressing, portraits, and ceremonial keepsakes.',
    cultural_story: 'Beadwork has long signaled care, identity, and occasion. This set reinterprets those codes for a modern wardrobe without losing its ceremonial soul.',
    category: 'Fashion & Accessories',
    vendor_name: 'Ojo Bead Atelier',
    vendor_whatsapp: '2348034567890',
    vendor_email: 'beads@example.com',
    price: 33000,
    inventory_count: 9,
    featured: false,
    published: true,
    image_urls: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
    ],
    materials_used: 'Glass beads, brass clasp',
    availability: 'Made to order',
    created_at: '2026-05-04T10:00:00Z',
  },
  {
    id: 'mkp-5',
    title: 'Ancestral Pattern Print Pack',
    slug: 'ancestral-pattern-print-pack',
    description: 'A digital heritage bundle of pattern studies for educators, designers, and storytellers.',
    cultural_story: 'The pack turns visual motifs into a reusable digital resource, supporting respectful reinterpretation while keeping source traditions visible and valued.',
    category: 'Digital Heritage Products',
    vendor_name: 'Igalavox Studio',
    vendor_whatsapp: '2348000000000',
    vendor_email: 'hello@igalavox.com',
    price: 12000,
    inventory_count: 999,
    featured: true,
    published: true,
    image_urls: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    ],
    materials_used: 'Digital download',
    availability: 'Instant access',
    created_at: '2026-05-05T10:00:00Z',
  },
]

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: product.title || 'Untitled product',
    slug: product.slug || '',
    description: product.description || '',
    cultural_story: product.cultural_story || '',
    category: product.category || '',
    vendor_name: product.vendor_name || 'Unknown artisan',
    vendor_whatsapp: product.vendor_whatsapp || '',
    vendor_email: product.vendor_email || '',
    price: Number(product.price || 0),
    inventory_count: Number(product.inventory_count || 0),
    featured: Boolean(product.featured),
    published: product.published !== false,
    image_urls: asArray(product.image_urls).filter(Boolean).slice(0, 5),
    materials_used: product.materials_used || '',
    availability: product.availability || (Number(product.inventory_count || 0) > 0 ? 'In stock' : 'Out of stock'),
    created_at: product.created_at || null,
  }
}

function filterProducts(products, filters = {}, admin = false) {
  const search = String(filters.search || '').trim().toLowerCase()

  return products.filter((product) => {
    if (!admin && !product.published) return false
    if (filters.featuredOnly && !product.featured) return false
    if (filters.category && product.category !== filters.category) return false
    if (filters.vendorName && product.vendor_name !== filters.vendorName) return false

    if (!search) return true

    const haystack = [
      product.title,
      product.description,
      product.cultural_story,
      product.vendor_name,
      product.category,
    ].join(' ').toLowerCase()

    return haystack.includes(search)
  })
}

function isMissingTableError(error, tableName) {
  if (!error) return false
  if (error.code === 'PGRST205') return true
  return String(error.message || '').includes(`Could not find the table 'public.${tableName}'`)
}

function isMissingBucketError(error, bucketName) {
  if (!error) return false
  if (error.statusCode === '404') return true
  const message = String(error.message || '').toLowerCase()
  return message.includes(bucketName.toLowerCase()) && message.includes('bucket')
}

function buildStoragePath(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase() || 'jpg'
  const stamp = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.round(Math.random() * 1e6)}`
  return `products/${new Date().toISOString().slice(0, 7)}/${stamp}.${extension}`
}

function getStoragePathFromPublicUrl(url, bucket = MARKETPLACE_BUCKET) {
  if (!url) return ''
  const marker = `/storage/v1/object/public/${bucket}/`
  const parts = String(url).split(marker)
  return parts[1] || ''
}

export function formatMarketplacePrice(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function normalizeMarketplaceSlug(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function fetchMarketplaceProducts(filters = {}, admin = false) {
  if (!isSupabaseConfigured) {
    return filterProducts(fallbackProducts.map(normalizeProduct), filters, admin)
  }

  const client = requireSupabase()
  let query = client
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (!admin) query = query.eq('published', true)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.vendorName) query = query.eq('vendor_name', filters.vendorName)
  if (filters.featuredOnly) query = query.eq('featured', true)
  if (filters.limit) query = query.limit(filters.limit)

  const search = String(filters.search || '').trim()
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,cultural_story.ilike.%${search}%,vendor_name.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (isMissingTableError(error, 'products')) {
    return filterProducts(fallbackProducts.map(normalizeProduct), filters, admin)
  }
  if (error) throw error
  return (data || []).map(normalizeProduct)
}

export async function fetchMarketplaceProductBySlug(slug) {
  if (!slug) return null

  if (!isSupabaseConfigured) {
    return fallbackProducts.map(normalizeProduct).find((item) => item.slug === slug) || null
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (isMissingTableError(error, 'products')) {
    return fallbackProducts.map(normalizeProduct).find((item) => item.slug === slug) || null
  }
  if (error) throw error
  return data ? normalizeProduct(data) : null
}

export async function fetchMarketplaceVendorNames() {
  if (!isSupabaseConfigured) {
    return [...new Set(fallbackProducts.map((item) => item.vendor_name))].sort()
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from('products')
    .select('vendor_name')
    .order('vendor_name', { ascending: true })

  if (isMissingTableError(error, 'products')) {
    return [...new Set(fallbackProducts.map((item) => item.vendor_name))].sort()
  }
  if (error) throw error

  return [...new Set((data || []).map((item) => item.vendor_name).filter(Boolean))].sort()
}

async function uploadMarketplaceImage(file) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const client = requireSupabase()
  const filePath = buildStoragePath(file)
  const { data, error } = await client.storage
    .from(MARKETPLACE_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (isMissingBucketError(error, MARKETPLACE_BUCKET)) {
    throw new Error('Supabase storage bucket "marketplace-products" is missing.')
  }
  if (error) throw error

  const { data: publicData } = client.storage.from(MARKETPLACE_BUCKET).getPublicUrl(data.path)
  return publicData.publicUrl
}

export async function uploadMarketplaceImages(files = []) {
  const selectedFiles = Array.from(files).filter(Boolean).slice(0, 5)
  return Promise.all(selectedFiles.map((file) => uploadMarketplaceImage(file)))
}

function cleanProductPayload(payload) {
  return {
    title: payload.title?.trim(),
    slug: normalizeMarketplaceSlug(payload.slug || payload.title),
    description: payload.description?.trim() || '',
    cultural_story: payload.cultural_story?.trim() || '',
    category: payload.category || '',
    vendor_name: payload.vendor_name?.trim() || '',
    vendor_whatsapp: payload.vendor_whatsapp?.trim() || '',
    vendor_email: payload.vendor_email?.trim() || '',
    price: Number(payload.price || 0),
    inventory_count: Number(payload.inventory_count || 0),
    featured: Boolean(payload.featured),
    published: Boolean(payload.published),
    image_urls: asArray(payload.image_urls).filter(Boolean).slice(0, 5),
    materials_used: payload.materials_used?.trim() || '',
    availability: payload.availability?.trim() || '',
  }
}

export async function createMarketplaceProduct(payload) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const client = requireSupabase()
  const { data, error } = await client
    .from('products')
    .insert(cleanProductPayload(payload))
    .select()
    .single()

  if (error) throw error
  return normalizeProduct(data)
}

export async function updateMarketplaceProduct(id, payload) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const client = requireSupabase()
  const { data, error } = await client
    .from('products')
    .update(cleanProductPayload(payload))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return normalizeProduct(data)
}

export async function deleteMarketplaceProduct(product) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const client = requireSupabase()
  const productId = typeof product === 'string' ? product : product?.id
  const imageUrls = typeof product === 'object' ? asArray(product.image_urls) : []
  const imagePaths = imageUrls
    .map((url) => getStoragePathFromPublicUrl(url))
    .filter(Boolean)

  if (imagePaths.length) {
    const { error: storageError } = await client.storage.from(MARKETPLACE_BUCKET).remove(imagePaths)
    if (storageError) {
      console.error('Failed to remove marketplace images:', storageError)
    }
  }

  const { error } = await client.from('products').delete().eq('id', productId)
  if (error) throw error
}
