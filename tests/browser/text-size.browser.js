import { expect, test } from '@playwright/test'

test('scales the editor and Night help and restores the selected size', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')

  const size = page.getByRole('combobox', { name: 'Text size', exact: true })
  const editor = page.getByRole('textbox', { name: 'Public tender excerpt', exact: true })
  const help = page.getByRole('button', { name: 'How to use', exact: true })
  const dialog = page.getByRole('dialog', { name: 'How to use', exact: true })
  await expect(size).toHaveValue('medium')
  await expect(editor).toHaveCSS('font-size', '15.75px')

  await size.selectOption('small')
  await expect(editor).toHaveCSS('font-size', '14px')
  await size.selectOption('large')
  await expect(editor).toHaveCSS('font-size', '17.5px')
  await page.reload()
  await expect(size).toHaveValue('large')
  await expect(editor).toHaveCSS('font-size', '17.5px')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await help.click()
  await expect(dialog.getByRole('listitem').first()).toHaveCSS('font-size', '17.5px')
})

test('keeps the review readable and its selected tab when enlarging text at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('./')

  const editor = page.getByRole('textbox', { name: 'Public tender excerpt', exact: true })
  await editor.fill('Water pressure must remain at 1.5 bar.')
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  const passages = page.getByRole('tab', { name: 'Source passages', exact: true })
  await passages.click()
  await editor.fill('Drawings must be checked.')

  await page.getByRole('combobox', { name: 'Text size', exact: true }).selectOption('large')
  await expect(editor).toHaveValue('Drawings must be checked.')
  await expect(editor).toHaveCSS('font-size', '20px')
  await expect(passages).toHaveAttribute('aria-selected', 'true')
  const quote = page.locator('.evidence-text')
  await expect(quote).toHaveCSS('font-size', '17.5px')
  await expect(quote).toHaveText('Water pressure must remain at 1.5 bar.')

  const widths = await page.locator('html').evaluate((root) => ({
    page: root.scrollWidth,
    viewport: root.clientWidth,
  }))
  expect(widths.page).toBeLessThanOrEqual(widths.viewport)
})
