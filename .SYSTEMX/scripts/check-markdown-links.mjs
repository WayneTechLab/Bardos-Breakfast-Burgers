#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const skippedDirectories = new Set(['.git', 'dist', 'node_modules'])

function walk(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skippedDirectories.has(entry.name)) continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(target))
    else if (entry.name.endsWith('.md')) files.push(target)
  }
  return files
}

function targetExists(sourceFile, rawTarget) {
  let target = rawTarget.trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0]
  if (!target || /^(https?:|mailto:|tel:|#)/i.test(target)) return true
  try { target = decodeURIComponent(target) } catch { return false }
  const resolved = path.resolve(path.dirname(sourceFile), target)
  if (existsSync(resolved)) return true
  if (sourceFile.includes(`${path.sep}wiki${path.sep}`) && !path.extname(target)) return existsSync(`${resolved}.md`)
  return false
}

const failures = []
for (const file of walk(rootDir)) {
  const text = readFileSync(file, 'utf8')
  const links = /\[[^\]]*\]\(([^)]+)\)/g
  let match
  while ((match = links.exec(text))) {
    if (!targetExists(file, match[1])) failures.push(`${path.relative(rootDir, file)} -> ${match[1]}`)
  }
}

if (failures.length) {
  console.error('Broken relative Markdown links:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`[SFWA-WTL-G1] Markdown link check passed (${walk(rootDir).length} files)`)
