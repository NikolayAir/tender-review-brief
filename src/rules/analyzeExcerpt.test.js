import { describe, expect, it } from 'vitest'

import { sampleBrief, sampleExcerpt } from '../sampleBrief'

import {
  MAX_EXCERPT_CHARS,
  analyzeExcerpt,
  validateExcerptInput,
} from './analyzeExcerpt'

describe('validateExcerptInput', () => {
  it('rejects empty excerpts', () => {
    expect(validateExcerptInput('   \n')).toBe(
      'Please paste a public, non-confidential tender excerpt to generate a review brief.',
    )
  })

  it('rejects excerpts above the character limit', () => {
    const excerpt = 'a'.repeat(MAX_EXCERPT_CHARS + 1)

    expect(validateExcerptInput(excerpt)).toContain('Excerpt is too long')
  })

  it('accepts non-empty excerpts within the character limit', () => {
    expect(validateExcerptInput('Fire-safety drawings are referenced.')).toBeNull()
  })
})

describe('analyzeExcerpt', () => {
  it('returns a fallback manual-review brief when no lexical rules match', () => {
    const brief = analyzeExcerpt(
      'The tender notice contains general administrative information.',
    )

    expect(brief.projectTitle).toBe('Generated review brief')
    expect(brief.reviewerRole).toBe('Technical review support')
    expect(brief.technicalScopes).toEqual(['Manual review required'])
    expect(brief.reviewDomains).toEqual(['Manual review'])
    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        id: 'no-rule-match',
        source: 'No matching technical scope',
      }),
    ])
  })

  it('detects matching technical scopes from lexical rules', () => {
    const brief = analyzeExcerpt(
      'The works include fire safety coordination. Structural drawings are requested before acceptance.',
    )

    expect(brief.technicalScopes).toEqual(
      expect.arrayContaining(['Fire safety', 'Structural works']),
    )
    expect(brief.reviewDomains).toEqual(
      expect.arrayContaining(['Requirement verification', 'Technical risk']),
    )
    expect(brief.followUpChecks).toEqual(
      expect.arrayContaining([
        'Check whether fire-safety interfaces are described in sufficient detail.',
        'Confirm whether structural drawings and calculation notes are available for review.',
      ]),
    )
  })

  it('links evidence snippets to matched source text', () => {
    const brief = analyzeExcerpt(
      'The facade repair includes roof interfaces and external wall coordination.',
    )

    expect(brief.technicalScopes).toContain('Building envelope')
    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Building envelope',
        text: 'The facade repair includes roof interfaces and external wall coordination.',
      }),
    ])
  })
})

describe('source paragraph preservation', () => {
  it.each([
    {
      name: 'decimal values and their units',
      excerpt:
        'Water pressure must be 1.5 bar and water temperature must be 60.5 °C.',
    },
    {
      name: 'decimal commas, percentages, and semicolons',
      excerpt: 'Water pressure must be 1,5 bar; drainage slope must be 2.0%.',
    },
    {
      name: 'abbreviations and section numbers',
      excerpt: 'Water tests shall follow Sec. 3.2 of spec. No. 5.',
    },
    {
      name: 'URLs with dotted paths and query punctuation',
      excerpt:
        'Water requirements: https://example.test/specs/1.5?rev=2#sec-3.2.',
    },
    {
      name: 'abbreviations inside parentheses',
      excerpt:
        'Water installation (e.g. valves, pipes, etc.) must meet the spec.',
    },
    {
      name: 'quotation marks and terminal punctuation',
      excerpt: 'Water testing: “Are all pipes sealed?” Check them!',
    },
    {
      name: 'surrounding sentences on the same source line',
      excerpt:
        'Administrative note. Water pressure must be 1.5 bar. Retain this requirement.',
    },
  ])('preserves $name', ({ excerpt }) => {
    expect(analyzeExcerpt(excerpt).evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Water and drainage systems',
        text: excerpt,
      }),
    ])
  })

  it('isolates source paragraphs while preserving punctuation and trimming outer whitespace', () => {
    const brief = analyzeExcerpt(
      'Administrative notice.\n\n  Water pressure must be 1.5 bar.  \n\nRoof interfaces must be sealed!',
    )

    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Building envelope',
        text: 'Roof interfaces must be sealed!',
      }),
      expect.objectContaining({
        source: 'Water and drainage systems',
        text: 'Water pressure must be 1.5 bar.',
      }),
    ])
  })

  it('uses the first matching source paragraph regardless of keyword order', () => {
    const brief = analyzeExcerpt(
      'Roof repairs are required.\n\nThe facade interfaces follow later.',
    )

    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Building envelope',
        text: 'Roof repairs are required.',
      }),
    ])
  })
})

