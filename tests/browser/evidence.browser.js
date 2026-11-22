import { expect, test } from '@playwright/test'

async function generateBrief(page, excerpt) {
  await page.getByLabel('Public tender excerpt', { exact: true }).fill(excerpt)
  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
}

async function wordPositions(passage, words) {
  return passage.evaluate((element, words) => {
    const text = element.firstChild

    return words.map((word) => {
      const start = text.textContent.indexOf(word)
      const range = document.createRange()
      range.setStart(text, start)
      range.setEnd(text, start + word.length)
      const { x, y } = range.getBoundingClientRect()

      return { x, y }
    })
  }, words)
}

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('keeps the no-match message tied to the brief after reload and edits', async ({ page }) => {
  const excerpt = 'The contractor shall hold a weekly site progress meeting and circulate the minutes to the project team within two working days. ' +
    'The minutes shall record each agreed action, the person responsible, and the due date.'
  await generateBrief(page, excerpt)
  const panel = page.getByRole('tabpanel', { name: 'Source passages', exact: true })
  const emptyState = panel.getByRole('heading', { name: 'No matching source passages', exact: true })
  await expect(emptyState).toBeVisible()
  await expect(panel.getByRole('article')).toHaveCount(0)

  await page.reload()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(emptyState).toBeVisible()
  await expect(panel.getByRole('article')).toHaveCount(0)

  const updatedExcerpt = 'Fire-safety drawings must be checked.'
  await page.getByLabel('Public tender excerpt', { exact: true }).fill(updatedExcerpt)
  const result = page.getByRole('region', { name: 'Review brief', exact: true })
  await expect(result.getByText('Excerpt changed', { exact: true })).toBeVisible()
  await expect(panel.getByText('No keywords matched the excerpt used to generate this brief.')).toBeVisible()

  await page.getByRole('button', { name: 'Generate review brief', exact: true }).click()
  await expect(emptyState).toBeHidden()
  await expect(panel.locator('.evidence-text')).toHaveText(updatedExcerpt)
})

test('shows wrapped units, internal indentation, and negation on separate lines', async ({ page }) => {
  const excerpt = 'Water pressure must be 1.5\n\tbar.\nDo not exceed this value.'
  await generateBrief(page, excerpt)
  const passage = page.locator('.evidence-text')

  await expect(passage).toHaveJSProperty('textContent', excerpt)
  const [water, unit, negation] = await wordPositions(passage, ['Water', 'bar.', 'Do not'])
  expect(unit.y).toBeGreaterThan(water.y)
  expect(negation.y).toBeGreaterThan(unit.y)
  expect(unit.x).toBeGreaterThan(water.x)
})

for (const { name, padding } of [
  { name: 'an inline passage', padding: '' },
  { name: 'an expandable passage', padding: 'x'.repeat(1200) },
]) {
  test(`shows Unicode line breaks in ${name} while preserving stored source text`, async ({ page }) => {
    const excerpt = `Water pressure must be 1.5\u2028bar.\u2029Do not exceed this value.${padding}`
    await generateBrief(page, excerpt)

    if (padding) {
      await page.locator('.evidence-details summary').press('Enter')
    }

    const passage = page.locator('.evidence-text')
    await expect(passage).toHaveJSProperty(
      'textContent',
      `Water pressure must be 1.5\nbar.\nDo not exceed this value.${padding}`,
    )
    const [water, unit, negation] = await wordPositions(passage, ['Water', 'bar.', 'Do not'])
    expect(unit.y).toBeGreaterThan(water.y)
    expect(negation.y).toBeGreaterThan(unit.y)

    const storedText = await page.evaluate(() => {
      const brief = JSON.parse(sessionStorage.getItem('tender-brief-ui-active-brief'))
      return brief.evidenceSnippets[0].text
    })
    expect(storedText).toBe(excerpt)
  })
}

test('operates disclosures by keyboard and resets same-length source replacements', async ({ page }) => {
  const first = 'Water and fire safety requirements:\n' + 'x'.repeat(1200)
  const second = first.replaceAll('x', 'y')
  await generateBrief(page, first)
  const disclosure = page.locator('.evidence-details')
  const summary = disclosure.locator('summary')
  const passagesTab = page.getByRole('tab', { name: 'Source passages', exact: true })
  const panel = page.getByRole('tabpanel', { name: 'Source passages', exact: true })

  await expect(disclosure).toHaveJSProperty('open', false)
  await passagesTab.focus()
  await page.keyboard.press('Tab')
  await expect(panel).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(summary).toBeFocused()
  await expect(summary).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  await expect(disclosure).toHaveJSProperty('open', true)
  await page.keyboard.press('Space')
  await expect(disclosure).toHaveJSProperty('open', false)
  await page.keyboard.press('Enter')

  await page.getByRole('tab', { name: 'Overview', exact: true }).click()
  await page.getByRole('tab', { name: 'Source passages', exact: true }).click()
  await expect(disclosure).toHaveJSProperty('open', true)

  await generateBrief(page, first)
  await expect(disclosure).toHaveJSProperty('open', true)
  await generateBrief(page, second)
  await expect(disclosure).toHaveJSProperty('open', false)
  await summary.press('Enter')
  await expect(page.locator('.evidence-text')).toHaveJSProperty('textContent', second)
})

for (const { name, excerpt } of [
  { name: 'an unbroken identifier', excerpt: 'Water requirements:\n' + 'x'.repeat(3000) },
  { name: 'deep tab indentation', excerpt: 'Water requirements:\n' + '\t'.repeat(40) + '1.5 bar.\n' + 'x'.repeat(1200) },
]) {
  test(`keeps ${name} within a 320 px viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await generateBrief(page, excerpt)
    await page.locator('.evidence-details summary').press('Enter')
    await expect(page.locator('.evidence-details')).toHaveJSProperty('open', true)

    const widths = await page.locator('.evidence-text').evaluate((element) => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      available: element.clientWidth,
      text: element.scrollWidth,
    }))
    expect(widths.page).toBeLessThanOrEqual(widths.viewport)
    expect(widths.text).toBeLessThanOrEqual(widths.available)
  })
}
