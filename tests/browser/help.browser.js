import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('opens keyboard help without losing the excerpt, result tab, or changed-input notice', async ({ page }) => {
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  await input.fill('Water drawings are required.')
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await input.fill('Fire-safety drawings are required.')

  const trigger = page.getByRole('button', { name: 'How to use', exact: true })
  await trigger.focus()
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'How to use', exact: true })
  await expect(dialog).toBeVisible()
  const title = dialog.getByRole('heading', { name: 'How to use', exact: true })
  await expect(title).toBeFocused()
  await expect(dialog.getByRole('listitem')).toHaveCount(4)

  await title.press('Tab')
  const close = dialog.getByRole('button', { name: 'Close help', exact: true })
  await expect(close).toBeFocused()
  await close.press('Tab')
  const documentation = dialog.getByRole('link', { name: 'Full documentation on GitHub', exact: false })
  await expect(documentation).toBeFocused()
  await expect(documentation).toHaveAttribute('href', 'https://github.com/NikolayAir/tender-review-brief#review-workflow')
  await expect(documentation).toHaveAttribute('target', '_blank')
  await documentation.press('Tab')
  await expect(close).toBeFocused()
  await close.press('Shift+Tab')
  await expect(documentation).toBeFocused()
  await documentation.press('Escape')

  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(input).toHaveValue('Fire-safety drawings are required.')
  await expect(page.getByRole('region', { name: 'Review brief', exact: true }).getByText('Excerpt changed', { exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Source passages', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.evidence-text')).toHaveText('Water drawings are required.')
})

test('closes help through its close button and backdrop, and can reopen it', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'How to use', exact: true })
  const dialog = page.getByRole('dialog', { name: 'How to use', exact: true })
  await trigger.click()
  await dialog.getByRole('button', { name: 'Close help', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(dialog).toBeVisible()
  await page.mouse.click(8, 8)
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
})

test('fits help within a narrow screen and keeps its close control available while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.getByRole('button', { name: 'How to use', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'How to use', exact: true })
  const bounds = await dialog.boundingBox()
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.y).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(568)

  await dialog.getByRole('link', { name: 'Full documentation on GitHub', exact: false }).scrollIntoViewIfNeeded()
  const close = dialog.getByRole('button', { name: 'Close help', exact: true })
  const button = await close.boundingBox()
  expect(button.y).toBeGreaterThanOrEqual(0)
  expect(button.y + button.height).toBeLessThanOrEqual(568)
  const widths = await dialog.evaluate((element) => ({
    dialog: element.scrollWidth,
    available: element.clientWidth,
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  expect(widths.dialog).toBeLessThanOrEqual(widths.available)
  expect(widths.page).toBeLessThanOrEqual(widths.viewport)
  await close.click()
  await expect(dialog).toBeHidden()
})
