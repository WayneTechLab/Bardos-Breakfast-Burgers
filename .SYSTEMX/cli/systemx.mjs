#!/usr/bin/env node

import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { spawn } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectPlatform, browserOpenCommand } from '../lib/platform.mjs'
import { migrateState, protectLocalFile, updateState } from '../lib/state.mjs'
import { createRunId, writeOperationalLog } from '../lib/logging.mjs'
import { hasCommand, run, versionOf } from '../lib/process.mjs'
import { syncAgentAdapters } from '../lib/agent-adapters.mjs'
import { buildDeployArguments, selectDeployTargets } from '../lib/firebase.mjs'
import { appendBusMessage, archiveBusWave, busPaths, readBusMessages, summarizeBus } from '../lib/bus.mjs'
import { isPidAlive, readSession, stopSession } from '../lib/local-session.mjs'

const cliFile = fileURLToPath(import.meta.url)
const systemxDir = path.resolve(path.dirname(cliFile), '..')
const rootDir = path.resolve(systemxDir, '..')
const stateFile = path.join(systemxDir, 'state', 'local.json')
const legacyStateFile = path.join(systemxDir, 'status', 'setup-state.env')
const logDir = path.join(systemxDir, 'logs')
const busDir = busPaths(systemxDir)
const versionFile = path.join(systemxDir, 'version', 'app-version.txt')
const versionJsonFile = path.join(systemxDir, 'version', 'version.json')
const packageFile = path.join(rootDir, 'package.json')
const starterPackageFile = path.join(systemxDir, 'Template', 'starter', 'package.json')
const supportMatrixFile = path.join(systemxDir, 'platforms', 'support-matrix.json')
const lanRunnerFile = path.join(systemxDir, 'LAN', 'runner.mjs')
const slcBridgeFile = path.join(systemxDir, 'LAN', 'Website', 'slc-sync-bridge.csv')
const kitDir = path.join(systemxDir, 'KIT')
const firebaseToolsVersion = '15.25.1'

function parseArguments(argv) {
  const options = {}
  const positional = []
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (!item.startsWith('--')) {
      positional.push(item)
      continue
    }
    const equal = item.indexOf('=')
    if (equal > -1) {
      options[item.slice(2, equal)] = item.slice(equal + 1)
      continue
    }
    const key = item.slice(2)
    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      options[key] = next
      index += 1
    } else options[key] = true
  }
  return { options, positional }
}

function packageJson(file = packageFile) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function printHeader(platformInfo) {
  const version = packageJson().version
  console.log(`\nSFWA-WTL-G1 v${version}`)
  console.log(`Platform: ${platformInfo.platformId} · shell: ${platformInfo.shell}`)
}

function npmRun(script, platformInfo, args = [], options = {}) {
  return run('npm', ['run', '-s', script, ...args], { cwd: rootDir, platformInfo, ...options })
}

function runFirebase(args, platformInfo, options = {}) {
  return run('npx', ['--yes', `firebase-tools@${firebaseToolsVersion}`, ...args], { cwd: rootDir, platformInfo, ...options })
}

function toolStatus(name, platformInfo, args = ['--version']) {
  if (name === 'firebase') {
    const result = runFirebase(args, platformInfo, { capture: true, allowFailure: true })
    return { name, required: true, installed: result.status === 0, version: result.stdout.trim().split(/\r?\n/)[0] }
  }
  const version = versionOf(name, platformInfo, rootDir, args)
  return { name, required: ['node', 'npm', 'git'].includes(name), installed: Boolean(version), version }
}

function chromeStatus(platformInfo) {
  const candidates = platformInfo.macos
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : platformInfo.windows
      ? [
          path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
        ]
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']
  const installedPath = candidates.find((candidate) => existsSync(candidate))
  return { name: 'chrome', required: false, installed: Boolean(installedPath), version: installedPath || null }
}

function workstationBootstrapCommand(platformInfo) {
  const raw = 'https://raw.githubusercontent.com/WayneTechLab/SFWA-WTL-TEMPLATE/main/.SYSTEMX/scripts'
  if (platformInfo.windows) return `irm ${raw}/install.ps1 | iex`
  return `/bin/bash -c "$(curl -fsSL ${raw}/install.sh)"`
}

function toolingInventory(platformInfo) {
  const tools = [
    toolStatus('node', platformInfo),
    toolStatus('npm', platformInfo),
    toolStatus('git', platformInfo),
    toolStatus('gh', platformInfo),
    toolStatus('code', platformInfo),
    toolStatus('gcloud', platformInfo),
    toolStatus('firebase', platformInfo),
    toolStatus('stripe', platformInfo),
    toolStatus('m365', platformInfo, ['version']),
    chromeStatus(platformInfo),
  ]
  if (platformInfo.windows) {
    const pwsh = toolStatus('pwsh.exe', platformInfo, ['-NoLogo', '-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()'])
    pwsh.name = 'pwsh'
    pwsh.required = true
    tools.splice(3, 0, pwsh)
  }
  return tools
}

function installPlan(platformInfo, options) {
  const selected = [
    { command: 'git', macPackage: 'git', windowsPackage: 'Git.Git' },
    { command: 'gh', macPackage: 'gh', windowsPackage: 'GitHub.cli' },
    { command: 'code', macPackage: 'visual-studio-code', windowsPackage: 'Microsoft.VisualStudioCode', macCask: true },
    { command: 'gcloud', macPackage: 'google-cloud-sdk', windowsPackage: 'Google.CloudSDK', macCask: true },
    { command: 'chrome', macPackage: 'google-chrome', windowsPackage: 'Google.Chrome', macCask: true },
  ]
  if (options['with-stripe']) selected.push({ command: 'stripe', macPackage: 'stripe/stripe-cli/stripe', windowsPackage: 'Stripe.StripeCLI' })
  if (options['with-m365']) selected.push({ command: 'm365', macPackage: '@pnp/cli-microsoft365', windowsPackage: '@pnp/cli-microsoft365' })
  return selected.filter(({ command }) => command === 'chrome'
    ? !chromeStatus(platformInfo).installed
    : !hasCommand(command, platformInfo, rootDir))
}

