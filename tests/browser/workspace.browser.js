import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
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
