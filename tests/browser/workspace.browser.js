import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

async function openLongPassage(page) {
  const excerpt = 'Water requirements:\n' + 'Drawings and installation details must be checked.\n'.repeat(100)
  await page.getByLabel('Public tender excerpt', { exact: true }).fill(excerpt)
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await page.locator('.evidence-details summary').click()
}

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

test('places the source code link in the page footer on desktop and mobile', async ({ page }) => {
  const footer = page.getByRole('contentinfo')
  const source = footer.getByRole('link', { name: 'Source code (opens in a new tab)', exact: true })
  await expect(source).toHaveAttribute('href', 'https://github.com/NikolayAir/tender-review-brief')
  await expect(source).toHaveAttribute('target', '_blank')

  const desktop = { width: 1440, height: 1000 }
  await page.setViewportSize(desktop)
  const desktopFooter = await footer.boundingBox()
  const desktopLink = await source.boundingBox()
  expect(desktopLink.x + desktopLink.width).toBeCloseTo(desktopFooter.x + desktopFooter.width)
  expect(desktopFooter.y + desktopFooter.height).toBeGreaterThanOrEqual(desktop.height - 32)
  expect(desktopFooter.y + desktopFooter.height).toBeLessThanOrEqual(desktop.height)

  const mobile = { width: 320, height: 568 }
  await page.setViewportSize(mobile)
  await page.addStyleTag({ content: 'html { font-size: 200%; }' })
  const mobileFooter = await footer.boundingBox()
  const mobileLink = await source.boundingBox()
  const disclaimer = await footer.getByText('Human technical review is required.', { exact: false }).boundingBox()
  expect(mobileLink.x).toBeCloseTo(mobileFooter.x)
  expect(mobileLink.y).toBeGreaterThanOrEqual(disclaimer.y + disclaimer.height)
  expect(mobileLink.x + mobileLink.width).toBeLessThanOrEqual(mobile.width)
})

for (const width of [320, 390]) {
  test(`keeps the application header readable with enlarged text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })

    const overlaps = await page.locator('.application-identity').evaluate((identity) => {
      const controls = Array.from(
        document.querySelectorAll('.application-controls select, .help-trigger'),
        (element) => element.getBoundingClientRect(),
      )
      return [...identity.querySelectorAll('h1, p')].flatMap((element) => {
        // Text can overflow a flex item even when the item's own box does not overlap.
        const range = document.createRange()
        range.selectNodeContents(element)
        return [...range.getClientRects()]
          .filter((rect) => controls.some((control) => (
            rect.left < control.right && rect.right > control.left && rect.top < control.bottom && rect.bottom > control.top
          )))
          .map(() => element.textContent)
      })
    })
    expect(overlaps).toEqual([])

    const widths = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }))
    expect(widths.page).toBeLessThanOrEqual(widths.viewport)
    await expect(page.getByRole('combobox', { name: 'Color theme', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'How to use', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'How to use', exact: true })).toBeVisible()
  })

  test(`keeps result tab labels whole with enlarged text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })

    const brokenWords = await page.getByRole('tab').evaluateAll((tabs) => tabs.flatMap((tab) => {
      const text = tab.firstChild
      return [...text.textContent.matchAll(/\S+/gu)].flatMap((match) => {
        const range = document.createRange()
        range.setStart(text, match.index)
        range.setEnd(text, match.index + match[0].length)
        return range.getClientRects().length > 1 ? [match[0]] : []
      })
    }))
    expect(brokenWords).toEqual([])

    const overview = page.getByRole('tab', { name: 'Overview', exact: true })
    await overview.focus()
    await overview.press('End')
    await expect(page.getByRole('tab', { name: 'Source passages', exact: true })).toBeFocused()
    await expect(page.getByRole('tabpanel', { name: 'Source passages', exact: true })).toBeVisible()
  })
}