function installTools(platformInfo, options) {
  const plan = installPlan(platformInfo, options)
  if (!plan.length) return
  if (platformInfo.linux) {
    const args = [path.join(systemxDir, 'scripts', 'install.sh'), '--local', '--skip-menu']
    if (options['dry-run']) args.push('--dry-run', '--yes')
    run('bash', args, { cwd: rootDir, platformInfo })
    if (options['with-m365'] && options['dry-run']) console.log('[dry-run] install optional Microsoft 365 CLI with npm')
    else if (options['with-m365']) run('npm', ['install', '-g', '@pnp/cli-microsoft365'], { cwd: rootDir, platformInfo })
    if (options['with-stripe']) console.warn(`Stripe CLI installation is not automatic on ${platformInfo.platformId}; use the vendor package for this architecture, then re-run doctor.`)
    return
  }
  for (const item of plan) {
    if (platformInfo.platformId === 'windows-arm64' && ['gcloud', 'stripe'].includes(item.command) && !options['allow-x64-emulation']) {
      console.warn(`SKIP ${item.command}: no verified native Windows ARM64 build. Re-run with --allow-x64-emulation after reviewing the x64 emulation risk.`)
      continue
    }
    if (options['dry-run']) {
      console.log(`[dry-run] install ${item.command} for ${platformInfo.platformId}`)
      continue
    }
    if (item.command === 'm365') run('npm', ['install', '-g', '@pnp/cli-microsoft365'], { cwd: rootDir, platformInfo })
    else if (platformInfo.macos && item.macCask) run('brew', ['install', '--cask', item.macPackage], { cwd: rootDir, platformInfo })
    else if (platformInfo.macos) run('brew', ['install', item.macPackage], { cwd: rootDir, platformInfo })
    else if (platformInfo.windows && item.command !== 'm365') {
      run('winget.exe', ['install', '--id', item.windowsPackage, '-e', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements'], { cwd: rootDir, platformInfo })
    } else if (item.command === 'm365') run('npm', ['install', '-g', '@pnp/cli-microsoft365'], { cwd: rootDir, platformInfo })
    else console.warn(`Automatic install is not supported on ${platformInfo.platformId}: ${item.command}`)
  }
}

function authenticateTools(platformInfo, options) {
  if (options['dry-run']) {
    console.log('[dry-run] gh auth login; gcloud auth login; firebase login')
    return
  }
  if (hasCommand('gh', platformInfo, rootDir)) run('gh', ['auth', 'status'], { cwd: rootDir, platformInfo, allowFailure: true })
  if (hasCommand('gcloud', platformInfo, rootDir)) run('gcloud', ['auth', 'list'], { cwd: rootDir, platformInfo, allowFailure: true })
  if (existsSync(path.join(rootDir, 'node_modules'))) runFirebase(['login:list'], platformInfo, { allowFailure: true })
}

async function doctor(platformInfo, options = {}) {
  if (options.install) installTools(platformInfo, options)
  if (options.auth) authenticateTools(platformInfo, options)
  const inventory = toolingInventory(platformInfo)
  const matrix = existsSync(supportMatrixFile) ? JSON.parse(readFileSync(supportMatrixFile, 'utf8')) : null
  const node = inventory.find((tool) => tool.name === 'node')
  const nodeCompatible = /^v?24\./.test(node?.version || '')
  const result = {
    platform: platformInfo,
    nodeTarget: '24.x',
    nodeCompatible,
    tools: inventory,
    support: matrix?.platforms?.[platformInfo.platformId] || null,
    workstationBootstrap: workstationBootstrapCommand(platformInfo),
  }
  if (options.json) console.log(JSON.stringify(result, null, 2))
  else {
    printHeader(platformInfo)
    for (const tool of inventory) console.log(`${tool.installed ? 'PASS' : tool.required ? 'FAIL' : 'INFO'} ${tool.name}: ${tool.version || 'not installed'}`)
    if (!nodeCompatible) console.log(`FAIL node: expected 24.x, received ${node?.version || 'unknown'}`)
    if (result.support?.notes) for (const note of result.support.notes) console.log(`NOTE ${note}`)
    console.log(`BOOTSTRAP ${result.workstationBootstrap}`)
  }
  const missingRequired = inventory.filter((tool) => tool.required && !tool.installed)
  if (!nodeCompatible) missingRequired.push({ name: 'node@24' })
  if (missingRequired.length && options.strict !== false) throw new Error(`Missing required tools: ${missingRequired.map((tool) => tool.name).join(', ')}`)
  return result
}

async function setup(platformInfo, options) {
  printHeader(platformInfo)
  if (!options.check && !options['dry-run']) {
    migrateState(stateFile, legacyStateFile)
    updateState(stateFile, legacyStateFile, {
      PLATFORM_ID: platformInfo.platformId,
      ARCH: platformInfo.arch,
      SHELL: platformInfo.shell,
      LAST_SETUP_AT: new Date().toISOString(),
    })
  }
  if (options.check) return doctor(platformInfo, { ...options, strict: true })
  installTools(platformInfo, options)
  if (!options['skip-npm'] && !options['dry-run']) run('npm', ['install', '--no-audit', '--no-fund'], { cwd: rootDir, platformInfo })
  if (options['with-mcp'] && !options['dry-run']) generateMcp(platformInfo)
  if (options.auth || options['interactive-login']) authenticateTools(platformInfo, options)
  return doctor(platformInfo, { ...options, install: false, strict: false })
}

async function diagnostics(platformInfo) {
  npmRun('typecheck', platformInfo)
  npmRun('lint', platformInfo)
  console.log('Diagnostics passed.')
}

async function quality(platformInfo, options = {}) {
  const gates = ['typecheck', 'lint', 'test']
  if (!options['skip-security']) gates.push('ci:security')
  if (options.build) gates.push('build')
  for (const gate of gates) npmRun(gate, platformInfo)
  console.log(`Quality gates passed: ${gates.join(', ')}`)
}

function currentVersion() {
  return packageJson().version
}

function syncVersionFiles() {
  const version = currentVersion()
  writeFileSync(versionFile, `${version}\n`, 'utf8')
  const versionState = existsSync(versionJsonFile) ? JSON.parse(readFileSync(versionJsonFile, 'utf8')) : {}
  versionState.app ||= {}
  if (versionState.app.version && versionState.app.version !== version) versionState.app.previousVersion = versionState.app.version
  versionState.app.version = version
  versionState.app.lastUpdated = new Date().toISOString()
  versionState.systemx = { name: 'SFWA-WTL-G1', version, schemaVersion: 1 }
  writeJson(versionJsonFile, versionState)
  if (existsSync(starterPackageFile)) {
    const starter = packageJson(starterPackageFile)
    starter.name = 'sfwa-wtl-g1'
    starter.version = version
    starter.description = 'SFWA-WTL-G1 — Standard Firebase Web App, Wayne Tech Lab Generation 1.'
    writeJson(starterPackageFile, starter)
  }
  return version
}

async function versionCommand(platformInfo, positional, options) {
  const action = positional[0] || 'show'
  if (action === 'show') {
    console.log(currentVersion())
    return
  }
  if (action !== 'bump' || !['patch', 'minor', 'major'].includes(positional[1])) throw new Error('Usage: version bump <patch|minor|major>')
  run('npm', ['version', positional[1], '--no-git-tag-version'], { cwd: rootDir, platformInfo })
  const version = syncVersionFiles()
  if (!options.quiet) console.log(`Version synchronized: ${version}`)
}

function syncCommand(options = {}) {
  const version = currentVersion()
  const versionText = existsSync(versionFile) ? readFileSync(versionFile, 'utf8').trim() : ''
  const versionJson = existsSync(versionJsonFile) ? JSON.parse(readFileSync(versionJsonFile, 'utf8')) : {}
  const versionDrift = versionText !== version || versionJson.app?.version !== version || versionJson.systemx?.version !== version
  const adapterDrift = syncAgentAdapters(rootDir, { check: Boolean(options.check) })
  if (options.check && (versionDrift || adapterDrift.length)) {
    throw new Error(`SYSTEMX drift detected:${versionDrift ? ' version files' : ''}${adapterDrift.length ? ` agent adapters (${adapterDrift.join(', ')})` : ''}`)
  }
  if (!options.check) syncVersionFiles()
  console.log(options.check ? 'SYSTEMX drift check passed.' : 'SYSTEMX surfaces synchronized.')
}

async function audit(platformInfo) {
  run('node', [path.join(systemxDir, 'scripts', 'verify-template-structure.mjs')], { cwd: rootDir, platformInfo })
  run('node', [path.join(systemxDir, 'scripts', 'check-markdown-links.mjs')], { cwd: rootDir, platformInfo })
  syncCommand({ check: true })
  run('npm', ['audit', '--audit-level=high'], { cwd: rootDir, platformInfo })
  console.log('SYSTEMX audit passed.')
}

function copyMarkdown(source, target) {
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) cpSync(path.join(source, entry.name), path.join(target, entry.name))
  }
}

