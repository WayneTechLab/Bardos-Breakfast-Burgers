import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { fullMenuItems, fullMenuCategories } from '../src/data/fullMenu.ts'
import { spanish } from '../src/i18n/spanish.ts'

const base = process.env.BARDOS_TEST_URL || 'http://127.0.0.1:5173'
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
const output = '.SYSTEMX/LAN/Temp/language'
await mkdir(output, { recursive: true })
for (const value of [...fullMenuCategories.map(c => c.name), ...fullMenuItems.flatMap(i => [i.displayName, i.variantLabel, i.sourceDescriptionExact])].filter(Boolean)) {
  assert.ok(Object.hasOwn(spanish, value), 'Missing Spanish menu text: ' + value)
}
const browser = await chromium.launch()
const report = { checks: [], errors: [] }
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('pageerror', error => report.errors.push(error.message))
  async function ready() {
    await page.locator('main h1').waitFor()
    await page.evaluate(() => document.fonts.ready)
  }
  async function choose(value) {
    if (!(await page.locator('#site-language').count())) await page.locator('.corner-bottom > button').click()
    await page.locator('#site-language').selectOption(value)
    await page.waitForFunction(locale => document.documentElement.lang === locale, value)
  }
  await page.goto(base + '/services')
  await ready()
  await page.locator('[data-menu-sku]').last().waitFor()
  const baseline = await page.locator('[data-menu-sku]').evaluateAll(items => items.map(el => [el.dataset.menuSku, el.querySelector('strong').textContent]))
  await page.setViewportSize({ width: 1255, height: 1114 })
  const placement = await page.locator('.corner-left > button').boundingBox()
  const initialHeader = await page.locator('.site-header').boundingBox()
  assert.equal(placement.y - initialHeader.y - initialHeader.height, 100)
  assert.equal(await page.locator('.corner-left').evaluate(el => el.closest('header') === null), true)
  await page.screenshot({ path: `${output}/corner-placement-1255.png` })
  await page.evaluate(() => window.scrollTo(0, 1000))
  assert.equal((await page.locator('.corner-left > button').boundingBox()).y, placement.y)
  await page.locator('.corner-left > button').click()
  await page.locator('#corner-sections').waitFor()
  await page.locator('.menu-category h3').first().click()
  assert.equal(await page.locator('#corner-sections').count(), 0, 'Outside click closes the detached panel')
  await page.goto(base + '/services')
  await page.setViewportSize({ width: 1440, height: 960 })
  report.checks.push('Detached section control sits 100px below header at 1255x1114, remains fixed during scroll, and dismisses on outside click')
  await choose('es')
  await page.getByRole('heading', { name: 'Menú completo', exact: true }).waitFor()
  assert.equal(await page.locator('#site-language').evaluate(el => el === document.activeElement), true)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.corner-bottom > button').evaluate(el => el === document.activeElement), true)
  assert.equal(await page.locator('[data-menu-sku]:visible').count(), 141)
  assert.deepEqual(await page.locator('[data-menu-sku]').evaluateAll(items => items.map(el => [el.dataset.menuSku, el.querySelector('strong').textContent])), baseline)
  await page.getByLabel('Buscar en el menú completo').fill('hamburguesa')
  assert.ok(await page.locator('[data-menu-sku]:visible').count() >= 15)
  await page.getByLabel('Buscar en el menú completo').fill('jalapeno')
  assert.equal(await page.locator('[data-menu-sku]:visible').count(), 1)
  await page.getByLabel('Borrar búsqueda').click()
  await page.getByLabel('Ir a una sección del menú').selectOption('burgers')
  assert.equal(new URL(page.url()).hash, '#burgers')
  assert.ok(Math.abs(await page.locator('#burgers').evaluate(el => el.getBoundingClientRect().top) - 148) < 4)
  await page.getByRole('button', { name: 'En esta página', exact: true }).click()
  await page.getByRole('navigation', { name: 'En esta página' }).getByRole('link', { name: 'Almuerzo', exact: true }).click()
  assert.equal(new URL(page.url()).hash, '#lunch')
  await choose('en')
  await page.keyboard.press('Escape')
  assert.equal(new URL(page.url()).hash, '#lunch')
  await page.getByRole('button', { name: 'On this page', exact: true }).click()
  await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Lunch', exact: true }).waitFor()
  await page.keyboard.press('Escape')
  await choose('es')
  await page.reload()
  await page.getByRole('heading', { name: 'Menú completo', exact: true }).waitFor()
  assert.equal(await page.evaluate(() => localStorage.getItem('bardos.language')), 'es')
  report.checks.push('Complete menu catalog; unchanged 141 SKUs/prices; accent-insensitive Spanish search; stable anchors; Escape/focus; reload persistence')

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/services')
    await ready()
    const layout = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect()
      const logo = rect('.header-logo'), section = rect('.corner-left > button'), title = rect('.site-brand'), hamburger = rect('.corner-right > button')
      return {
        logoLoaded: document.querySelector('.header-logo img').naturalWidth > 0,
        detached: document.querySelector('.corner-left').closest('header') === null && Math.abs(section.top-rect('.site-header').bottom-100) < 1,
        clearOfContent: ![...document.querySelectorAll('main a, main button, main input, main select')].some(el => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && r.height > 0 && r.left < section.right && r.right > section.left && r.top < section.bottom && r.bottom > section.top
        }),
        separated: logo.right < title.left && title.right < hamburger.left,
        overflow: document.documentElement.scrollWidth > innerWidth+1,
        priceOverlap: [...document.querySelectorAll('.menu-item-line')].some(el => el.querySelector('h4').getBoundingClientRect().right > el.querySelector('strong').getBoundingClientRect().left-4),
      }
    })
    assert.deepEqual(layout, { logoLoaded: true, detached: true, clearOfContent: true, separated: true, overflow: false, priceOverlap: false }, String(width))
    await choose('es')
    const ax = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(ax.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], 'Spanish accessibility at ' + width)
    const panel = await page.locator('#corner-controls').boundingBox()
    assert.ok(panel.x >= 0 && panel.y >= 0 && panel.x+panel.width <= width+1 && panel.y+panel.height <= 900)
    await page.screenshot({ path: `${output}/spanish-menu-settings-${width}.png` })
    await page.keyboard.press('Escape')
    await page.locator('.corner-left > button').click()
    if (width <= 700) {
      const sectionPanel = await page.locator('#corner-sections').boundingBox()
      const bottomBar = await page.locator('.corner-bottom').boundingBox()
      assert.ok(sectionPanel.y+sectionPanel.height <= bottomBar.y-8, 'Section panel must clear the mobile controls')
      await page.locator('#corner-sections a').last().scrollIntoViewIfNeeded()
      assert.equal(await page.locator('#corner-sections a').last().isVisible(), true)
    }
    await page.screenshot({ path: `${output}/spanish-sections-${width}.png` })
    await page.keyboard.press('Escape')
    report.checks.push('Layout, loaded logo, Spanish prices, panels and accessibility: ' + width)
  }

  for (const [path, heading] of [['/', 'Desayunos y hamburguesas'], ['/about', 'Acerca de Bardo’s'], ['/docs', 'Pedidos y ayuda'], ['/contact', 'Habla con el equipo.'], ['/login', 'Bienvenido de nuevo'], ['/missing', 'Página no encontrada']]) {
    await page.goto(base + path)
    await page.getByRole('heading', { name: heading, exact: true }).waitFor()
    await ready()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+1), false, path)
    const ax = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(ax.violations.map(v => v.id), [], path)
  }
  await page.setViewportSize({ width: 390, height: 568 })
  await choose('es')
  const shortPanel = await page.locator('#corner-controls').boundingBox()
  const header = await page.locator('.site-header').boundingBox()
  const controls = await page.locator('.corner-bottom').boundingBox()
  assert.ok(shortPanel.y >= header.y+header.height && shortPanel.y+shortPanel.height < controls.y)
  await page.screenshot({ path: `${output}/short-mobile-settings.png` })
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 320, height: 900 })
  const other = await context.newPage()
  await other.goto(base + '/about')
  await other.getByRole('heading', { name: 'Acerca de Bardo’s', exact: true }).waitFor()
  await choose('en')
  await other.getByRole('heading', { name: "About Bardo's", exact: true }).waitFor()
  await other.close()
  report.checks.push('Spanish public routes and cross-tab language synchronization')

  await page.goto(base + '/login')
  await page.getByLabel('Email', { exact: true }).fill('owner@bardos.local')
  await page.getByLabel('Password', { exact: true }).fill('BardosLocal!2026')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'Your account' }).waitFor()
  await page.goto(base + '/manage/pos')
  await page.locator('.pos-item:not([disabled])').first().click()
  const cart = await page.locator('.cart-line').allTextContents()
  await choose('es')
  assert.deepEqual(await page.locator('.cart-line').allTextContents(), cart, 'Language change must not remount the POS or clear the basket')
  assert.equal(await page.locator('.header-logo').isVisible(), true)
  report.checks.push('Staff header works; switching language preserves an unsaved POS basket; no order submitted')

  await page.goto(base + '/services')
  await page.getByLabel('Buscar en el menú completo').fill('no-such-item')
  await page.emulateMedia({ media: 'print' })
  assert.equal(await page.locator('[data-menu-sku]:visible').count(), 141)
  assert.equal(await page.locator('.header-logo').isVisible(), false)
  assert.equal(await page.locator('.corner-left > button').isVisible(), false)
  await page.emulateMedia({ media: 'screen' })
  const restricted = await browser.newContext()
  await restricted.addInitScript(() => { Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new DOMException('Blocked', 'SecurityError') } }); Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new DOMException('Blocked', 'SecurityError') } }) })
  const restrictedPage = await restricted.newPage()
  await restrictedPage.goto(base + '/services')
  await restrictedPage.locator('.corner-bottom > button').click()
  await restrictedPage.locator('#site-language').selectOption('es')
  await restrictedPage.getByRole('heading', { name: 'Menú completo', exact: true }).waitFor()
  await restricted.close()
  report.checks.push('Spanish print retains all 141 items; storage-denied browser still switches language')
  assert.deepEqual(report.errors, [])
  console.log('PASS: ' + report.checks.join('; '))
} finally {
  await writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
