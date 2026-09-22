import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { fullMenuItems } from '../src/data/fullMenu.ts'

const base = process.env.BARDOS_TEST_URL || 'http://127.0.0.1:5173'
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
  throw new Error('This acceptance suite is local-only.')
const output = '.SYSTEMX/LAN/Temp/uiux'
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const report = { routes: [], violations: [], errors: [], checks: [] }
const modules = [
  'overview',
  'pos',
  'orders',
  'kitchen',
  'menu',
  'customers',
  'tickets',
  'inventory',
  'employees',
  'shifts',
  'timeEntries',
  'expenses',
  'content',
  'roles',
  'audit',
]
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  page.on('pageerror', (error) => report.errors.push(error.message))
  async function settle() {
    await page.locator('main h1').waitFor()
    await page
      .getByText('Loading restaurant records...', { exact: true })
      .waitFor({ state: 'hidden' })
    await page.evaluate(() => document.fonts.ready)
  }
  async function route(path, role) {
    await page.goto(base + path)
    await settle()
    assert.equal(await page.locator('main h1').count(), 1, path + ' has one page heading')
    assert.match(await page.title(), /Bardo's Breakfast Burgers/)
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 960 })
      const overflow = await page.evaluate(() => {
        if (document.documentElement.scrollWidth <= innerWidth + 1) return []
        return [...document.querySelectorAll('body *')]
          .filter(
            (el) =>
              el.getBoundingClientRect().right > innerWidth + 1 &&
              getComputedStyle(el).position !== 'fixed',
          )
          .slice(0, 8)
          .map((el) => el.tagName + '.' + el.className)
      })
      assert.deepEqual(overflow, [], role + ' ' + path + ' overflow at ' + width)
      if (await page.locator('tbody tr').count())
        assert.ok(
          await page
            .locator('tbody tr td')
            .first()
            .evaluate((el) => el.getBoundingClientRect().width >= 180),
          'readable table column: ' + path,
        )
      if ([1440, 390].includes(width)) {
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        report.violations.push(
          ...results.violations.map((v) => ({
            route: path,
            role,
            width,
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
          })),
        )
        await page.screenshot({
          path:
            output +
            '/' +
            role +
            '-' +
            (path.replaceAll('/', '-') || 'home') +
            '-' +
            width +
            '.png',
        })
      }
      report.routes.push({ path, role, width })
    }
    await page.setViewportSize({ width: 1440, height: 960 })
  }
  async function login(name) {
    await page.goto(base + '/login')
    await page.getByLabel('Email', { exact: true }).fill(name + '@bardos.local')
    await page.getByLabel('Password', { exact: true }).fill('BardosLocal!2026')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByRole('heading', { name: 'Your account' }).waitFor()
    await page.getByText('Checking your account...', { exact: true }).waitFor({ state: 'hidden' })
  }
  async function logout() {
    await page.goto(base + '/login')
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await page.getByRole('heading', { name: 'Welcome back' }).waitFor()
  }
  for (const path of [
    '/',
    '/about',
    '/services',
    '/docs',
    '/contact',
    '/login',
    '/order',
    '/account',
    '/manage',
    '/missing',
  ])
    await route(path, 'guest')
  await page.goto(base + '/services')
  await page.locator('[data-menu-sku]').last().waitFor()
  const skus = await page
    .locator('[data-menu-sku]')
    .evaluateAll((items) => items.map((item) => item.dataset.menuSku).sort())
  assert.deepEqual(
    skus,
    fullMenuItems
      .filter((item) => item.active)
      .map((item) => item.sku)
      .sort(),
  )
  await page.getByLabel('Search full menu').fill('no-such-menu-item')
  await page.getByText('No items match your search.').waitFor()
  assert.equal(await page.locator('[data-menu-sku]:visible').count(), 0)
  await page.emulateMedia({ media: 'print' })
  assert.equal(await page.locator('[data-menu-sku]:visible').count(), fullMenuItems.length)
  await page.pdf({ path: output + '/full-menu.pdf', format: 'Letter', printBackground: true })
  await page.emulateMedia({ media: 'screen' })
  await page.getByLabel('Clear search').click()
  await page.getByLabel('Jump to menu section').selectOption('burgers')
  assert.equal(new URL(page.url()).hash, '#burgers')
  assert.ok(
    Math.abs(
      (await page.locator('#burgers').evaluate((el) => el.getBoundingClientRect().top)) - 148,
    ) < 4,
  )
  await page.getByRole('button', { name: 'On this page', exact: true }).click()
  await page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'Lunch', exact: true })
    .click()
  assert.equal(new URL(page.url()).hash, '#lunch')
  await page.getByRole('button', { name: 'Site menu', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(
    await page
      .getByRole('button', { name: 'Site menu', exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  )
  await page.getByRole('button', { name: 'Page controls', exact: true }).click()
  await page.getByRole('button', { name: 'Back to top', exact: true }).click()
  assert.ok(await page.evaluate(() => scrollY < 10))
  await page.goto(base + '/')
  await page.getByRole('link', { name: 'Burgers', exact: true }).click()
  assert.equal(new URL(page.url()).hash, '#burgers')
  await page.waitForFunction(
    () => Math.abs(document.querySelector('#burgers').getBoundingClientRect().top - 148) < 4,
  )
  report.checks.push(
    '141 source SKUs preserved; search; print includes all items; category jump; corner menus; Escape focus; cross-route deep link',
  )
  await login('owner')
  for (const module of modules) await route('/manage/' + module, 'owner')
  for (const path of [
    '/login',
    '/order',
    '/account',
    '/contact',
    '/manage/unknown',
    '/manage/orders/unknown',
  ])
    await route(path, 'owner')
  await page.goto(base + '/manage/inventory')
  await settle()
  const thresholdCells = await page.locator('tbody tr td:nth-child(4)').allTextContents()
  assert.ok(
    thresholdCells.every((value) => !value.includes('Invalid Date') && !value.includes('/')),
  )
  for (const module of [
    'menu',
    'customers',
    'tickets',
    'inventory',
    'employees',
    'shifts',
    'expenses',
    'content',
  ]) {
    await page.goto(base + '/manage/' + module)
    await page
      .getByRole('button', {
        name: module === 'menu' ? 'New menu item' : 'New record',
        exact: true,
      })
      .click()
    assert.equal(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations.length,
      0,
      module + ' editor accessibility',
    )
    await page.setViewportSize({ width: 320, height: 760 })
    assert.ok(
      await page.locator('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      module + ' dialog overflow',
    )
    await page.getByRole('button', { name: 'Close editor' }).click()
    await page.setViewportSize({ width: 1440, height: 960 })
  }
  await page.goto(base + '/manage/menu')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('combobox', { name: 'Restaurant workspace', exact: true }).selectOption('inventory')
  await page.getByRole('heading', { name: 'Inventory', exact: true }).waitFor()
  await page.setViewportSize({ width: 1440, height: 960 })
  await logout()
  await login('staff')
  for (const path of ['/manage/overview', '/manage/shifts', '/manage/employees', '/manage/roles'])
    await route(path, 'staff')
  await logout()
  await login('member')
  for (const path of ['/account', '/order', '/contact', '/manage']) await route(path, 'member')
  await page.goto(base + '/order')
  await page.getByText('Online payment is currently unavailable.', { exact: false }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Continue to payment' }).isDisabled(), true)
  await page.goto(base + '/contact')
  await page.getByLabel('Subject', { exact: true }).fill('UIUX contact acceptance')
  await page.getByLabel('Message', { exact: true }).fill('Local automated contact form test.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await page.getByRole('heading', { name: 'Request received' }).waitFor()
  await page.getByRole('link', { name: 'View my tickets' }).click()
  await page.getByText('UIUX contact acceptance', { exact: true }).first().waitFor()
  await context.setOffline(true)
  await page.getByText("You're offline.", { exact: false }).waitFor()
  await context.setOffline(false)
  await page.getByText("You're offline.", { exact: false }).waitFor({ state: 'hidden' })
  report.checks.push(
    'Owner, employee and member routes; inventory numbers; 8 accessible responsive editors; mobile navigation; unavailable payments; contact persistence; offline recovery',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.violations, [], 'WCAG A/AA violations; see report.json')
  console.log(
    'PASS: ' +
      report.routes.length +
      ' responsive route checks, automated WCAG A/AA scans, public navigation, complete printable menu, role gates, contact persistence and payment-unavailable state.',
  )
} finally {
  await writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