function packetFiles(packetRoot) {
  const files = []
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(target)
      else files.push(path.relative(packetRoot, target).split(path.sep).join('/'))
    }
  }
  walk(packetRoot)
  return files.sort()
}

function findFile(directory, name) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      const nested = findFile(target, name)
      if (nested) return nested
    } else if (entry.name === name) return target
  }
  return null
}

function compressPacket(packetRoot, zipPath, platformInfo) {
  if (platformInfo.windows) {
    run('pwsh.exe', ['-NoLogo', '-NoProfile', '-File', path.join(systemxDir, 'scripts', 'archive.ps1'), '-Action', 'Compress', '-Source', packetRoot, '-Destination', zipPath], { cwd: rootDir, platformInfo })
  } else {
    run('zip', ['-qr', zipPath, path.basename(packetRoot)], { cwd: path.dirname(packetRoot), platformInfo })
  }
}

function extractPacket(zipPath, destination, platformInfo) {
  mkdirSync(destination, { recursive: true })
  if (platformInfo.windows) {
    run('pwsh.exe', ['-NoLogo', '-NoProfile', '-File', path.join(systemxDir, 'scripts', 'archive.ps1'), '-Action', 'Expand', '-Source', zipPath, '-Destination', destination], { cwd: rootDir, platformInfo })
  } else run('unzip', ['-q', '-o', zipPath, '-d', destination], { cwd: rootDir, platformInfo })
}

