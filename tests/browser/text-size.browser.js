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

test('keeps the three header controls in one row with Large text on phones', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('./')

  const size = page.getByRole('combobox', { name: 'Text size', exact: true })
  const help = page.getByRole('button', { name: 'How to use', exact: true })
  const label = help.getByText('How to use', { exact: true })
  await size.selectOption('large')

  for (const width of [320, 351, 393, 439, 440]) {
    await page.setViewportSize({ width, height: 720 })
    const centers = await page.locator('.application-controls select, .help-trigger').evaluateAll((controls) => (
      controls.map((control) => {
        const bounds = control.getBoundingClientRect()
        return bounds.top + bounds.height / 2
      })
    ))
    expect(Math.max(...centers) - Math.min(...centers), `header control row at ${width}px`).toBeLessThan(2)

    if (width === 440) {
      await expect(label).toBeVisible()
    } else {
      await expect(help).toBeVisible()
      await expect(label).toBeHidden()
      const target = await help.boundingBox()
      expect(target.width).toBeGreaterThanOrEqual(44)
      expect(target.height).toBeGreaterThanOrEqual(44)
    }
  }

  await page.setViewportSize({ width: 393, height: 720 })
  await help.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'How to use', exact: true })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  await size.selectOption('medium')
  await expect(label).toBeVisible()
})