test('brings a regenerated brief back into view from a long desktop passage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openLongPassage(page)
  const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
  await page.evaluate(() => window.scrollTo(0, 1200))

  const heading = page.getByRole('heading', { name: 'Generated review brief', exact: true })
  await expect.poll(async () => (await heading.boundingBox()).y).toBeLessThan(0)
  const button = await generate.boundingBox()
  expect(button.y).toBeGreaterThanOrEqual(0)
  expect(button.y + button.height).toBeLessThan(900)
  await generate.click()

  await expect(heading).toBeFocused()
  const status = await page.getByText('Current excerpt', { exact: true }).boundingBox()
  expect(status.y).toBeGreaterThanOrEqual(0)
  expect(status.y + status.height).toBeLessThan(900)
  await expect(page.locator('.evidence-details')).toHaveJSProperty('open', true)
})

test('keeps reset reachable when a resized editor reports an input error', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 })
  await openLongPassage(page)
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  const original = await input.boundingBox()
  await page.mouse.move(original.x + original.width - 3, original.y + original.height - 3)
  await page.mouse.down()
  await page.mouse.move(original.x + original.width - 3, original.y + original.height + 250, { steps: 5 })
  await page.mouse.up()
  await expect.poll(async () => (await input.boundingBox()).height).toBeGreaterThan(original.height + 100)
  await input.fill('x'.repeat(50001))
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Excerpt is too long')
  await page.mouse.wheel(0, 450)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400)

  const restore = page.getByRole('button', { name: 'Restore sample', exact: true })
  const button = await restore.boundingBox()
  expect(button.y).toBeGreaterThanOrEqual(0)
  expect(button.y + button.height).toBeLessThan(800)
  await restore.click()
  await page.getByRole('dialog', { name: 'Restore the sample?' })
    .getByRole('button', { name: 'Restore sample', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Municipal Building Renovation Tender', exact: true })).toBeVisible()
})

test('keeps the excerpt, brief, and validation error when sample restore is cancelled', async ({ page }) => {
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
  const restore = page.getByRole('button', { name: 'Restore sample', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Restore the sample?' })
  const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true })
  const confirm = dialog.getByRole('button', { name: 'Restore sample', exact: true })
  const passages = page.getByRole('tab', { name: 'Source passages', exact: true })
  const result = page.getByRole('region', { name: 'Review brief', exact: true })
  const excerpt = 'Water pressure must remain at 1.5 bar.'

  await input.fill(excerpt)
  await generate.click()
  await passages.click()
  await input.fill(' ')
  await generate.click()

  for (const key of ['Escape', 'Enter']) {
    await restore.click()
    await expect(cancel).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(confirm).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(cancel).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(confirm).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(cancel).toBeFocused()
    await cancel.press(key)

    await expect(dialog).toBeHidden()
    await expect(restore).toBeFocused()
    await expect(input).toHaveValue(' ')
    await expect(page.getByRole('alert')).toContainText('Please paste')
    await expect(result.getByText('Excerpt changed', { exact: true })).toBeVisible()
    await expect(passages).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('.evidence-text')).toHaveText(excerpt)
  }

  await page.reload()
  await expect(input).toHaveValue(' ')
  await passages.click()
  await expect(page.locator('.evidence-text')).toHaveText(excerpt)
})