async function packetCommand(platformInfo, positional, options) {
  const action = positional[0] || 'export'
  if (action === 'import') {
    const zipPath = path.resolve(rootDir, positional[1] || options.file || '')
    if (!existsSync(zipPath)) throw new Error(`Setup packet not found: ${zipPath}`)
    const destination = path.resolve(rootDir, options.output || path.join(systemxDir, 'Setup-Input_MD'))
    extractPacket(zipPath, destination, platformInfo)
    const manifestFile = findFile(destination, 'manifest.json')
    if (!manifestFile) throw new Error('Imported setup packet does not contain manifest.json')
    run('node', [path.join(systemxDir, 'scripts', 'validate-setup-packet.mjs'), path.dirname(manifestFile)], { cwd: rootDir, platformInfo })
    console.log(`Setup packet imported: ${destination}`)
    return
  }
  if (action !== 'export') throw new Error('Usage: packet export|import')
  const state = migrateState(stateFile, legacyStateFile)
  const edition = options.edition || state.EDITION || 'enterprise'
  const stackMode = options.stack || state.STACK_MODE || 'google-firebase'
  const packetType = options.tier || positional[1] || 'core'
  const packetShape = options.shape || 'bundle'
  const outputDir = path.resolve(rootDir, options.output || platformInfo.downloadsDir)
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const packetName = `SFWA-WTL-G1-Setup-${edition}-${platformInfo.platformId}-${packetType}-${stamp}`
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'sfwa-wtl-g1-'))
  const packetRoot = path.join(temporary, packetName)
  try {
    copyMarkdown(path.join(systemxDir, 'Standard-MD-Files'), path.join(packetRoot, 'docs', 'standard'))
    copyMarkdown(path.join(systemxDir, 'Unified-Setup-Process', 'intake'), path.join(packetRoot, 'docs', 'intake'))
    copyMarkdown(path.join(systemxDir, 'Unified-Setup-Process', 'master-plan'), path.join(packetRoot, 'docs', 'master-plan'))
    const manifest = {
      packetVersion: currentVersion(),
      packetType,
      packetShape,
      projectName: 'SFWA-WTL-G1 Setup Packet',
      generatedAt: new Date().toISOString(),
      stackMode,
      edition,
      osTarget: platformInfo.platformId,
      platformId: platformInfo.platformId,
      architecture: platformInfo.arch,
      shell: platformInfo.shell,
      nodeTarget: '24.x',
      agentInstructionStandard: '.SYSTEMX/AI/AGENTS.md',
      agentDiscoveryAdapter: 'AGENTS.md',
      agentCompatibility: ['Codex', 'Claude Code', 'Gemini CLI', 'GitHub Copilot', 'Cursor', 'Windsurf', 'Cline', 'Continue', 'Junie', 'Amazon Q'],
      toolingVersions: { node: '24.x', firebaseTools: firebaseToolsVersion, powershell: '7.x' },
      securityRequirements: ['No secrets in packets', 'Least-privilege local or staging credentials', 'Review generated commands before execution'],
      importTargetFolderName: packetName,
    }
    manifest.includedFiles = packetFiles(packetRoot)
    manifest.requiredDocs = manifest.includedFiles.filter((file) => file.endsWith('.md'))
    manifest.optionalAssets = []
    writeJson(path.join(packetRoot, 'manifest.json'), manifest)
    writeFileSync(path.join(packetRoot, 'README.md'), `# ${packetName}\n\nTarget: ${platformInfo.platformId} using ${platformInfo.shell}.\n\nDo not store secrets in this packet.\n`, 'utf8')
    mkdirSync(outputDir, { recursive: true })
    const zipPath = path.join(outputDir, `${packetName}.zip`)
    if (!options['dry-run']) compressPacket(packetRoot, zipPath, platformInfo)
    updateState(stateFile, legacyStateFile, { PLATFORM_ID: platformInfo.platformId, EDITION: edition, STACK_MODE: stackMode, LAST_PACKET_EXPORT: zipPath })
    console.log(options['dry-run'] ? `[dry-run] setup packet ready: ${packetRoot}` : `Setup packet exported: ${zipPath}`)
  } finally {
    if (!options['keep-temp']) rmSync(temporary, { recursive: true, force: true })
  }
}

function deployTargets(target) {
  const config = JSON.parse(readFileSync(path.join(rootDir, 'firebase.json'), 'utf8'))
  return selectDeployTargets(config, target, { functionsPresent: existsSync(path.join(rootDir, 'functions', 'package.json')) })
}

async function deploy(platformInfo, positional, options) {
  if (options.check) return doctor(platformInfo, { json: options.json, strict: false })
  if (options['rollback-info']) {
    console.log('List Firebase Hosting releases: npx firebase hosting:releases:list --project <project-id>')
    console.log('Roll back in the Firebase console, then run this command again with --preflight.')
    return
  }
  if (options.bump) await versionCommand(platformInfo, ['bump', options.bump], { quiet: true })
  await quality(platformInfo, { 'skip-security': options['skip-security'] || options.fast, build: true })
  if (options.preflight || options['skip-deploy']) {
    console.log('Deployment preflight passed; no deployment was performed.')
    return
  }
  const target = options.target || positional[0] || 'all'
  if (!['all', 'app', 'hosting', 'rules', 'functions'].includes(target)) throw new Error(`Unsupported deploy target: ${target}`)
  const targets = deployTargets(target)
  const args = buildDeployArguments(targets, { project: options.project, dryRun: options['dry-run'] })
  if (options['dry-run']) console.warn('Firebase dry-run performs validation without releasing changes, but the provider may still enable required APIs on the target project.')
  const result = runFirebase(args, platformInfo, { capture: true })
  process.stdout.write(result.stdout)
  const url = result.stdout.match(/https?:\/\/[a-zA-Z0-9_.-]+\.web\.app/)?.[0]
  if (options.open && url) {
    const opener = browserOpenCommand(url, platformInfo)
    run(opener.command, opener.args, { cwd: rootDir, platformInfo, allowFailure: true })
  }
  console.log(`Firebase deployment complete: ${targets.join(',')}`)
}

