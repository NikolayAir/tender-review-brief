import { expect, test } from '@playwright/test'

const themeName = 'Color theme'
const sizeName = 'Text size'

function supportsStyledPicker() {
  return CSS.supports('appearance', 'base-select') &&
    CSS.supports('selector(::picker(select))') &&
    CSS.supports('position-try-fallbacks', '--center-settings-picker')
}

async function expectOpen(select) {
  await expect.poll(() => select.evaluate((element) => element.matches(':open'))).toBe(true)
}

async function expectNativePreferences(page, { themeValue, sizeValue, fontSize }) {
  const theme = page.getByRole('combobox', { name: themeName, exact: true })
  const size = page.getByRole('combobox', { name: sizeName, exact: true })
  const root = page.locator('html')

  await expect(theme).toHaveCSS('appearance', 'none')
  await expect(size).toHaveCSS('appearance', 'none')
  await theme.selectOption(themeValue)
  await expect(theme).toHaveValue(themeValue)
  await expect(root).toHaveAttribute('data-theme', themeValue)
  await size.selectOption(sizeValue)
  await expect(size).toHaveValue(sizeValue)
  await expect(root).toHaveAttribute('data-text-size', sizeValue)
  await expect(root).toHaveCSS('font-size', fontSize)
}

test('themes both appearance menus and preserves keyboard selection', async ({ page }) => {
  await page.goto('./')
  const theme = page.getByRole('combobox', { name: themeName, exact: true })
  const size = page.getByRole('combobox', { name: sizeName, exact: true })
  if (!await page.evaluate(supportsStyledPicker)) {
    await expectNativePreferences(page, { themeValue: 'night', sizeValue: 'large', fontSize: '20px' })
    return
  }
  await expect(theme).toHaveCSS('appearance', 'base-select')
  await expect(size).toHaveCSS('appearance', 'base-select')

  const modes = [
    { theme: 'day', system: 'dark', scheme: 'light' },
    { theme: 'night', system: 'light', scheme: 'dark' },
    { theme: 'system', system: 'light', scheme: 'light' },
    { theme: 'system', system: 'dark', scheme: 'dark' },
  ]

  for (const mode of modes) {
    await page.emulateMedia({ colorScheme: mode.system })
    await theme.selectOption(mode.theme)
    await expect(page.locator('html')).toHaveCSS('color-scheme', mode.scheme)
    const surface = await page.locator('.application-bar').evaluate((bar) => getComputedStyle(bar).backgroundColor)

    for (const select of [theme, size]) {
      const value = await select.inputValue()
      await select.press('Space')
      await expectOpen(select)
      const picker = await select.evaluate((element) => ({
        background: getComputedStyle(element, '::picker(select)').backgroundColor,
        arrow: getComputedStyle(element, '::picker-icon').display,
        optionHeights: Array.from(element.options, (option) => option.getBoundingClientRect().height),
      }))
      expect(picker).toMatchObject({ background: surface, arrow: 'none' })
      for (const height of picker.optionHeights) {
        expect(height).toBeGreaterThanOrEqual(24)
        expect(height).toBeLessThanOrEqual(28)
      }
      await page.keyboard.press(value === 'night' ? 'ArrowUp' : 'ArrowDown')
      await page.keyboard.press('Escape')
      await expect.poll(() => select.evaluate((element) => element.matches(':open'))).toBe(false)
      await expect(select).toHaveValue(value)
      await expect(select).toBeFocused()
      await expect(select).toHaveCSS('outline-style', 'solid')
    }
  }

  await size.press('Space')
  await expectOpen(size)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(size).toHaveValue('large')
  await page.reload()
  await expect(size).toHaveValue('large')

  await page.emulateMedia({ forcedColors: 'active' })
  await expectNativePreferences(page, { themeValue: 'day', sizeValue: 'small', fontSize: '16px' })

  await page.emulateMedia({ forcedColors: 'none' })
  await page.setViewportSize({ width: 320, height: 140 })
  await expectNativePreferences(page, { themeValue: 'night', sizeValue: 'large', fontSize: '20px' })
})

test('keeps appearance menus reachable by touch at narrow and short sizes', async ({ browser, browserName, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: browserName !== 'firefox',
  })
  try {
    const page = await context.newPage()
    await page.goto('./')
    const theme = page.getByRole('combobox', { name: themeName, exact: true })
    const size = page.getByRole('combobox', { name: sizeName, exact: true })
    const supports = await page.evaluate(supportsStyledPicker)
    if (!supports) {
      await expect(theme).toHaveCSS('appearance', 'none')
      await expect(size).toHaveCSS('appearance', 'none')
      return
    }

    const layouts = [
      { width: 320, height: 568, fontSize: '' },
      { width: 852, height: 393, fontSize: '' },
      { width: 561, height: 225, fontSize: '36px' },
    ]
    for (const { width, height, fontSize } of layouts) {
      await page.setViewportSize({ width, height })
      await page.evaluate((fontSize) => { document.documentElement.style.fontSize = fontSize }, fontSize)
      await theme.selectOption('night')
      await size.selectOption('large')

      for (const [select, label] of [[theme, 'Day'], [size, 'Medium']]) {
        await select.tap()
        await expectOpen(select)
        const { controlBottom, options } = await select.evaluate((element) => ({
          controlBottom: element.getBoundingClientRect().bottom,
          options: Array.from(element.options, (option) => option.getBoundingClientRect().toJSON()),
        }))
        expect(options).toHaveLength(3)
        for (const option of options) {
          expect(option.height).toBeGreaterThanOrEqual(44)
          expect(option.top).toBeGreaterThanOrEqual(0)
          expect(option.bottom).toBeLessThanOrEqual(height)
          expect(option.left).toBeGreaterThanOrEqual(0)
          expect(option.right).toBeLessThanOrEqual(width)
        }
        if (!fontSize) expect(options[0].top).toBeGreaterThanOrEqual(controlBottom)
        await page.getByRole('option', { name: label, exact: true }).tap()
        await expect(select).toHaveValue(label.toLowerCase())
      }
    }
  } finally {
    await context.close()
  }
})
