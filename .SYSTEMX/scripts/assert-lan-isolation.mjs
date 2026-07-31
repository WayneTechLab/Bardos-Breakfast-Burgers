#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const rootDir = process.cwd()
const distDir = join(rootDir, 'dist')
const forbiddenNames = new Set(['Website_Dashboard.html', 'website_dashboard.html'])
const forbiddenMarkers = ['.SYSTEMX/LAN', '.SYSTEMX\\LAN', 'SYSTEMX LAN', 'LOCAL DEVELOPMENT ONLY']
const readableExtensions = new Set(['.html', '.js', '.mjs', '.css', '.json', '.txt', '.map'])

function walk(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(target))
    else files.push(target)
  }
  return files
}

if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
  throw new Error('Production dist directory does not exist.')
}

for (const file of walk(distDir)) {
  const relativeFile = relative(distDir, file)
  const normalizedName = relativeFile.replaceAll('\\', '/').split('/').at(-1)
  if (normalizedName && forbiddenNames.has(normalizedName)) {
    throw new Error(`SYSTEMX LAN file leaked into dist: ${relativeFile}`)
  }

  if (!readableExtensions.has(extname(file).toLowerCase())) continue

  const contents = readFileSync(file, 'utf8')
  for (const marker of forbiddenMarkers) {
    if (contents.includes(marker)) {
      throw new Error(`SYSTEMX LAN marker "${marker}" found in ${relativeFile}`)
    }
  }
}

console.log('[SYSTEMX] LAN isolation check passed.')
