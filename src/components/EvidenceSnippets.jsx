const MAX_INLINE_PASSAGE_CHARS = 1000

function EvidenceText({ text }) {
  // pre-wrap handles LF; render Unicode separators as LF without changing source data.
  const displayText = text.replace(/[\u2028\u2029]/gu, '\n')

  return <p className="evidence-text">{displayText}</p>
}

export function EvidenceSnippets({ snippets }) {
  return (
    <section className="brief-section evidence-section" aria-labelledby="evidence-title">
      <h3 id="evidence-title">Supporting source passages</h3>
      <p className="evidence-note">
        Check each passage against the complete tender documents.
      </p>
      <div className="evidence-list">
        {snippets.map((snippet) => (
          <article className="evidence-snippet" key={snippet.id}>
            <h4>{snippet.source}</h4>
            {/* Changed text must reset disclosure state even at the same source offsets. */}
            {snippet.text.length > MAX_INLINE_PASSAGE_CHARS ? (
              <details key={snippet.text} className="evidence-details">
                <summary>
                  Full source passage ({snippet.text.length.toLocaleString()} characters)
                </summary>
                <EvidenceText text={snippet.text} />
              </details>
            ) : (
              <EvidenceText text={snippet.text} />
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