describe('multiline keyword phrases in source evidence', () => {
  it.each([
    { name: 'LF', separator: '\n' },
    { name: 'CRLF', separator: '\r\n' },
    { name: 'CR', separator: '\r' },
    { name: 'Unicode line separators', separator: '\u2028' },
    { name: 'Unicode paragraph separators', separator: '\u2029' },
    { name: 'blank lines', separator: '\n\n' },
    { name: 'tabs and indentation', separator: '\t\n  \t' },
  ])('preserves $name inside a matched phrase', ({ separator }) => {
    const passage = `Disabled${separator}access is mandatory.`
    const brief = analyzeExcerpt(
      `Administrative notice.\n\n  ${passage}  \n\nRoof interfaces follow.`,
    )

    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Accessibility',
        text: passage,
      }),
      expect.objectContaining({
        source: 'Building envelope',
        text: 'Roof interfaces follow.',
      }),
    ])
  })

  it.each([
    {
      scope: 'Structural works',
      passage: 'Reinforced\nconcrete must reach 25.5 MPa.',
    },
    {
      scope: 'Fire safety',
      passage: 'Fire\nsafety interfaces must be coordinated.',
    },
    {
      scope: 'Accessibility',
      passage: 'Disabled\naccess is mandatory.',
    },
    {
      scope: 'Building envelope',
      passage: 'External\nwall joints must be sealed.',
    },
    {
      scope: 'Water and drainage systems',
      passage: 'Eaux\nusées : pente minimale de 1,5 %.',
    },
    {
      scope: 'Site access and phasing',
      passage: 'Restricted site\naccess applies throughout the works.',
    },
    {
      scope: 'Technical documentation',
      passage: 'Acceptance\ncriteria must be stated.',
    },
  ])('quotes the paragraphs spanning a matched phrase for $scope', ({ scope, passage }) => {
    const brief = analyzeExcerpt(passage)

    expect(brief.technicalScopes).toEqual([scope])
    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({ source: scope, text: passage }),
    ])
  })

  it('uses an earlier multiline phrase before a later single-word signal', () => {
    const brief = analyzeExcerpt(
      'Disabled\naccess is mandatory.\n\nAccessibility review follows.',
    )

    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        source: 'Accessibility',
        text: 'Disabled\naccess is mandatory.',
      }),
    ])
  })
})

describe('lexical matching safeguards', () => {
  it('matches case-insensitively and preserves accented French signals', () => {
    const brief = analyzeExcerpt(
      'BÉTON structurel, SÉCURITÉ INCENDIE et rénovation de FAÇADE.',
    )

    expect(brief.technicalScopes).toEqual([
      'Structural works',
      'Fire safety',
      'Building envelope',
    ])
  })

  it('does not match signals embedded inside longer words', () => {
    const brief = analyzeExcerpt(
      'The fireplace is decorative and the infrastructure note is administrative.',
    )

    expect(brief.technicalScopes).toEqual(['Manual review required'])
    expect(brief.evidenceSnippets[0].id).toBe('no-rule-match')
  })

  it('matches multi-word phrases across repeated whitespace', () => {
    const brief = analyzeExcerpt(
      'Restricted site    access applies throughout the works.',
    )

    expect(brief.technicalScopes).toContain('Site access and phasing')
  })

  it('deduplicates multiple signals from the same rule', () => {
    const brief = analyzeExcerpt(
      'Structural structure and reinforced concrete requirements are listed.',
    )

    expect(brief.technicalScopes).toEqual(['Structural works'])
    expect(brief.evidenceSnippets).toHaveLength(1)
    expect(brief.evidenceSnippets[0].source).toBe('Structural works')
  })

  it('shares one stable passage id when multiple rules match the same paragraph', () => {
    const excerpt = 'Structural adaptation requires fire safety coordination.'
    const brief = analyzeExcerpt(excerpt)

    expect(brief.evidenceSnippets).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        source: 'Structural works · Fire safety',
        text: excerpt,
      }),
    ])
    expect(analyzeExcerpt(excerpt).evidenceSnippets[0].id).toBe(
      brief.evidenceSnippets[0].id,
    )
  })

  it('uses cautious wording for generated follow-up checks', () => {
    const brief = analyzeExcerpt(
      'Structural works, fire safety, facade repairs, and site access are included.',
    )

    expect(brief.followUpChecks).not.toHaveLength(0)
    expect(
      brief.followUpChecks.every((item) =>
        /^(Confirm|Check|Verify|Review)\b/.test(item),
      ),
    ).toBe(true)
  })
})

describe('bundled sample consistency', () => {
  it('derives the displayed sample brief from the bundled excerpt', () => {
    const derivedBrief = analyzeExcerpt(sampleExcerpt)

    expect(sampleBrief.technicalScopes).toEqual(derivedBrief.technicalScopes)
    expect(sampleBrief.reviewDomains).toEqual(derivedBrief.reviewDomains)
    expect(sampleBrief.followUpChecks).toEqual(derivedBrief.followUpChecks)
    expect(sampleBrief.reviewerQuestions).toEqual(derivedBrief.reviewerQuestions)
    expect(sampleBrief.evidenceSnippets).toEqual(derivedBrief.evidenceSnippets)
  })
})
