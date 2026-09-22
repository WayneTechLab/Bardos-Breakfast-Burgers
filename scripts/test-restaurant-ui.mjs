import { chromium } from 'playwright'
import assert from 'node:assert/strict'
const browser = await chromium.launch()
const base = 'http://127.0.0.1:5173'
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${base}/manage`)
  await page.getByRole('heading', { name: 'Sign in to continue' }).waitFor()
  await page.evaluate(() => localStorage.setItem('wsg.demo.accountLevel', '5'))
  await page.goto(`${base}/manage?level=5`)
  await page.getByRole('heading', { name: 'Sign in to continue' }).waitFor()
  async function login(name) {
    await page.goto(`${base}/login`)
    await page.getByLabel('Email', { exact: true }).fill(`${name}@bardos.local`)
    await page.getByLabel('Password', { exact: true }).fill('BardosLocal!2026')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByRole('heading', { name: 'Your account' }).waitFor()
    await page
      .getByText(`Level ${name === 'owner' ? 5 : name === 'staff' ? 4 : 1} ·`, { exact: false })
      .first()
      .waitFor()
  }
  await login('owner')
  await page.goto(`${base}/manage/pos`)
  await page.getByRole('button', { name: 'Cheese & Onion Hash Browns', exact: false }).click()
  await page.getByLabel('Customer name').fill('Browser Acceptance Order')
  await page.getByLabel('Payment', { exact: true }).selectOption('simulation')
  await page.getByRole('button', { name: 'Submit order' }).click()
  await page.getByText(/Simulated payment recorded/).waitFor()
  await page.goto(`${base}/manage/orders`)
  const order = page
    .locator('.order-record')
    .filter({ hasText: 'Browser Acceptance Order' })
    .first()
  await order.getByRole('button', { name: 'Start preparing' }).click()
  await order.getByRole('button', { name: 'Mark ready' }).click()
  await order.getByRole('button', { name: 'Complete order' }).click()
  await order.locator('.status-completed').waitFor()
  for (const module of [
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
  ]) {
    await page.goto(`${base}/manage/${module}`)
    await page.locator('.ops-table-wrap').waitFor()
    await page.getByText('Loading restaurant records...').waitFor({ state: 'hidden' })
    assert.equal(await page.locator('[role=alert]').count(), 0, module)
  }
  await page.goto(`${base}/manage/customers`)
  await page.getByRole('button', { name: 'New record' }).click()
  await page.getByLabel('Name', { exact: true }).fill('Browser CRM Test')
  await page.getByLabel('Email', { exact: true }).fill('crm@example.test')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('cell', { name: 'Browser CRM Test', exact: true }).first().waitFor()
  await page.goto(`${base}/manage/menu`)
  await page.getByRole('button', { name: 'Edit Cheese & Onion Hash Browns', exact: true }).click()
  const originalPrice = await page.getByLabel('Price ($)', { exact: true }).inputValue()
  await page.getByLabel('Price ($)', { exact: true }).fill('12.25')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.locator('dialog').waitFor({ state: 'hidden' })
  await page.goto(`${base}/services`)
  await page
    .locator('.menu-category article')
    .filter({ hasText: 'Cheese & Onion Hash Browns' })
    .getByText('$12.25', { exact: true })
    .waitFor()
  await page.goto(`${base}/manage/menu`)
  await page.getByRole('button', { name: 'Edit Cheese & Onion Hash Browns', exact: true }).click()
  await page.getByLabel('Price ($)', { exact: true }).fill(originalPrice)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.locator('dialog').waitFor({ state: 'hidden' })
  await page.goto(`${base}/manage/pos`)
  await page.screenshot({ path: '.SYSTEMX/LAN/Temp/restaurant-pos-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: '.SYSTEMX/LAN/Temp/restaurant-pos-mobile.png' })
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'mobile overflow',
  )
  await page.goto(`${base}/login`)
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor()
  await login('staff')
  await page.goto(`${base}/manage/employees`)
  await page.getByRole('heading', { name: 'Owner access required' }).waitFor()
  await page.goto(`${base}/login`)
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor()
  await login('member')
  await page.goto(`${base}/manage`)
  await page.getByRole('heading', { name: 'Access restricted' }).waitFor()
  await page.goto(`${base}/account`)
  await page.getByRole('button', { name: 'Open support ticket' }).click()
  await page.getByLabel('Subject', { exact: true }).fill('Browser ticket test')
  await page.getByLabel('Message', { exact: true }).fill('Customer request saved to Firebase')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByText('Browser ticket test', { exact: true }).first().waitFor()
  assert.equal(await page.getByText('Browser Acceptance Order', { exact: true }).count(), 0)
  await page.goto(`${base}/login`)
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor()
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  const popup = await popupPromise
  await popup.getByText('Sign-in with Google.com', { exact: true }).waitFor()
  await popup.getByRole('button', { name: 'Add new account' }).click()
  await popup.getByRole('button', { name: 'Auto-generate user information' }).click()
  await popup.getByRole('button', { name: 'Sign in with Google.com', exact: true }).click()
  await page.getByText('Level 1 · User / Member', { exact: true }).waitFor()
  assert.deepEqual(errors, [])
  console.log(
    'PASS: guest bypass rejection, email and Google-emulator sign-in, POS to kitchen completion, 11 modules, CRM create, menu-to-public persistence, mobile layout, staff HR denial, member isolation and ticket creation.',
  )
} finally {
  await browser.close()
}
