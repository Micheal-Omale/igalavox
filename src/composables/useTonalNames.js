import namesDataset from '../data/igala_names_with_tones.json'

// Normalize helper for searching and matching
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const tonalNameByName = new Map(
  namesDataset
    .map((item) => {
      const name = typeof item?.name === 'string' ? item.name.trim() : ''
      const tonalName = typeof item?.tonal_name === 'string' ? item.tonal_name.trim() : ''
      return [normalizeText(name), tonalName]
    })
    .filter(([name, tonalName]) => name && tonalName),
)

export function getDisplayName(item) {
  if (typeof item === 'string') {
    return tonalNameByName.get(normalizeText(item)) || item
  }

  const tonalName = typeof item?.tonal_name === 'string' ? item.tonal_name.trim() : ''
  const name = typeof item?.name === 'string' ? item.name.trim() : ''

  return tonalName || tonalNameByName.get(normalizeText(name)) || name
}

export const mergedNames = namesDataset.map((item) => {
  return {
    ...item,
    displayName: getDisplayName(item),
  }
})

export function useDisplayName() {
  return {
    getDisplayName,
  }
}

export function useTonalNames() {
  return {
    mergedNames,
    normalizeText
  }
}
