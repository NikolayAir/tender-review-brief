import { expect, test } from '@playwright/test'

test('applies the saved Night palette while the app bundle is loading', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')

  const theme = page.getByRole('combobox', { name: 'Color theme', exact: true })
  const root = page.locator('html')
  await theme.selectOption('night')
  await expect(root).toHaveCSS('color-scheme', 'dark')
  const nightBackground = await root.evaluate((element) => getComputedStyle(element).backgroundColor)

  let resumeBundle
  const bundlePaused = new Promise((resolve) => { resumeBundle = resolve })
  await page.route('**/assets/*.js', async (route) => {
    await bundlePaused
    await route.continue()
  })

  try {
    await page.reload({ waitUntil: 'commit' })
    await expect(root).toHaveCSS('background-color', nightBackground)
    await expect(root).toHaveCSS('color-scheme', 'dark')
    await expect(theme).toHaveCount(0)
  } finally {
    resumeBundle()
  }

  await expect(theme).toHaveValue('night')
})

test('follows the system color scheme on load and when it changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')

  const theme = page.getByRole('combobox', { name: 'Color theme', exact: true })
  const root = page.locator('html')
  await expect(theme).toHaveValue('system')
  await expect(root).toHaveCSS('color-scheme', 'dark')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect(root).toHaveCSS('color-scheme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(root).toHaveCSS('color-scheme', 'dark')
  await expect(theme).toHaveValue('system')
})

test('keeps explicit themes across reloads and follows the system again when selected', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')

  const theme = page.getByRole('combobox', { name: 'Color theme', exact: true })
  const root = page.locator('html')
  await theme.selectOption('day')
  await expect(root).toHaveCSS('color-scheme', 'light')
  await page.reload()
  await expect(theme).toHaveValue('day')
  await expect(root).toHaveCSS('color-scheme', 'light')

  await theme.selectOption('night')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(root).toHaveCSS('color-scheme', 'dark')
  await page.reload()
  await expect(theme).toHaveValue('night')
  await expect(root).toHaveCSS('color-scheme', 'dark')

  await theme.selectOption('system')
  await expect(root).toHaveCSS('color-scheme', 'light')
  await page.reload()
  await expect(theme).toHaveValue('system')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(root).toHaveCSS('color-scheme', 'dark')
})

test('applies display preferences with storage blocked and preserves the review', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Access denied', 'SecurityError') },
    })
  })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('./')

  const theme = page.getByRole('combobox', { name: 'Color theme', exact: true })
  const size = page.getByRole('combobox', { name: 'Text size', exact: true })
  const input = page.getByRole('textbox', { name: 'Public tender excerpt', exact: true })
  const brief = page.getByRole('region', { name: 'Review brief', exact: true })
  const passages = brief.getByRole('tab', { name: 'Source passages', exact: true })
  await expect(theme).toHaveValue('system')
  await input.fill('Water pressure must remain at 1.5 bar.')
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await passages.click()
  await input.fill('Fire-safety drawings must be checked.')

  await theme.selectOption('night')
  await size.selectOption('large')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await expect(page.locator('html')).toHaveCSS('font-size', '20px')
  await expect(input).toHaveValue('Fire-safety drawings must be checked.')
  await expect(passages).toHaveAttribute('aria-selected', 'true')
  await expect(brief.getByText('Excerpt changed', { exact: true })).toBeVisible()
  await expect(brief.locator('.evidence-text')).toHaveText('Water pressure must remain at 1.5 bar.')

  await page.reload()
  await expect(theme).toHaveValue('system')
  await expect(size).toHaveValue('medium')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')
})

test('keeps the theme selector reachable and large enough to tap on narrow screens', async ({ browser, browserName, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 568 },
    hasTouch: true,
    // Firefox supports touch emulation without Playwright's mobile viewport mode.
    isMobile: browserName !== 'firefox',
  })

  try {
    const page = await context.newPage()
    await page.goto('./')
    const theme = page.getByRole('combobox', { name: 'Color theme', exact: true })
    await expect(theme).toBeInViewport()
    expect((await theme.boundingBox()).height).toBeGreaterThanOrEqual(44)
    await theme.selectOption('night')
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  } finally {
    await context.close()
  }
})