function parseFirebaseConfig(text) {
  try {
    const parsed = JSON.parse(text)
    return parsed.firebaseConfig || parsed
  } catch {
    const config = {}
    for (const key of ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId', 'databaseURL']) {
      const match = text.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`))
      if (match) config[key] = match[1]
    }
    if (!config.projectId) throw new Error('Firebase configuration must be JSON or a Firebase web config snippet containing projectId')
    return config
  }
}

function configureFirebase(platformInfo, options) {
  if (!options.from) throw new Error('Usage: firebase configure --from <ignored-config-file> [--project <project-id>]')
  const source = path.resolve(rootDir, options.from)
  if (!existsSync(source)) throw new Error(`Firebase configuration source not found: ${source}`)
  const config = parseFirebaseConfig(readFileSync(source, 'utf8'))
  const projectId = options.project || config.projectId
  if (!projectId) throw new Error('Firebase project ID is required')
  const envNames = {
    apiKey: 'VITE_FIREBASE_API_KEY',
    authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
    projectId: 'VITE_FIREBASE_PROJECT_ID',
    storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'VITE_FIREBASE_APP_ID',
    measurementId: 'VITE_FIREBASE_MEASUREMENT_ID',
    databaseURL: 'VITE_FIREBASE_DATABASE_URL',
  }
  const lines = Object.entries(envNames)
    .filter(([key]) => config[key])
    .map(([key, envName]) => `${envName}=${config[key]}`)
  const envFile = path.join(rootDir, '.env.local')
  writeFileSync(envFile, `${lines.join('\n')}\n`, { encoding: 'utf8', mode: 0o600 })
  protectLocalFile(envFile)
  const firebasercFile = path.join(rootDir, '.firebaserc')
  const firebaserc = existsSync(firebasercFile) ? JSON.parse(readFileSync(firebasercFile, 'utf8')) : {}
  firebaserc.projects = { ...(firebaserc.projects || {}), default: projectId }
  writeJson(firebasercFile, firebaserc)
  updateState(stateFile, legacyStateFile, { FIREBASE_PROJECT_ID: projectId, PLATFORM_ID: platformInfo.platformId, LAST_FIREBASE_CONFIG_AT: new Date().toISOString() })
  console.log(`Firebase local configuration written for project ${projectId}. Review .env.local before use; it remains ignored.`)
}

function firebaseCommand(platformInfo, positional, options) {
  const action = positional[0] || 'status'
  if (action === 'configure') return configureFirebase(platformInfo, options)
  if (action === 'status') return runFirebase(['projects:list'], platformInfo, { allowFailure: true })
  if (action === 'login') return runFirebase(['login'], platformInfo)
  throw new Error('Usage: firebase configure|status|login')
}

function generateMcp(platformInfo) {
  const nodeCommand = platformInfo.windows ? 'cmd' : 'npx'
  const wrap = (args) => platformInfo.windows ? ['/c', 'npx', ...args] : args
  const servers = {
    firebase: { command: nodeCommand, args: wrap(['-y', `firebase-tools@${firebaseToolsVersion}`, 'mcp']) },
    'chrome-devtools': { command: nodeCommand, args: wrap(['-y', 'chrome-devtools-mcp@1.6.0', '--slim', '--isolated', '--no-usage-statistics']) },
  }
  writeJson(path.join(rootDir, '.vscode', 'mcp.json'), { servers })
  writeJson(path.join(rootDir, '.mcp.json'), { mcpServers: servers })
  console.log('Generated verified Firebase and Chrome DevTools MCP configuration.')
  console.log('Google Cloud remote MCP and Stripe MCP require explicit provider authentication and are documented but not enabled automatically.')
}

function liveSession() {
  const session = readSession(systemxDir)
  if (!session) return null
  const processes = Array.isArray(session.processes) ? session.processes : []
  return processes.some((entry) => isPidAlive(Number(entry.pid))) ? session : null
}

function startDay(platformInfo, options = {}) {
  const existing = liveSession()
  if (existing && !options.force) {
    console.log(JSON.stringify({ status: 'already-running', session: existing }, null, 2))
    return { status: 'already-running', session: existing }
  }
  if (existing && options.force) stopSession(systemxDir)
  const child = spawn(process.execPath, [lanRunnerFile, options.firebase ? 'firebase' : 'vite'], {
    cwd: rootDir,
    detached: true,
    env: process.env,
    shell: false,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
  updateState(stateFile, legacyStateFile, {
    PLATFORM_ID: platformInfo.platformId,
    LAST_START_DAY_AT: new Date().toISOString(),
  })
  const mode = options.firebase ? 'firebase' : 'vite'
  console.log(`SYSTEMX ${mode} session launching. Run \`npm run wtl:local -- status\` for the owned ports and URLs.`)
  return { status: 'launching', mode, runnerPid: child.pid }
}

function endDay() {
  const result = stopSession(systemxDir)
  console.log(JSON.stringify(result, null, 2))
}

function localCommand(platformInfo, positional, options = {}) {
  const action = positional[0] || 'status'
  if (action === 'start-day' || action === 'start') return startDay(platformInfo, options)
  if (action === 'end-day' || action === 'stop') return endDay()
  if (action === 'status') {
    const session = readSession(systemxDir)
    const processes = session?.processes?.map((entry) => ({ ...entry, running: isPidAlive(Number(entry.pid)) })) || []
    console.log(JSON.stringify({ session, processes }, null, 2))
    return
  }
  throw new Error('Usage: local start-day|end-day|status')
}

function slcUrl() {
  const session = readSession(systemxDir)
  const port = session?.ports?.lan || process.env.SYSTEMX_LAN_PORT || 7331
  return `http://127.0.0.1:${port}/`
}

function slcCommand(platformInfo, positional) {
  const action = positional[0] || 'status'
  if (action === 'status') {
    console.log(JSON.stringify({
      url: slcUrl(),
      session: readSession(systemxDir),
      bridge: existsSync(slcBridgeFile) ? path.relative(rootDir, slcBridgeFile) : null,
    }, null, 2))
    return
  }
  if (action === 'open') {
    const openCommand = browserOpenCommand(slcUrl(), platformInfo)
    run(openCommand.command, openCommand.args, { cwd: rootDir, platformInfo, allowFailure: true })
    console.log(`SLC opened: ${slcUrl()}`)
    return
  }
  if (action === 'bridge') {
    if (!existsSync(slcBridgeFile)) throw new Error('Missing SLC sync bridge CSV.')
    console.log(readFileSync(slcBridgeFile, 'utf8').trim())
    return
  }
  throw new Error('Usage: slc status|open|bridge')
}

const kitRegistry = Object.freeze({
  production: {
    id: 'production',
    name: 'SYSTEMX Production Kit',
    path: '.SYSTEMX/KIT/Production',
    index: '.SYSTEMX/KIT/Production/SYSTEMX-KIT-INDEX.md',
    manifest: '.SYSTEMX/KIT/Production/MANIFEST.json',
    purpose: 'Production brand, media, web, mobile, and document assets.',
  },
  brand: {
    id: 'brand',
    name: 'SYSTEMX Brand Guide Kit',
    path: '.SYSTEMX/KIT/Brand',
    index: '.SYSTEMX/KIT/Brand/SYSTEMX-KIT-INDEX.md',
    manifest: '.SYSTEMX/KIT/Brand/manifest.json',
    purpose: 'Brand-guidelines intake, prompts, scripts, examples, and PDF production flow.',
  },
  'standard-md': {
    id: 'standard-md',
    name: 'SYSTEMX Standard MD Kit',
    path: '.SYSTEMX/KIT/Standard-MD',
    index: '.SYSTEMX/KIT/Standard-MD/SYSTEMX-KIT-INDEX.md',
    manifest: '.SYSTEMX/KIT/Standard-MD/MANIFEST.json',
    purpose: 'Unified catalog for Standard MD, Stock Setup, intake, master-plan, and packet assets.',
  },
})

function resolveKit(id) {
  const kit = kitRegistry[String(id || '').toLowerCase()]
  if (!kit) throw new Error(`Unknown kit: ${id}. Expected ${Object.keys(kitRegistry).join(', ')}`)
  return kit
}

function kitRows() {
  return Object.values(kitRegistry).map((kit) => ({
    ...kit,
    exists: existsSync(path.join(rootDir, kit.path)),
  }))
}

function printKitList(options = {}) {
  const rows = kitRows()
  if (options.json) {
    console.log(JSON.stringify(rows, null, 2))
    return
  }
  for (const kit of rows) {
    console.log(`${kit.id}: ${kit.name}`)
    console.log(`  path: ${kit.path}`)
    console.log(`  purpose: ${kit.purpose}`)
    console.log(`  exists: ${kit.exists ? 'yes' : 'no'}`)
  }
}

function kitCommand(positional, options = {}) {
  const action = positional[0] || 'list'
  if (action === 'list') {
    printKitList(options)
    return
  }
  if (action === 'show') {
    const kit = resolveKit(positional[1] || options.kit || 'standard-md')
    const manifestFile = path.join(rootDir, kit.manifest)
    const indexFile = path.join(rootDir, kit.index)
    const payload = {
      ...kit,
      exists: existsSync(path.join(rootDir, kit.path)),
      manifestExists: existsSync(manifestFile),
      indexExists: existsSync(indexFile),
      manifestData: existsSync(manifestFile) ? readJson(manifestFile) : null,
    }
    if (options.json) console.log(JSON.stringify(payload, null, 2))
    else {
      console.log(payload.name)
      console.log(`Path: ${payload.path}`)
      console.log(`Index: ${payload.index}`)
      console.log(`Manifest: ${payload.manifest}`)
      console.log(`Purpose: ${payload.purpose}`)
    }
    return
  }
  if (action === 'standard-md-order') {
    const manifest = readJson(path.join(kitDir, 'Standard-MD', 'MANIFEST.json'))
    if (options.json) console.log(JSON.stringify(manifest.copyOrder, null, 2))
    else manifest.copyOrder.forEach((file, index) => console.log(`${index + 1}. ${file}`))
    return
  }
  throw new Error('Usage: kit list|show <production|brand|standard-md>|standard-md-order')
}

async function setupPhaseMenu(platformInfo, rl, { production = false } = {}) {
  while (true) {
    printHeader(platformInfo)
    console.log(production ? 'Setup Phase — Start Template into Production' : 'Setup & Tooling Phase')
    console.log('1) Readiness check (OS, Node, CLIs, Firebase)')
    console.log('2) Install/refresh project dependencies and baseline tools')
    console.log('3) Authentication readiness (GitHub, Google Cloud, Firebase)')
    console.log('4) Export a platform-stamped setup packet')
    console.log('5) Show detailed doctor JSON')
    console.log('6) Show setup playbook locations')
    console.log('0) Back')
    const choice = (await rl.question('Setup choice: ')).trim()
    if (choice === '0') return
    if (choice === '1') await doctor(platformInfo, { strict: false })
    else if (choice === '2') await setup(platformInfo, { install: true })
    else if (choice === '3') authenticateTools(platformInfo, {})
    else if (choice === '4') await packetCommand(platformInfo, ['export'], {})
    else if (choice === '5') await doctor(platformInfo, { json: true, strict: false })
    else if (choice === '6') {
      console.log(path.join(systemxDir, 'USER-INGEST-AND-PRODUCTION-SETUP.md'))
      console.log(path.join(systemxDir, 'Unified-Setup-Process', 'README.md'))
      console.log('Complete the setup packet without secrets, then return to this phase to continue.')
    } else console.warn('Invalid setup choice.')
  }
}

async function localSessionMenu(platformInfo, rl) {
  while (true) {
    printHeader(platformInfo)
    console.log('Local Session Control — owned loopback processes only')
    console.log('1) Start public Vite app + SYSTEMX LAN dashboard')
    console.log('2) Start Firebase emulators + SYSTEMX LAN dashboard')
    console.log('3) Show owned ports, PIDs, and session status')
    console.log('4) Stop this repository\'s owned local session')
    console.log('0) Back')
    const choice = (await rl.question('Local session choice: ')).trim()
    if (choice === '0') return
    if (choice === '1') startDay(platformInfo)
    else if (choice === '2') startDay(platformInfo, { firebase: true })
    else if (choice === '3') localCommand(platformInfo, ['status'])
    else if (choice === '4') endDay()
    else console.warn('Invalid local session choice.')
  }
}

async function menu(platformInfo, options = {}) {
  const rl = createInterface({ input, output })
  try {
    if (options['setup-phase']) {
      await setupPhaseMenu(platformInfo, rl, { production: true })
      return
    }
    while (true) {
      printHeader(platformInfo)
      console.log('1) Start Template into Production')
      console.log('2) Setup & Tooling')
      console.log('3) Deploy')
      console.log('4) Quality Checks')
      console.log('5) Version')
      console.log('6) Firebase')
      console.log('7) Git')
      console.log('8) Dev & App')
      console.log('9) Project Info')
      console.log('10) System')
      console.log('11) Update')
      console.log('12) Local Session Control (Start of Day)')
      console.log('13) End of Day Local Session')
      console.log('14) SYSTEMX KIT Catalog')
      console.log('15) SLC .SYSTEMX Local Control')
      console.log('0) Exit')
      const choice = (await rl.question('Choose: ')).trim()
      if (choice === '0') return
      if (choice === '1') await setupPhaseMenu(platformInfo, rl, { production: true })
      else if (choice === '2') await setupPhaseMenu(platformInfo, rl)
      else if (choice === '3') await deploy(platformInfo, [], { preflight: true })
      else if (choice === '4') await quality(platformInfo, { build: true })
      else if (choice === '5') console.log(`Current version: ${currentVersion()}`)
      else if (choice === '6') runFirebase(['projects:list'], platformInfo, { allowFailure: true })
      else if (choice === '7') run('git', ['status', '-sb'], { cwd: rootDir, platformInfo })
      else if (choice === '8') run('npm', ['run', 'dev'], { cwd: rootDir, platformInfo, allowFailure: true })
      else if (choice === '9') await doctor(platformInfo, { strict: false })
      else if (choice === '10') await audit(platformInfo)
      else if (choice === '11') {
        run('npm', ['update'], { cwd: rootDir, platformInfo })
        await quality(platformInfo, { build: true })
      } else if (choice === '12') await localSessionMenu(platformInfo, rl)
      else if (choice === '13') endDay()
      else if (choice === '14') kitCommand(['list'])
      else if (choice === '15') slcCommand(platformInfo, ['open'])
      else console.warn('Invalid choice.')
    }
  } finally { rl.close() }
}

function installHooks(platformInfo) {
  run('git', ['config', 'core.hooksPath', '.SYSTEMX/hooks'], { cwd: rootDir, platformInfo })
  console.log('Git hooks configured through core.hooksPath=.SYSTEMX/hooks')
}

function showLogs() {
  const file = path.join(logDir, 'operations.jsonl')
  if (!existsSync(file)) return console.log('No SYSTEMX operation logs yet.')
  const lines = readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(-20)
  console.log(lines.join('\n'))
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? fallback), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function emitBusMessages(messages, options = {}) {
  const limit = Math.max(1, parseInteger(options.limit, 20))
  const view = options.all ? messages : messages.slice(-limit)
  if (options.json) {
    console.log(JSON.stringify(view, null, 2))
    return
  }
  if (!view.length) {
    console.log('No matching bus messages.')
    return
  }
  for (const message of view) {
    console.log(`[${message.timestamp}] ${message.missionId}/${message.waveId} lane=${message.lane} sender=${message.sender} event=${message.eventType} status=${message.status}`)
    console.log(`  scope: ${message.scope}`)
    console.log(`  files: ${(message.files || []).join(', ') || 'none'}`)
    console.log(`  blockers: ${message.blockers || 'none'}`)
    console.log(`  next: ${message.nextAction || 'none'}`)
  }
}

function busCommand(positional, options, runId) {
  const action = positional[0] || 'show'
  if (action === 'post') {
    const message = appendBusMessage(systemxDir, {
      runId,
      missionId: options.mission,
      waveId: options.wave,
      lane: options.lane,
      sender: options.sender,
      eventType: options.event || options.eventType,
      status: options.status,
      scope: options.scope,
      files: options.files,
      evidence: options.evidence,
      blockers: options.blockers,
      nextAction: options['next-action'] || options.nextAction,
    })
    console.log(options.json ? JSON.stringify(message, null, 2) : `Bus message recorded: ${message.missionId}/${message.waveId} ${message.lane} ${message.eventType}`)
    return
  }
  if (action === 'show' || action === 'tail') {
    const messages = readBusMessages(systemxDir, {
      missionId: options.mission,
      waveId: options.wave,
      lane: options.lane,
      sender: options.sender,
      eventType: options.event || options.eventType,
    })
    emitBusMessages(messages, { ...options, limit: action === 'tail' ? options.limit || 10 : options.limit || 20 })
    return
  }
  if (action === 'summary') {
    const messages = readBusMessages(systemxDir, {
      missionId: options.mission,
      waveId: options.wave,
      lane: options.lane,
    })
    const summary = summarizeBus(messages, {
      now: options.now,
      quietThresholdMs: parseInteger(options['quiet-minutes'], 30) * 60 * 1000,
    })
    console.log(JSON.stringify(summary, null, 2))
    return
  }
  if (action === 'archive') {
    const result = archiveBusWave(systemxDir, { missionId: options.mission, waveId: options.wave }, {
      now: options.now,
      timestamp: options.date,
      archivedAt: new Date().toISOString(),
      quietThresholdMs: parseInteger(options['quiet-minutes'], 30) * 60 * 1000,
    })
    console.log(JSON.stringify(result, null, 2))
    return
  }
  if (action === 'paths') {
    console.log(JSON.stringify(busDir, null, 2))
    return
  }
  throw new Error('Usage: bus post|show|tail|summary|archive|paths')
}

function help() {
  console.log(`SFWA-WTL-G1 shared SYSTEMX CLI

Usage: node .SYSTEMX/cli/systemx.mjs <command> [options]

Commands:
  menu [--setup-phase]         Interactive lifecycle menu or direct setup phase
  setup [--check|--install]    Bootstrap or verify tools
  doctor [--json]              Platform, SDK, and CLI health
  diagnostics                  TypeScript and ESLint checks
  quality [--build]            Quality and security gates
  deploy [target]              Firebase deploy; supports --preflight and --dry-run
  packet export|import          Cross-platform setup packets
  kit list|show|standard-md-order
                               SYSTEMX KIT catalog and Standard MD routing
  version show|bump <kind>      Semantic version management
  sync [--check]               Version and agent-adapter drift
  bus post|show|tail|summary|archive|paths
                               Agent coordination bus and wave archiving
  audit                        Structure, docs, drift, and dependency audit
  mcp generate                 Verified opt-in MCP config
  firebase configure|status   Safe Firebase local configuration and status
  hooks install                Configure repository Git hooks
  logs                         Show recent sanitized operation logs
  local start-day|end-day|status
                               Manage owned local dev server sessions
  slc status|open|bridge        .SYSTEMX Local Control screen and CSV bridge
  platform [--json]            Show detected platform contract

Global: --platform auto|macos-arm64|macos-x64|windows-x64|windows-arm64|
                   ubuntu-x64|ubuntu-arm64|wsl2-x64|wsl2-arm64|
                   debian-x64|debian-arm64|linux-x64|linux-arm64
`)
}

async function main() {
  process.chdir(rootDir)
  const command = process.argv[2] || 'help'
  const { options, positional } = parseArguments(process.argv.slice(3))
  const platformInfo = detectPlatform({ override: options.platform || 'auto' })
  const runId = createRunId()
  const startedAt = Date.now()
  let result = 'success'
  let exitCode = 0
  try {
    if (['help', '--help', '-h'].includes(command)) help()
    else if (command === 'menu' && (options.help || options.h)) help()
    else if (command === 'menu') await menu(platformInfo, options)
    else if (command === 'setup') await setup(platformInfo, options)
    else if (command === 'doctor') await doctor(platformInfo, { ...options, strict: options.strict !== 'false' })
    else if (command === 'diagnostics') await diagnostics(platformInfo)
    else if (command === 'quality') await quality(platformInfo, options)
    else if (command === 'deploy') await deploy(platformInfo, positional, options)
    else if (command === 'packet') await packetCommand(platformInfo, positional, options)
    else if (command === 'kit') kitCommand(positional, options)
    else if (command === 'version') await versionCommand(platformInfo, positional, options)
    else if (command === 'sync') syncCommand(options)
    else if (command === 'audit') await audit(platformInfo)
    else if (command === 'bus') busCommand(positional, options, runId)
    else if (command === 'mcp' && positional[0] === 'generate') generateMcp(platformInfo)
    else if (command === 'firebase') firebaseCommand(platformInfo, positional, options)
    else if (command === 'hooks' && positional[0] === 'install') installHooks(platformInfo)
    else if (command === 'logs') showLogs()
    else if (command === 'local') localCommand(platformInfo, positional, options)
    else if (command === 'slc') slcCommand(platformInfo, positional)
    else if (command === 'platform') console.log(options.json ? JSON.stringify(platformInfo, null, 2) : platformInfo.platformId)
    else throw new Error(`Unknown command: ${command}`)
  } catch (error) {
    result = 'failure'
    exitCode = 1
    console.error(`ERROR: ${error.message}`)
  } finally {
    writeOperationalLog(logDir, {
      runId,
      command,
      args: process.argv.slice(3),
      platformId: platformInfo.platformId,
      architecture: platformInfo.arch,
      shell: platformInfo.shell,
      systemxVersion: currentVersion(),
      result,
      exitCode,
      durationMs: Date.now() - startedAt,
    })
  }
  process.exitCode = exitCode
}

await main()
