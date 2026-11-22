import { describe, expect, it } from 'vitest'

import { parseStoredBrief } from './parseStoredBrief'

const validBrief = {
  projectTitle: 'Example tender',
  subtitle: 'Review brief',
  reviewerRole: 'Technical review support',
  summary: 'Example summary',
  technicalScopes: ['Structural works'],
  reviewDomains: ['Technical risk'],
  followUpChecks: ['Check the drawings.'],
  reviewerQuestions: ['Which drawings apply?'],
  evidenceSnippets: [
    {
      id: 'rule-structural',
      source: 'Structural works',
      text: 'Structural drawings are required',
    },
  ],
}

describe('parseStoredBrief', () => {
  it('returns a stored brief with the expected structure', () => {
    expect(parseStoredBrief(JSON.stringify(validBrief))).toEqual(validBrief)
  })

  it('restores an older no-match brief with an empty quotation list', () => {
    const noMatchBrief = {
      ...validBrief,
      sourceExcerpt: 'The contractor shall hold a weekly site progress meeting.',
      evidenceSnippets: [{
        id: 'no-rule-match',
        source: 'No matching technical scope',
        text: 'The excerpt did not match any technical terms or phrases in the current rule set.',
      }],
    }

    expect(parseStoredBrief(JSON.stringify(noMatchBrief))).toEqual({ ...noMatchBrief, evidenceSnippets: [] })
  })

  it('rejects syntactically valid JSON with missing brief fields', () => {
    expect(() => parseStoredBrief('{}')).toThrow(
      'Stored review brief has an invalid structure.',
    )
  })

  it('rejects malformed evidence snippets', () => {
    const invalidBrief = {
      ...validBrief,
      evidenceSnippets: [{ id: 'rule-structural' }],
    }

    expect(() => parseStoredBrief(JSON.stringify(invalidBrief))).toThrow(
      'Stored review brief has an invalid structure.',
    )
  })
})
