import { getDisplayName, normalizeText } from '../composables/useTonalNames'

export const normalizeSearchText = (value = '') => {
  return normalizeText(value)
}

const collectSearchFields = (record = {}) => [
  record.name,
  record.tonal_name,
  record.displayName,
  record.meaning,
  record.story,
  record.description,
  record.category,
  record.origin,
  record.pronunciation,
  record.proverb,
  ...(Array.isArray(record.tags) ? record.tags : []),
]

export const enhanceNameRecord = (record = {}) => {
  const name = String(record.name || '').trim()
  const displayName = getDisplayName({ ...record, name }) || String(record.displayName || '').trim() || name
  const searchFields = collectSearchFields({ ...record, name, displayName })
  const searchableText = normalizeSearchText(searchFields.join(' '))

  return {
    ...record,
    name,
    displayName,
    searchableText,
    nameEnhancements: {
      tonal: displayName !== name ? {
        displayName,
      } : null,
    },
  }
}

const getMatchRank = (record = {}, query = '') => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return 0

  const nameCandidates = [record.name, record.displayName].map(normalizeSearchText).filter(Boolean)
  if (nameCandidates.some((value) => value === normalizedQuery)) return 0
  if (nameCandidates.some((value) => value.startsWith(normalizedQuery))) return 1
  if (record.searchableText && normalizeSearchText(record.searchableText).includes(normalizedQuery)) return 2
  return 3
}

export const compareNameRecords = (left = {}, right = {}) => {
  const leftName = left.displayName || left.name || ''
  const rightName = right.displayName || right.name || ''

  return leftName.localeCompare(rightName, undefined, {
    sensitivity: 'base',
    numeric: true,
  })
}

export const matchesNameQuery = (record = {}, query = '') => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const haystacks = collectSearchFields(record)
  return haystacks.some((value) => normalizeSearchText(value).includes(normalizedQuery))
}

export const searchNameRecords = (records = [], query = '', { offset = 0, limit = 60 } = {}) => {
  const normalizedQuery = normalizeSearchText(query)
  const filtered = normalizedQuery
    ? records.filter((record) => matchesNameQuery(record, normalizedQuery))
    : [...records]

  if (normalizedQuery) {
    filtered.sort((left, right) => {
      const rankDelta = getMatchRank(left, normalizedQuery) - getMatchRank(right, normalizedQuery)
      if (rankDelta !== 0) return rankDelta

      return compareNameRecords(left, right)
    })
  }

  const sliced = filtered.slice(offset, offset + limit)

  return {
    rows: sliced,
    total: filtered.length,
  }
}
