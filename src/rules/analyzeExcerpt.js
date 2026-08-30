export const MAX_EXCERPT_CHARS = 50000

// Rule order defines the stable order of generated scopes, checks,
// questions, and evidence.
const rules = [
  {
    id: 'structural',
    scope: 'Structural works',
    focus: 'Technical risk',
    followUpCheck:
      'Confirm whether structural drawings and calculation notes are available for review.',
    question:
      'Which structural drawings and calculation notes should be reviewed?',
    keywords: [
      'structural',
      'structure',
      'load-bearing',
      'concrete',
      'reinforced concrete',
      'béton',
    ],
  },
  {
    id: 'fire-safety',
    scope: 'Fire safety',
    focus: 'Requirement verification',
    followUpCheck: 'Check whether fire-safety interfaces are described in sufficient detail.',
    question:
      'Which fire-safety elements require inspection or third-party coordination?',
    keywords: [
      'fire',
      'fire-safety',
      'fire safety',
      'incendie',
      'sécurité incendie',
    ],
  },
  {
    id: 'accessibility',
    scope: 'Accessibility',
    focus: 'Requirement verification',
    followUpCheck: 'Verify whether accessibility or PMR requirements are defined in the full tender documents.',
    question:
      'Which accessibility or PMR requirements should be verified?',
    keywords: ['accessibility', 'accessible', 'pmr', 'disabled access', 'barrier-free'],
  },
  {
    id: 'building-envelope',
    scope: 'Building envelope',
    focus: 'Coordination',
    followUpCheck: 'Confirm whether facade, roof, window, and external-wall interfaces are defined.',
    question:
      'Which facade, roof, or envelope interfaces require inspection follow-up?',
    keywords: ['envelope', 'facade', 'façade', 'roof', 'window', 'external wall'],
  },
  {
    id: 'water-drainage',
    scope: 'Water and drainage systems',
    focus: 'Coordination',
    followUpCheck:
      'Check whether water, drainage, and plumbing interfaces are specified across relevant trades.',
    question:
      'Which water, drainage, or plumbing interfaces require inspection or coordination with other trades?',
    keywords: [
      'water',
      'drainage',
      'plumbing',
      'sanitary',
      'pipes',
      'eau',
      'évacuation',
      'eaux usées',
    ],
  },
  {
    id: 'phasing',
    scope: 'Site access and phasing',
    focus: 'Coordination',
    followUpCheck:
      'Verify whether site access, occupation, and phasing constraints are defined.',
    question:
      'Are the works phased around continued building occupation or restricted site access?',
    keywords: [
      'occupied',
      'occupation',
      'phasing',
      'phase',
      'site access',
      'access constraints',
    ],
  },
  {
    id: 'documentation',
    scope: 'Technical documentation',
    focus: 'Document review',
    followUpCheck:
      'Confirm which technical documents and acceptance criteria govern the review.',
    question: 'Which documents define the applicable acceptance criteria?',
    keywords: [
      'documentation',
      'documents',
      'drawings',
      'plans',
      'acceptance criteria',
      'clarification',
    ],
  },
]

function unique(items) {
  return [...new Set(items)]
}

const keywordPatternCache = new Map()

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getKeywordPattern(keyword) {
  if (!keywordPatternCache.has(keyword)) {
    const escapedKeyword = escapeRegExp(keyword.trim()).replace(/\s+/g, '\\s+')
    const pattern = `(^|[^\\p{L}\\p{N}])${escapedKeyword}(?=$|[^\\p{L}\\p{N}])`

    keywordPatternCache.set(keyword, new RegExp(pattern, 'iu'))
  }

  return keywordPatternCache.get(keyword)
}

function findRuleMatch(excerpt, rule) {
  let firstMatch = null

  for (const keyword of rule.keywords) {
    const match = getKeywordPattern(keyword).exec(excerpt)

    if (!match) continue

    const start = match.index + match[1].length
    const end = match.index + match[0].length

    // The longest match at the same position keeps multi-line phrases complete.
    if (
      firstMatch === null ||
      start < firstMatch.start ||
      (start === firstMatch.start && end > firstMatch.end)
    ) {
      firstMatch = { start, end }
    }
  }

  return firstMatch
}

function extractEvidenceText(excerpt, match) {
  // Quote complete source lines, preserving punctuation and internal whitespace.
  const beforeMatch = excerpt.slice(0, match.start)
  const start =
    Math.max(
      beforeMatch.lastIndexOf('\n'),
      beforeMatch.lastIndexOf('\r'),
      beforeMatch.lastIndexOf('\u2028'),
      beforeMatch.lastIndexOf('\u2029'),
    ) + 1
  const nextLineBreak = excerpt.slice(match.end).search(/[\r\n\u2028\u2029]/u)
  const end = nextLineBreak === -1 ? excerpt.length : match.end + nextLineBreak

  return excerpt.slice(start, end).trim()
}

export function validateExcerptInput(text) {
  if (!text || !text.trim()) {
    return 'Please paste a public, non-confidential tender excerpt to generate a review brief.'
  }

  if (text.length > MAX_EXCERPT_CHARS) {
    return `Excerpt is too long (${text.length.toLocaleString()} characters). Please paste at most ${MAX_EXCERPT_CHARS.toLocaleString()} characters.`
  }

  return null
}

export function analyzeExcerpt(excerpt) {
  const ruleMatches = rules
    .map((rule) => ({ rule, match: findRuleMatch(excerpt, rule) }))
    .filter(({ match }) => match !== null)

  if (ruleMatches.length === 0) {
    return {
      projectTitle: 'Generated review brief',
      subtitle: 'Source-linked analysis of a pasted public tender excerpt',
      reviewerRole: 'Technical review support',
      summary:
        'No predefined technical terms or phrases were identified. Review the complete tender documentation for relevant scopes, requirements, constraints, and coordination interfaces.',
      technicalScopes: ['Manual review required'],
      reviewDomains: ['Manual review'],
      followUpChecks: [
        'Review the complete tender documentation for technical requirements not covered by the current rules.',
      ],
      reviewerQuestions: [
        'Which technical scopes, drawings, constraints, and acceptance criteria are defined in the full tender documents?',
      ],
      evidenceSnippets: [
        {
          id: 'no-rule-match',
          source: 'No matching technical scope',
          text: 'The excerpt did not match any technical terms or phrases in the current rule set.',
        },
      ],
    }
  }

  return {
    projectTitle: 'Generated review brief',
    subtitle: 'Source-linked analysis of a pasted public tender excerpt',
    reviewerRole: 'Technical review support',
    summary:
      'Rule-based analysis identified explicit technical terms and phrases in the excerpt. Review the brief against the complete tender documentation.',
    technicalScopes: unique(ruleMatches.map(({ rule }) => rule.scope)),
    reviewDomains: unique(ruleMatches.map(({ rule }) => rule.focus)),
    followUpChecks: unique(ruleMatches.map(({ rule }) => rule.followUpCheck)),
    reviewerQuestions: unique(ruleMatches.map(({ rule }) => rule.question)),
    evidenceSnippets: ruleMatches.map(({ rule, match }) => ({
      id: `rule-${rule.id}`,
      source: rule.scope,
      text: extractEvidenceText(excerpt, match),
    })),
  }
}
