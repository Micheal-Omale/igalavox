import { mergedNames } from './useTonalNames'
import { compareNameRecords, matchesNameQuery, normalizeSearchText, searchNameRecords } from '../utils/nameEnhancements'
import { normalizeNameRecord } from '../utils/nameRecord'

const archiveIndex = mergedNames
  .map((record) => normalizeNameRecord(record))
  .sort(compareNameRecords)
const archiveNameMap = new Map(
  archiveIndex.map((record) => [normalizeSearchText(record.name), record]),
)

export function useNameArchive() {
  return {
    archiveIndex,
    getArchiveName,
    matchesNameQuery,
    normalizeSearchText,
    searchArchiveNames,
  }
}

export function getArchiveName(name) {
  return archiveNameMap.get(normalizeSearchText(name)) || null
}

export function searchArchiveNames(query = '', options = {}) {
  return searchNameRecords(archiveIndex, query, options)
}