test('confirms replacing a generated brief even when the editor contains the sample', async ({ page }) => {
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  const restore = page.getByRole('button', { name: 'Restore sample', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Restore the sample?' })
  const sample = await input.inputValue()

  await restore.click()
  await expect(dialog).toBeHidden()

  await input.fill('Water pressure must remain at 1.5 bar.')
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await input.fill(sample)
  await restore.click()
  await dialog.getByRole('button', { name: 'Restore sample', exact: true }).click()

  await expect(dialog).toBeHidden()
  await expect(restore).toBeFocused()
  await expect(input).toHaveValue(sample)
  await expect(page.getByRole('heading', { name: 'Municipal Building Renovation Tender', exact: true })).toBeVisible()
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

test('keeps the selected tab visible when focus moves to its panel in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  const overview = page.getByRole('tab', { name: 'Overview', exact: true })
  const checks = page.getByRole('tab', { name: 'Checks', exact: true })
  const panel = page.getByRole('tabpanel', { name: 'Checks', exact: true })

  await overview.focus()
  await overview.press('ArrowRight')
  await expect(checks).toBeFocused()
  await expect(checks).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Tab')
  await expect(panel).toBeFocused()
  await expect(checks).toHaveAttribute('aria-selected', 'true')

  await expect(overview).toHaveCSS('border-bottom-width', '0px')
  expect(await overview.evaluate((tab) => getComputedStyle(tab, '::after').content)).toBe('none')
  const indicator = await checks.evaluate((tab) => {
    const marker = getComputedStyle(tab, '::after')
    return {
      width: marker.borderBottomWidth,
      color: marker.borderBottomColor,
      background: getComputedStyle(tab).backgroundColor,
      bottom: tab.getBoundingClientRect().bottom - Number.parseFloat(marker.bottom),
    }
  })
  expect(indicator.width).toBe('2px')
  expect(indicator.color).not.toBe(indicator.background)
  const panelOutlineTop = await panel.evaluate((element) => {
    const style = getComputedStyle(element)
    return element.getBoundingClientRect().top - Number.parseFloat(style.outlineOffset) - Number.parseFloat(style.outlineWidth)
  })
  expect(indicator.bottom).toBeLessThan(panelOutlineTop)

  await page.keyboard.press('Shift+Tab')
  await expect(checks).toBeFocused()
  await expect(checks).toHaveCSS('outline-style', 'solid')
})

test('moves to a generated brief on mobile and provides a way back to editing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  await expect(input).toHaveCSS('font-size', '16px')
  await input.fill('Water pressure must remain at 1.5 bar.')
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()

  const heading = page.getByRole('heading', { name: 'Generated review brief', exact: true })
  await expect(heading).toBeFocused()
  expect((await heading.boundingBox()).y).toBeLessThan(844 / 3)
  const result = await page.getByRole('region', { name: 'Review brief', exact: true }).boundingBox()
  expect(result.y).toBeGreaterThanOrEqual(0)
  expect(result.y + result.height).toBeLessThanOrEqual(844)
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(page.locator('.evidence-text')).toHaveText('Water pressure must remain at 1.5 bar.')

  await page.getByRole('link', { name: 'Edit excerpt', exact: false }).click()
  await expect(input).toBeFocused()
  const widths = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  expect(widths.page).toBeLessThanOrEqual(widths.viewport)
})

test('keeps the result status visible after generating on a short mobile screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Generated review brief', exact: true })).toBeFocused()
  const result = await page.getByRole('region', { name: 'Review brief', exact: true }).boundingBox()
  const status = await page.getByText('Current excerpt', { exact: true }).boundingBox()
  expect(result.y).toBeGreaterThanOrEqual(0)
  expect(status.y).toBeGreaterThanOrEqual(0)
  expect(status.y + status.height).toBeLessThan(667)
})

test('keeps the previous brief and the full input when the excerpt is blank or too long', async ({ page }) => {
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
  await input.fill(' \n\t')
  await generate.press('Enter')
  await expect(page.getByRole('alert')).toContainText('Please paste')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  await expect(generate).toBeFocused()

  await input.fill('x'.repeat(50001))
  await generate.click()
  await expect(page.getByRole('alert')).toContainText('Excerpt is too long')
  await expect(input).toHaveValue('x'.repeat(50001))
  await expect(page.getByRole('heading', { name: 'Municipal Building Renovation Tender', exact: true })).toBeVisible()
})

