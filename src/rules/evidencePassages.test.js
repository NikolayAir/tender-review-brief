import { describe, expect, it } from 'vitest'

import { analyzeExcerpt, MAX_EXCERPT_CHARS } from './analyzeExcerpt'

describe('paragraph context for source evidence', () => {
  it.each([
    { name: 'a wrapped unit', passage: 'Water pressure must be 1.5\nbar.' },
    { name: 'a wrapped value', passage: 'Water pressure must be\n1.5 bar.' },
    {
      name: 'a preceding exclusion',
      passage: 'The following work is excluded:\nWater and drainage systems.',
    },
    {
      name: 'a following exclusion',
      passage: 'Water and drainage systems\nare excluded from this contract.',
    },
    {
      name: 'a preceding negation',
      passage: 'Do not\nuse water pipes in this area.',
    },
  ])('preserves $name with its source context', ({ passage }) => {
    const brief = analyzeExcerpt(`Administrative notice.\n\n${passage}\n\nEnd of notice.`)

    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Water and drainage systems',
        text: passage,
      }),
    ])
  })

  it('preserves the requirements listed after a wrapped keyword phrase', () => {
    const passage = 'Disabled\naccess requirements:\nroute A: 1.5 m\nroute B: 2.0 m'

    expect(analyzeExcerpt(passage).evidenceSnippets).toEqual([
      expect.objectContaining({ source: 'Accessibility', text: passage }),
    ])
  })

  it.each([
    { name: 'LF', separator: '\n\n' },
    { name: 'CRLF', separator: '\r\n\r\n' },
    { name: 'CR', separator: '\r\r' },
    { name: 'Unicode line separators', separator: '\u2028\u2028' },
    { name: 'Unicode paragraph separators', separator: '\u2029\u2029' },
    { name: 'whitespace-only lines', separator: '\n \t \n' },
    { name: 'mixed line endings', separator: '\r\n \n' },
  ])('uses $name blank lines as paragraph boundaries', ({ separator }) => {
    const passage = 'Water pressure must be 1.5 bar.'
    const excerpt = `Administrative notice.${separator}  ${passage}  ${separator}End of notice.`

    expect(analyzeExcerpt(excerpt).evidenceSnippets).toEqual([
      expect.objectContaining({ source: 'Water and drainage systems', text: passage }),
    ])
  })

  it('preserves mixed line endings, indentation, and an astral Unicode prefix', () => {
    const passage = '🛠️ Do not\r\n\tuse water pipes:\rpressure 1.5\nbar.\u2028Keep sealed.'

    expect(analyzeExcerpt(`Preface.\n\n${passage}\n\nEnd.`).evidenceSnippets).toEqual([
      expect.objectContaining({ source: 'Water and drainage systems', text: passage }),
    ])
  })
})

describe('shared source passages', () => {
  it('quotes a shared paragraph once and lists its scopes in rule order', () => {
    const passage = 'Water interfaces require structural and fire safety coordination.'
    const brief = analyzeExcerpt(passage)

    expect(brief.technicalScopes).toEqual([
      'Structural works',
      'Fire safety',
      'Water and drainage systems',
    ])
    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Structural works · Fire safety · Water and drainage systems',
        text: passage,
      }),
    ])
  })

  it('merges overlapping context when a keyword phrase crosses a paragraph boundary', () => {
    const passage = 'Fire\n\nsafety and water interfaces must be coordinated.'

    expect(analyzeExcerpt(passage).evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Fire safety · Water and drainage systems',
        text: passage,
      }),
    ])
  })

  it('merges a chain of three overlapping contexts into one complete passage', () => {
    const passage = 'Fire\n\nsafety and disabled\n\naccess\n\nconstraints must remain documented.'
    const excerpt = `Administrative notice.\n\n${passage}\n\nEnd of notice.`

    expect(analyzeExcerpt(excerpt).evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Fire safety · Accessibility · Site access and phasing',
        text: passage,
      }),
    ])
  })

  it('keeps a passage id stable when another paragraph matches an earlier rule', () => {
    const passage = 'Water pressure must be 1.5 bar.'
    const original = analyzeExcerpt(passage).evidenceSnippets[0]
    const expanded = analyzeExcerpt(`${passage}\n\nStructural works are required.`)

    expect(expanded.evidenceSnippets.map(({ source }) => source)).toEqual([
      'Structural works',
      'Water and drainage systems',
    ])
    expect(expanded.evidenceSnippets[1]).toEqual(original)
    expect(new Set(expanded.evidenceSnippets.map(({ id }) => id)).size).toBe(2)
  })

  it('stores a maximum-length paragraph only once without cutting its text', () => {
    const opening = 'Structural fire accessibility facade water phasing documents are specified. '
    const excerpt = opening + 'x'.repeat(MAX_EXCERPT_CHARS - opening.length)
    const brief = analyzeExcerpt(excerpt)

    expect(brief.technicalScopes).toHaveLength(7)
    expect(brief.evidenceSnippets).toHaveLength(1)
    expect(brief.evidenceSnippets[0].text).toBe(excerpt)
    expect(brief.evidenceSnippets[0].text).toHaveLength(MAX_EXCERPT_CHARS)
  })

  it('does not repeat source characters across separate paragraph quotes', () => {
    const paragraphs = [
      'Structural works are required.',
      'Fire safety coordination is required.',
      'Accessibility is required.',
      'Facade interfaces must be sealed.',
      'Water pressure must be 1.5 bar.',
      'Site access is restricted.',
      'Acceptance criteria must be stated.',
    ]
    const excerpt = paragraphs.join('\n\n')
    const snippets = analyzeExcerpt(excerpt).evidenceSnippets

    expect(snippets.map(({ text }) => text)).toEqual(paragraphs)
    expect(snippets.reduce((size, { text }) => size + text.length, 0)).toBeLessThanOrEqual(
      excerpt.length,
    )
  })
})
