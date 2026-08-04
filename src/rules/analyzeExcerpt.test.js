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
        id: 'rule-building-envelope',
        source: 'Building envelope',
        text: 'The facade repair includes roof interfaces and external wall coordination',
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
    expect(brief.evidenceSnippets[0].id).toBe('rule-structural')
  })

  it('keeps stable evidence ids when one sentence matches multiple rules', () => {
    const brief = analyzeExcerpt(
      'Structural adaptation requires fire safety coordination.',
    )

    expect(brief.evidenceSnippets.map((snippet) => snippet.id)).toEqual([
      'rule-structural',
      'rule-fire-safety',
    ])
    expect(brief.evidenceSnippets[0].text).toBe(
      'Structural adaptation requires fire safety coordination',
    )
    expect(brief.evidenceSnippets[1].text).toBe(
      'Structural adaptation requires fire safety coordination',
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
