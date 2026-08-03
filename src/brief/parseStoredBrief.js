const STRING_FIELDS = [
  'projectTitle',
  'subtitle',
  'reviewerRole',
  'summary',
]

const STRING_ARRAY_FIELDS = [
  'technicalScopes',
  'reviewDomains',
  'followUpChecks',
  'reviewerQuestions',
]

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isEvidenceSnippet(value) {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.source === 'string' &&
    typeof value.text === 'string'
  )
}

export function parseStoredBrief(serializedBrief) {
  const brief = JSON.parse(serializedBrief)

  const hasRequiredStrings =
    isObject(brief) &&
    STRING_FIELDS.every((field) => typeof brief[field] === 'string')

  const hasRequiredStringArrays =
    hasRequiredStrings &&
    STRING_ARRAY_FIELDS.every((field) => isStringArray(brief[field]))

  const hasValidEvidence =
    hasRequiredStringArrays &&
    Array.isArray(brief.evidenceSnippets) &&
    brief.evidenceSnippets.every(isEvidenceSnippet)

  if (!hasValidEvidence) {
    throw new TypeError('Stored review brief has an invalid structure.')
  }

  return brief
}
