import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { fullMenuItems, fullMenuCategories } from '../src/data/fullMenu.ts'

const base = process.env.BARDOS_TEST_URL || 'http://127.0.0.1:5173'
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
  throw new Error('Brand acceptance is local-only.')
const output = '.SYSTEMX/LAN/Temp/brand'
await mkdir(output, { recursive: true })
assert.equal(
  createHash('sha256').update(await readFile('public/assets/bardos-logo.png')).digest('hex'),
  '90641c3e85d6af575547de9c7bcf29e1c9e3c239632f9361a27f1ce6f93af546',
  'Approved master logo must remain unchanged',
)
const browser = await chromium.launch()
const report = { checks: [], browserErrors: [] }
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('pageerror', (e) => report.browserErrors.push(e.message))
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/services')
    await page.locator('[data-menu-sku]').last().waitFor()
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('[data-menu-sku]:visible').count(), fullMenuItems.length)
    assert.equal(await page.locator('.menu-category').count(), fullMenuCategories.length)
    const styles = await page.evaluate(() => {
      const css = (selector) => getComputedStyle(document.querySelector(selector))
      return {
        heading: css('.menu-category h3').fontFamily,
        name: css('.menu-item-line h4').fontFamily,
        nameColor: css('.menu-item-line h4').color,
        nameCase: css('.menu-item-line h4').textTransform,
        price: css('.menu-item-line strong').fontFamily,
        priceColor: css('.menu-item-line strong').color,
        description: css('.menu-description').fontFamily,
        paper: css('.menu-print-surface').backgroundImage,
        fonts: [...document.fonts].filter((font) => font.status === 'loaded').map((font) => font.family),
        overlap: [...document.querySelectorAll('.menu-item-line')].some((line) => {
          const name = line.querySelector('h4').getBoundingClientRect()
          const price = line.querySelector('strong').getBoundingClientRect()
          return name.right > price.left - 4
        }),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }
    })
    assert.match(styles.heading, /Roboto Slab/)
    assert.match(styles.name, /Montserrat/)
    assert.match(styles.price, /Montserrat/)
    assert.match(styles.description, /Source Sans 3/)
    assert.equal(styles.nameColor, 'rgb(139, 0, 0)')
    assert.equal(styles.priceColor, 'rgb(17, 17, 17)')
    assert.equal(styles.nameCase, 'uppercase')
    assert.match(styles.paper, /menu-paper-v1\.png/)
    assert.equal(styles.fonts.length, 3, 'All three self-hosted font families loaded')
    assert.equal(styles.overlap, false, 'Names and prices must not overlap')
    assert.equal(styles.overflow, false)
    await page.screenshot({ path: `${output}/menu-${width}.png` })
    await page.getByLabel('Jump to menu section').selectOption('burgers')
    await page.waitForFunction(() => document.querySelector('.corner-current')?.textContent === 'Burgers')
    await page.screenshot({ path: `${output}/burgers-${width}.png` })
    report.checks.push({ width, styles })
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(base + '/')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${output}/home-desktop.png` })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${output}/home-mobile.png` })
  await page.goto(base + '/services')
  await page.getByLabel('Search full menu').fill('not-an-item')
  await page.emulateMedia({ media: 'print' })
  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.locator('[data-menu-sku]:visible').count(), fullMenuItems.length)
  assert.equal(
    await page.locator('.menu-item-line h4').first().evaluate((el) => getComputedStyle(el).color),
    'rgb(139, 0, 0)',
    'Print and screen share brand colors',
  )
  await page.pdf({ path: `${output}/full-menu.pdf`, format: 'Letter', printBackground: true })
  assert.deepEqual(report.browserErrors, [])
  console.log('PASS: approved logo checksum, live brand fonts/colors, 141 items in 16 sections at four widths, no price overlap, and shared print theme.')
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  await browser.close()
}
