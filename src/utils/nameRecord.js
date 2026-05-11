export function normalizeNameRecord(record = {}) {
  const audioUrl = record.audio_url || record.audio_files?.file_url || null
  const category = record.category || record.origin || ''
  const story = record.description || record.origin_story_final || record.origin_story_ai || ''
  const pronunciation = record.pronunciation || ''
  const proverb = record.proverb || ''
  const gender = record.gender || 'Unisex'

  return {
    ...record,
    audioUrl,
    audioSrc: audioUrl,
    story,
    description: story,
    category,
    origin: record.origin || category,
    pronunciation,
    proverb,
    gender,
    tags: Array.isArray(record.tags) ? record.tags : [],
    genderIcon: gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'person',
  }
}

export function toNameWritePayload(input = {}) {
  const story = input.story || input.description || input.origin_story_final || input.origin_story_ai || null
  const category = input.category || input.origin || null

  return {
    name: input.name?.trim() || '',
    meaning: input.meaning?.trim() || '',
    gender: input.gender || 'Unisex',
    tags: Array.isArray(input.tags) ? input.tags : [],
    origin: category,
    origin_story_ai: input.origin_story_ai || story,
    origin_story_final: input.origin_story_final || story,
    ...(input.audio_id ? { audio_id: input.audio_id } : {}),
    ...(Object.prototype.hasOwnProperty.call(input, 'audio_id') && input.audio_id === null ? { audio_id: null } : {}),
  }
}