test('tracks the excerpt behind a brief through edits, reloads, regeneration, and sample reset', async ({ page }) => {
  const input = page.getByLabel('Public tender excerpt', { exact: true })
  const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
  const first = 'Water pressure must remain at 1.5 bar.'
  const second = 'Fire-safety drawings must be checked.'

  await input.fill(first)
  await generate.click()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  await input.fill(second)
  await expect(page.getByRole('status')).toHaveText('The excerpt has changed. Generate the brief again to update the results.')
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(page.locator('.evidence-text')).toHaveText(first)
  await input.fill(first)
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  await input.fill(second)

  await page.reload()
  await expect(input).toHaveValue(second)
  await expect(page.getByRole('region', { name: 'Review brief', exact: true }).getByText('Excerpt changed', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(page.locator('.evidence-text')).toHaveText(first)

  await generate.click()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  await expect(page.locator('.evidence-text')).toHaveText(second)
  await page.reload()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()

  await input.fill(first)
  await expect(page.getByRole('region', { name: 'Review brief', exact: true }).getByText('Excerpt changed', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Restore sample', exact: true }).click()
  await page.getByRole('dialog', { name: 'Restore the sample?' })
    .getByRole('button', { name: 'Restore sample', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Municipal Building Renovation Tender', exact: true })).toBeVisible()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  const sample = await input.inputValue()
  await page.reload()
  await expect(input).toHaveValue(sample)
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
})

for (const { name, sourceExcerpt } of [
  { name: 'an older saved brief' },
  { name: 'a saved brief with invalid source metadata', sourceExcerpt: 42 },
  { name: 'a saved brief with a blank source', sourceExcerpt: ' \n\t' },
  { name: 'a saved brief with an oversized source', sourceExcerpt: 'x'.repeat(50001) },
]) {
  test(`handles ${name} without claiming it uses the current excerpt`, async ({ page }) => {
    const text = 'Water pressure must remain at 1.5 bar.'
    await page.evaluate(({ text, sourceExcerpt }) => {
      sessionStorage.setItem('tender-brief-ui-current-excerpt', text)
      sessionStorage.setItem('tender-brief-ui-active-brief', JSON.stringify({
        projectTitle: 'Saved review',
        subtitle: 'Previously generated brief',
        reviewerRole: 'Technical review support',
        summary: 'The previous review remains available.',
        technicalScopes: ['Structural works'],
        reviewDomains: ['Technical risk'],
        followUpChecks: ['Check drawings.'],
        reviewerQuestions: ['Which drawings apply?'],
        evidenceSnippets: [{ id: 'legacy', source: 'Structural works', text: 'Structural drawings are required.' }],
        sourceExcerpt,
      }))
    }, { text, sourceExcerpt })
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Saved review', exact: true })).toBeVisible()
    await expect(page.getByText('Saved brief', { exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('Generate this saved brief again to confirm it matches the current excerpt.')

    await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
    await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  })
}

test('keeps the review usable when session storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get() { throw new DOMException('Storage unavailable', 'SecurityError') },
    })
  })
  await page.reload()
  await page.getByLabel('Public tender excerpt', { exact: true }).fill('Water drainage drawings are required.')
  await expect(page.getByRole('region', { name: 'Review brief', exact: true }).getByText('Excerpt changed', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(page.locator('.evidence-text')).toHaveText('Water drainage drawings are required.')
})

for (const { name, failedKey } of [
  { name: 'the excerpt', failedKey: 'tender-brief-ui-current-excerpt' },
  { name: 'the brief', failedKey: 'tender-brief-ui-active-brief' },
]) {
  test(`flags mismatched text after reload when a quota error blocks saving ${name}`, async ({ page }) => {
    const first = 'Water drawings are required.'
    const second = 'Fire-safety drawings are required.'
    const input = page.getByLabel('Public tender excerpt', { exact: true })
    const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
    const result = page.getByRole('region', { name: 'Review brief', exact: true })
    await input.fill(first)
    await generate.click()

    await page.evaluate((failedKey) => {
      const setItem = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key === failedKey) throw new DOMException('Storage full', 'QuotaExceededError')
        return setItem.call(this, key, value)
      }
    }, failedKey)
    await input.fill(second)
    await generate.click()
    await expect(input).toHaveValue(second)
    await expect(result.getByText('Current excerpt', { exact: true })).toBeVisible()
    await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
    await expect(page.locator('.evidence-text')).toHaveText(second)

    await page.reload()
    await expect(result.getByText('Excerpt changed', { exact: true })).toBeVisible()
    const restoredInput = name === 'the excerpt' ? first : second
    const restoredSource = name === 'the excerpt' ? second : first
    await expect(input).toHaveValue(restoredInput)
    await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
    await expect(page.locator('.evidence-text')).toHaveText(restoredSource)

    await generate.click()
    await expect(result.getByText('Current excerpt', { exact: true })).toBeVisible()
    await expect(page.locator('.evidence-text')).toHaveText(restoredInput)
  })
}
