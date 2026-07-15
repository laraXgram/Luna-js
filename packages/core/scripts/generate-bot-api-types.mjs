#!/usr/bin/env node
/**
 * Generate TypeScript definitions for the Telegram Bot API from the
 * machine-readable schema published at laraXgram/telegram-api-data.
 *
 * The Bot API changes on every Telegram release; this keeps the typed surface
 * in sync automatically instead of hand-editing hundreds of interfaces. The
 * PHP side is generated separately by Laraquest from the same JSON — this
 * script covers the TypeScript gap (Mini App client + serverless JS backends).
 *
 * Usage:
 *   node scripts/generate-bot-api-types.mjs [--input <path|url>] [--output <path>]
 *
 * Defaults: fetches the canonical raw JSON; falls back to a local sibling
 * checkout of telegram-api-data when offline.
 *
 * @see https://raw.githubusercontent.com/laraXgram/telegram-api-data/main/telegram-api.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REMOTE_URL = 'https://raw.githubusercontent.com/laraXgram/telegram-api-data/main/telegram-api.json'
const LOCAL_FALLBACKS = [
  resolve(__dirname, '../../../../telegram-api-data/telegram-api.json'),
  resolve(__dirname, '../../../telegram-api-data/telegram-api.json'),
]
const DEFAULT_OUTPUT = resolve(__dirname, '../src/telegram/botApi.generated.ts')

/** Bot API scalar names → TypeScript primitives. */
const SCALARS = {
  Integer: 'number',
  Float: 'number',
  'Float number': 'number',
  String: 'string',
  Boolean: 'boolean',
  True: 'true',
}

function parseArgs(argv) {
  const args = { input: null, output: DEFAULT_OUTPUT }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--input') args.input = argv[++i]
    else if (argv[i] === '--output') args.output = resolve(argv[++i])
  }
  return args
}

async function loadSchema(input) {
  // Explicit local file.
  if (input && existsSync(input)) {
    return JSON.parse(readFileSync(input, 'utf8'))
  }

  // Explicit or default remote URL.
  const url = input && /^https?:\/\//.test(input) ? input : REMOTE_URL
  try {
    const res = await fetch(url)
    if (res.ok) return await res.json()
    console.warn(`[gen] remote fetch failed (${res.status}), trying local fallback`)
  } catch (err) {
    console.warn(`[gen] remote fetch error (${err.message}), trying local fallback`)
  }

  for (const path of LOCAL_FALLBACKS) {
    if (existsSync(path)) {
      console.warn(`[gen] using local schema: ${path}`)
      return JSON.parse(readFileSync(path, 'utf8'))
    }
  }

  throw new Error('Unable to load telegram-api.json from remote or local fallback.')
}

/** Map a single Bot API type token (no arrays/unions) to a TS type. */
function scalarOrRef(name, known) {
  const trimmed = name.trim()
  if (SCALARS[trimmed]) return SCALARS[trimmed]
  // Unknown reference — emit as-is; a fallback alias is generated for it.
  known.add(trimmed)
  return trimmed
}

/** Map a union/list token (may contain "or", "|", or comma/"and" lists). */
function mapUnionList(raw, known) {
  const s = raw.trim()
  let parts
  if (s.includes(' or ')) parts = s.split(' or ')
  else if (/,|\sand\s/.test(s)) parts = s.split(/\s*,\s*|\s+and\s+/)
  else if (s.includes('|')) parts = s.split('|')
  else parts = [s]

  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => scalarOrRef(p, known))
    .join(' | ')
}

/** Map a full Bot API type string to a TypeScript type. */
function mapType(raw, known) {
  const s = raw.trim()

  const arr2 = (t) => (/[ |]/.test(t) ? `(${t})[][]` : `${t}[][]`)
  const arr = (t) => (/[ |]/.test(t) ? `(${t})[]` : `${t}[]`)

  if (s.startsWith('Array of Array of ')) {
    return arr2(mapUnionList(s.slice('Array of Array of '.length), known))
  }
  if (s.startsWith('Array of ')) {
    return arr(mapUnionList(s.slice('Array of '.length), known))
  }
  return mapUnionList(s, known)
}

