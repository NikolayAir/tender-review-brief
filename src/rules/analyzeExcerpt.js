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
    source: 'Matched structural signal',
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
    source: 'Matched fire-safety signal',
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
    source: 'Matched accessibility signal',
    keywords: ['accessibility', 'accessible', 'pmr', 'disabled access', 'barrier-free'],
  },
  {
    id: 'building-envelope',
    scope: 'Building envelope',
    focus: 'Coordination',
    followUpCheck: 'Confirm whether facade, roof, window, and external-wall interfaces are defined.',
    question:
      'Which facade, roof, or envelope interfaces require inspection follow-up?',
    source: 'Matched building-envelope signal',
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
    source: 'Matched water/drainage signal',
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
    source: 'Matched phasing/access signal',
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
    source: 'Matched documentation signal',
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

function matchesKeyword(text, keyword) {
  return getKeywordPattern(keyword).test(text)
}

function matchesRule(text, rule) {
  return rule.keywords.some((keyword) => matchesKeyword(text, keyword))
}

function splitIntoSnippets(text) {
  return text
    .split(/[.!?\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function findEvidenceText(excerpt, keywords) {
  const snippets = splitIntoSnippets(excerpt)

  return snippets.find((snippet) =>
    keywords.some((keyword) => matchesKeyword(snippet, keyword)),
  )
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
  const matchedRules = rules.filter((rule) => matchesRule(excerpt, rule))

  if (matchedRules.length === 0) {
    return {
      projectTitle: 'Pasted public excerpt',
      subtitle: 'Source-linked technical review brief',
      reviewerRole: 'Technical review support',
      summary:
        'No predefined technical signals were detected. Review the source document manually to identify relevant scopes, documentation, constraints, and coordination interfaces.',
      technicalScopes: ['Manual review required'],
      reviewDomains: ['Manual review'],
      followUpChecks: [
        'Review the complete source documentation for technical requirements not covered by the current lexical rules.',
      ],
      reviewerQuestions: [
        'Which technical scopes, drawings, constraints, and acceptance criteria are defined in the full tender documents?',
      ],
      evidenceSnippets: [
        {
          id: 'no-rule-match',
          source: 'No lexical rule match',
          text: 'The pasted excerpt did not match the current predefined lexical rules.',
        },
      ],
    }
  }

  return {
    projectTitle: 'Pasted public excerpt',
    subtitle: 'Source-linked technical review brief',
    reviewerRole: 'Technical review support',
    summary:
      'The browser-based analysis detected explicit technical signals in the pasted excerpt. Review the generated brief against the complete source documentation.',
    technicalScopes: unique(matchedRules.map((rule) => rule.scope)),
    reviewDomains: unique(matchedRules.map((rule) => rule.focus)),
    followUpChecks: unique(matchedRules.map((rule) => rule.followUpCheck)),
    reviewerQuestions: unique(matchedRules.map((rule) => rule.question)),
    evidenceSnippets: matchedRules.map((rule) => ({
      id: `rule-${rule.id}`,
      source: rule.source,
      text:
        findEvidenceText(excerpt, rule.keywords) ??
        'A lexical signal matched the pasted excerpt.',
    })),
  }
}
