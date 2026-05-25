const FACEBOOK_HOSTS = new Set([
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'fb.watch',
  'www.fb.watch'
])

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be'
])

const TIKTOK_HOSTS = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com'
])

const MEDIA_DEBUG_PREFIX = '[SocialEmbed]'

function debugLog(message, payload) {
  if (!import.meta.env.DEV) return
  console.info(MEDIA_DEBUG_PREFIX, message, payload)
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function stripTrackingParams(parsedUrl) {
  const keysToDelete = [
    'mibextid',
    'rdid',
    'share_url',
    'sfnsn',
    'fs',
    'refsrc',
    '__tn__',
    'paipv'
  ]

  keysToDelete.forEach((key) => parsedUrl.searchParams.delete(key))
}

export function normalizeMediaUrl(rawUrl) {
  if (!rawUrl) return ''

  const candidate = rawUrl.trim()

  try {
    const parsedUrl = new URL(candidate)
    const host = parsedUrl.hostname.toLowerCase()

    if (FACEBOOK_HOSTS.has(host)) {
      stripTrackingParams(parsedUrl)

      if (/^\/share\/v\//i.test(parsedUrl.pathname)) {
        const redirectedUrl =
          parsedUrl.searchParams.get('u') ||
          parsedUrl.searchParams.get('href') ||
          parsedUrl.searchParams.get('link')

        if (redirectedUrl) {
          return normalizeMediaUrl(safeDecode(redirectedUrl))
        }
      }
    }

    return parsedUrl.toString()
  } catch {
    debugLog('Failed to normalize URL', { rawUrl: candidate })
    return candidate
  }
}

export function detectPlatform(rawUrl) {
  const normalizedUrl = normalizeMediaUrl(rawUrl)

  if (!normalizedUrl) return 'unknown'

  try {
    const parsedUrl = new URL(normalizedUrl)
    const host = parsedUrl.hostname.toLowerCase()

    if (YOUTUBE_HOSTS.has(host)) return 'youtube'
    if (TIKTOK_HOSTS.has(host)) return 'tiktok'
    if (FACEBOOK_HOSTS.has(host)) return 'facebook'
  } catch {
    debugLog('Platform detection failed', { rawUrl, normalizedUrl })
  }

  return 'invalid'
}

export function getYoutubeId(rawUrl) {
  const normalizedUrl = normalizeMediaUrl(rawUrl)
  const match = normalizedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?/]+)/)
  return match ? match[1] : null
}

export function getTikTokId(rawUrl) {
  const normalizedUrl = normalizeMediaUrl(rawUrl)
  const match = normalizedUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  return match ? match[1] : null
}

export function getFacebookEmbedConfig(rawUrl) {
  const normalizedUrl = normalizeMediaUrl(rawUrl)

  try {
    const parsedUrl = new URL(normalizedUrl)
    const host = parsedUrl.hostname.toLowerCase()
    const path = parsedUrl.pathname
    const hasVideoIdQuery = parsedUrl.searchParams.has('v')
    const hasStoryId =
      parsedUrl.searchParams.has('story_fbid') ||
      parsedUrl.searchParams.has('fbid')

    if (!FACEBOOK_HOSTS.has(host)) {
      debugLog('Rejected non-Facebook URL', { rawUrl, normalizedUrl })
      return null
    }

    const isVideoPath =
      /^\/watch\/?$/i.test(path) ||
      /\/videos\/(?:vb\.\d+\/)?\d+/i.test(path) ||
      /\/reel\/\d+/i.test(path) ||
      host === 'fb.watch' ||
      host === 'www.fb.watch'

    const isPostPath =
      /\/posts\/\d+/i.test(path) ||
      /\/permalink\.php$/i.test(path) ||
      /\/photo\.php$/i.test(path) ||
      /\/story\.php$/i.test(path)

    const pluginPath = isVideoPath || hasVideoIdQuery ? 'video.php' : isPostPath || hasStoryId ? 'post.php' : null

    if (!pluginPath) {
      debugLog('Rejected unsupported Facebook path', { rawUrl, normalizedUrl, path })
      return null
    }

    const embedUrl = new URL(`https://www.facebook.com/plugins/${pluginPath}`)
    embedUrl.searchParams.set('href', normalizedUrl)
    embedUrl.searchParams.set('show_text', 'false')
    embedUrl.searchParams.set('width', '560')

    const config = {
      provider: 'facebook',
      kind: pluginPath === 'video.php' ? 'video' : 'post',
      normalizedUrl,
      embedUrl: embedUrl.toString()
    }

    debugLog('Generated Facebook embed config', config)
    return config
  } catch {
    debugLog('Failed to generate Facebook embed config', { rawUrl, normalizedUrl })
    return null
  }
}

export function getEmbedConfig(rawUrl) {
  const platform = detectPlatform(rawUrl)
  const normalizedUrl = normalizeMediaUrl(rawUrl)

  if (platform === 'youtube') {
    const videoId = getYoutubeId(rawUrl)
    if (!videoId) return null

    return {
      provider: 'youtube',
      kind: 'video',
      normalizedUrl,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }
  }

  if (platform === 'tiktok') {
    const videoId = getTikTokId(rawUrl)
    if (!videoId) return null

    return {
      provider: 'tiktok',
      kind: 'video',
      normalizedUrl,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`
    }
  }

  if (platform === 'facebook') {
    return getFacebookEmbedConfig(rawUrl)
  }

  return null
}
