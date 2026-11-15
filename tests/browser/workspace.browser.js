import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('keeps the sample excerpt and review overview together in the first desktop screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const source = await page.getByRole('region', { name: 'Tender excerpt', exact: true }).boundingBox()
  const result = await page.getByRole('region', { name: 'Review brief', exact: true }).boundingBox()

  expect(source.x + source.width).toBeLessThan(result.x)
  expect(Math.abs(source.y - result.y)).toBeLessThan(2)
  expect(source.y + source.height).toBeLessThan(900)
  expect(result.y + result.height).toBeLessThan(900)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  expect(height).toBeLessThanOrEqual(900)
})

test('operates result tabs with arrows, Home, End, and a single tab stop', async ({ page }) => {
  const overview = page.getByRole('tab', { name: 'Overview', exact: true })
  const checks = page.getByRole('tab', { name: 'Checks', exact: true })
  const passages = page.getByRole('tab', { name: 'Source passages', exact: true })

  await overview.focus()
  await overview.press('ArrowRight')
  await expect(checks).toBeFocused()
  await expect(checks).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel', { name: 'Checks', exact: true })).toBeVisible()
  await expect(page.locator('#panel-overview')).toBeHidden()
  await expect(overview).toHaveAttribute('tabindex', '-1')

  await checks.press('End')
  await expect(passages).toBeFocused()
  await expect(page.getByRole('tabpanel', { name: 'Source passages', exact: true })).toBeVisible()
  await passages.press('ArrowRight')
  await expect(overview).toBeFocused()
  await overview.press('ArrowLeft')
  await expect(passages).toBeFocused()
  await passages.press('Home')
  await expect(overview).toBeFocused()
  await overview.press('Tab')
  await expect(page.getByRole('tabpanel', { name: 'Overview', exact: true })).toBeFocused()
})

test('keeps the previous brief and the full input when validation fails', async ({ page }) => {
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
  await input.fill(' \n\t')
  await generate.click()
  await expect(page.getByRole('alert')).toContainText('Please paste')
  await expect(generate).toBeFocused()

  await input.fill('x'.repeat(50001))
  await generate.click()
  await expect(page.getByRole('alert')).toContainText('Excerpt is too long')
  await expect(input).toHaveValue('x'.repeat(50001))
  await expect(page.getByRole('heading', { name: 'Municipal Building Renovation Tender', exact: true })).toBeVisible()
})
