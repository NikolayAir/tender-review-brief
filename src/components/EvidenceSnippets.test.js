import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EvidenceSnippets } from './EvidenceSnippets'

function renderPassages(snippets) {
  return renderToStaticMarkup(createElement(EvidenceSnippets, { snippets }))
}

describe('supporting source passages', () => {
  it('keeps a short passage immediately readable with its original whitespace', () => {
    const text = 'Disabled\n\taccess must remain 1.5 m wide.'
    const markup = renderPassages([{ id: 'example', source: 'Accessibility', text }])

    expect(markup).toContain(text)
    expect(markup).not.toContain('<details')
  })

  it('includes a long passage once inside a closed native disclosure', () => {
    const text = `Water requirements:\n\t${'x'.repeat(2000)}`
    const markup = renderPassages([
      { id: 'example', source: 'Water and drainage systems', text },
    ])

    expect(markup).toContain('<details')
    expect(markup).not.toMatch(/<details[^>]*\bopen/)
    expect(markup).toContain('Full source passage')
    expect(markup.split(text)).toHaveLength(2)
  })

  it.each([
    { name: 'an inline passage', padding: '' },
    { name: 'an expandable passage', padding: 'x'.repeat(1000) },
  ])('renders Unicode separators as line breaks in $name without changing source data', ({ padding }) => {
    const text = `Water pressure must be 1.5\u2028bar.\u2029Do not exceed this value.${padding}`
    const snippet = { id: 'example', source: 'Water and drainage systems', text }
    const markup = renderPassages([snippet])

    expect(markup).toContain(`Water pressure must be 1.5\nbar.\nDo not exceed this value.${padding}`)
    expect(markup).not.toMatch(/[\u2028\u2029]/u)
    expect(snippet.text).toBe(text)
  })

  it.each([
    { length: 1000, collapsed: false },
    { length: 1001, collapsed: true },
  ])('uses the disclosure threshold for $length UTF-16 code units', ({ length, collapsed }) => {
    const markup = renderPassages([
      { id: 'example', source: 'Water and drainage systems', text: 'x'.repeat(length) },
    ])

    expect(markup.includes('<details')).toBe(collapsed)
  })

  it('counts astral Unicode characters as two UTF-16 code units at the disclosure threshold', () => {
    const text = 'Water ' + '😀'.repeat(500)
    const markup = renderPassages([
      { id: 'example', source: 'Water and drainage systems', text },
    ])

    expect(markup).toContain('<details')
    expect(markup).toContain(text)
    expect(markup).toContain(`${text.length.toLocaleString()} characters`)
  })
})
