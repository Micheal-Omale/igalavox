/**
 * IgalaVox seed script.
 *
 * Loads local JSON and inserts it into Supabase `names` table.
 * Script probes live table columns first so it can seed against
 * actual remote schema instead of stale local assumptions.
 *
 * Run: node seed_names.js
 */

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'

function loadLocalEnv() {
  if (!existsSync('.env')) return

  const lines = readFileSync('.env', 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

loadLocalEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const raw = readFileSync('./src/data/igala_names_with_tones.json', 'utf-8')
const namesData = JSON.parse(raw)

const optionalColumnMap = {
  pronunciation: (entry) => entry.pronunciation || null,
  description: (entry) => entry.story || entry.description || null,
  category: (entry) => entry.category || null,
  proverb: (entry) => entry.proverb || null,
  tonal_name: (entry) => entry.tonal_name || null,
  audio_url: (entry) => entry.audioSrc || null,
  origin: (entry) => entry.category || null,
  origin_story_ai: (entry) => entry.story || entry.description || null,
  origin_story_final: (entry) => entry.story || entry.description || null,
}

function normalizeGender(value) {
  if (value === '♂' || value === 'Male') return 'Male'
  if (value === '♀' || value === 'Female') return 'Female'
  return 'Unisex'
}

async function columnExists(column) {
  const { error } = await supabase.from('names').select(column).limit(1)
  return !error
}

async function detectExistingColumns() {
  const columns = ['name', 'meaning', 'gender', 'tags', ...Object.keys(optionalColumnMap)]
  const existing = new Set()

  for (const column of columns) {
    if (await columnExists(column)) {
      existing.add(column)
    }
  }

  return existing
}

function buildRows(existingColumns) {
  return namesData.map((entry) => {
    const row = {
      name: entry.name,
      meaning: (entry.meaning || '').replace(/^"|"$/g, ''),
      gender: normalizeGender(entry.gender),
      tags: Array.isArray(entry.tags) ? entry.tags : [],
    }

    for (const [column, getValue] of Object.entries(optionalColumnMap)) {
      if (existingColumns.has(column)) {
        row[column] = getValue(entry)
      }
    }

    return row
  })
}

async function writeBatch(batch) {
  const result = await supabase
    .from('names')
    .upsert(batch, {
      onConflict: 'name',
      ignoreDuplicates: false,
    })
    .select('id')

  return result
}

async function seed() {
  console.log(`Loaded ${namesData.length} names from JSON.\n`)

  const existingColumns = await detectExistingColumns()
  const rows = buildRows(existingColumns)

  console.log(`Using columns: ${[...existingColumns].sort().join(', ')}\n`)

  const batchSize = 50
  let inserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { data, error } = await writeBatch(batch)

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`)
      errors += batch.length
      continue
    }

    inserted += data?.length || batch.length
    process.stdout.write(`\rProcessed ${Math.min(i + batchSize, rows.length)} / ${rows.length}`)
  }

  console.log('\n\nSeed complete.')
  console.log(`Inserted/updated: ${inserted}`)
  if (errors) console.log(`Errors: ${errors}`)
  console.log('')
}

seed().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
