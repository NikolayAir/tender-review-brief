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

test('brings a regenerated brief back into view from a long desktop passage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openLongPassage(page)
  const generate = page.getByRole('button', { name: 'Generate review brief', exact: true })
  await page.mouse.wheel(0, 1200)

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

test('moves to a generated brief on mobile and provides a way back to editing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const input = page.getByLabel('Public tender excerpt', { exact: true })
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
  await expect(page.getByText('Excerpt changed', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(page.locator('.evidence-text')).toHaveText(first)

  await generate.click()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  await expect(page.locator('.evidence-text')).toHaveText(second)
  await page.reload()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()

  await input.fill(first)
  await expect(page.getByText('Excerpt changed', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Restore sample', exact: true }).click()
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
  await expect(page.getByText('Excerpt changed', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await expect(page.getByText('Current excerpt', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(page.locator('.evidence-text')).toHaveText('Water drainage drawings are required.')
})
