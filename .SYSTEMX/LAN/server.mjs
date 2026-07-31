#!/usr/bin/env node

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const lanRoot = fileURLToPath(new URL('.', import.meta.url))
const websiteRoot = join(lanRoot, 'Website')
const dashboardFile = join(lanRoot, 'Website_Dashboard.html')
const host = '127.0.0.1'
const port = Number.parseInt(process.env.SYSTEMX_LAN_PORT ?? '7331', 10)

if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('Invalid SYSTEMX_LAN_PORT')
}

const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`])
const allowedOrigins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`])
const allowedExtensions = new Set(['.html', '.css', '.csv', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff2'])
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function applySecurityHeaders(response) {
  response.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; '))
  response.setHeader('Cache-Control', 'no-store, max-age=0')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'no-referrer')
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
}

function sendJson(response, statusCode, value) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(`${JSON.stringify(value)}\n`)
}

function sendText(response, statusCode, text) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end(`${text}\n`)
}

function resolvePublicFile(pathname) {
  if (pathname === '/' || pathname === '/Website_Dashboard.html') return dashboardFile
  if (!pathname.startsWith('/Website/')) return null

  let relativePath
  try {
    relativePath = decodeURIComponent(pathname.slice('/Website/'.length))
  } catch {
    return null
  }

  if (!relativePath || relativePath.split('/').some((segment) => segment.startsWith('.'))) return null

  const candidate = resolve(websiteRoot, relativePath)
  if (candidate !== websiteRoot && !candidate.startsWith(`${websiteRoot}${sep}`)) return null
  if (!allowedExtensions.has(extname(candidate).toLowerCase())) return null
  return candidate
}

const server = createServer((request, response) => {
  applySecurityHeaders(response)

  const requestHost = request.headers.host
  if (requestHost && !allowedHosts.has(requestHost)) {
    sendText(response, 403, 'Forbidden host')
    return
  }

  const origin = request.headers.origin
  if (origin && !allowedOrigins.has(origin)) {
    sendText(response, 403, 'Forbidden origin')
    return
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendText(response, 405, 'Method not allowed')
    return
  }

  const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`)
  if (requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { status: 'online', mode: 'local-only', host, port })
    return
  }

  const file = resolvePublicFile(requestUrl.pathname)
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    sendText(response, 404, 'Not found')
    return
  }

  const extension = extname(file).toLowerCase()
  response.statusCode = 200
  response.setHeader('Content-Type', mimeTypes[extension] ?? 'application/octet-stream')
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(file).pipe(response)
})

server.listen(port, host, () => {
  console.log(`[SYSTEMX LAN] http://${host}:${port}`)
  console.log('[SYSTEMX LAN] Loopback-only local development server')
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
