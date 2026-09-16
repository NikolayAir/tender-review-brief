function findParagraphSpans(excerpt) {
  const paragraphs = []
  let paragraph = null

  // Treat CRLF as one line ending; only blank lines separate source paragraphs.
  const lines = excerpt.matchAll(/([^\r\n\u2028\u2029]*)(?:\r\n|[\r\n\u2028\u2029]|$)/gu)

  for (const line of lines) {
    const content = line[1]

    if (!content.trim()) {
      paragraph = null
      continue
    }

    const end = line.index + content.length

    if (paragraph === null) {
      paragraph = { start: line.index, end }
      paragraphs.push(paragraph)
    } else {
      paragraph.end = end
    }
  }

  return paragraphs
}

function findParagraphContextSpan(paragraphs, matchSpan) {
  const first = paragraphs.find(({ end }) => end > matchSpan.start)
  const last = paragraphs.find(({ end }) => end >= matchSpan.end)

  return { start: first.start, end: last.end }
}

export function buildEvidencePassages(excerpt, ruleMatches) {
  const paragraphs = findParagraphSpans(excerpt)
  const candidates = ruleMatches
    .map(({ rule, matchSpan }, order) => ({
      ...findParagraphContextSpan(paragraphs, matchSpan),
      firstRuleOrder: order,
      scopes: [{ label: rule.scope, order }],
    }))
    .sort((first, second) => first.start - second.start)
  const passages = []

  // Merge overlapping context so source text is stored once, even across paragraphs.
  for (const candidate of candidates) {
    const previous = passages.at(-1)

    if (previous && candidate.start < previous.end) {
      previous.end = Math.max(previous.end, candidate.end)
      previous.firstRuleOrder = Math.min(previous.firstRuleOrder, candidate.firstRuleOrder)
      previous.scopes.push(...candidate.scopes)
    } else {
      passages.push(candidate)
    }
  }

  return passages
    .sort((first, second) => first.firstRuleOrder - second.firstRuleOrder)
    .map(({ start, end, scopes }) => {
      const scopeLabels = scopes
        .sort((first, second) => first.order - second.order)
        .map(({ label }) => label)

      return {
        id: `passage-${start}-${end}`,
        source: [...new Set(scopeLabels)].join(' · '),
        text: excerpt.slice(start, end).trim(),
      }
    })
}