/** Is a field optional? Telegram marks optional fields in the description. */
function fieldIsOptional(field) {
  return /^Optional[.\s]/.test((field.description || '').trim())
}

/** Turn a description into a single-line JSDoc-safe string. */
function jsdoc(text, indent = '  ') {
  if (!text) return ''
  const clean = String(text).replace(/\*\//g, '*​/').replace(/\s+/g, ' ').trim()
  return `${indent}/** ${clean} */\n`
}

function pascal(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function emitInterface(name, description, members, known) {
  let out = ''
  if (description) out += `/** ${description.replace(/\*\//g, '*​/').replace(/\s+/g, ' ').trim()} */\n`
  out += `export interface ${name} {\n`
  if (members.length === 0) {
    out += '  [key: string]: unknown\n'
  }
  for (const m of members) {
    out += jsdoc(m.description)
    const optional = m.optional ? '?' : ''
    out += `  ${m.name}${optional}: ${mapType(m.type, known)}\n`
  }
  out += '}\n\n'
  return out
}

function generate(schema) {
  const known = new Set()
  const definedTypes = new Set(Object.keys(schema.types))

  let body = ''

  // --- Types ---
  for (const type of Object.values(schema.types)) {
    const members = (type.fields || []).map((f) => ({
      name: f.name,
      type: f.type,
      description: f.description,
      optional: fieldIsOptional(f),
    }))
    body += emitInterface(type.name, type.description, members, known)
  }

  // --- Method parameter interfaces ---
  const methodNames = []
  for (const method of Object.values(schema.methods)) {
    const ifaceName = `${pascal(method.name)}Params`
    methodNames.push(method.name)
    const members = (method.parameters || []).map((p) => ({
      name: p.name,
      type: p.type,
      description: p.description,
      optional: p.required === false,
    }))
    body += emitInterface(ifaceName, `Parameters for the \`${method.name}\` method.`, members, known)
  }

  // --- Fallback aliases for referenced-but-undefined tokens ---
  let fallbacks = ''
  const missing = [...known].filter((t) => !definedTypes.has(t) && !Object.values(SCALARS).includes(t)).sort()
  if (missing.length) {
    fallbacks += '// Referenced by the schema but not defined as objects.\n'
    for (const t of missing) fallbacks += `export type ${t} = unknown\n`
    fallbacks += '\n'
  }

  // --- Method name → params map ---
  let methodMap = 'export interface BotApiMethods {\n'
  for (const name of methodNames) methodMap += `  ${name}: ${pascal(name)}Params\n`
  methodMap += '}\n\n'
  methodMap += 'export type BotApiMethodName = keyof BotApiMethods\n'

  const header =
    '/* eslint-disable */\n' +
    '// AUTO-GENERATED — DO NOT EDIT.\n' +
    `// Source: ${schema.source}\n` +
    `// Bot API version: ${schema.version}\n` +
    `// Scraped at: ${schema.scraped_at}\n` +
    `// Regenerate: node scripts/generate-bot-api-types.mjs\n\n` +
    `export const BOT_API_VERSION = '${schema.version}'\n\n`

  return header + fallbacks + body + methodMap
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const schema = await loadSchema(args.input)

  if (!schema.types || !schema.methods) {
    throw new Error('Schema is missing "types" or "methods".')
  }

  const output = generate(schema)
  mkdirSync(dirname(args.output), { recursive: true })
  writeFileSync(args.output, output, 'utf8')

  const typeCount = Object.keys(schema.types).length
  const methodCount = Object.keys(schema.methods).length
  console.log(`[gen] Bot API ${schema.version}: ${typeCount} types, ${methodCount} methods → ${args.output}`)
}

main().catch((err) => {
  console.error(`[gen] ${err.message}`)
  process.exit(1)
})
