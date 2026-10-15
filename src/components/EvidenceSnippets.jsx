const MAX_INLINE_PASSAGE_CHARS = 1000

function EvidenceText({ text }) {
  // pre-wrap handles LF; render Unicode separators as LF without changing source data.
  const displayText = text.replace(/[\u2028\u2029]/gu, '\n')

  return <p className="evidence-text">{displayText}</p>
}

export function EvidenceSnippets({ snippets }) {
  return (
    <section className="card evidence-card" aria-labelledby="evidence-title">
      <h2 id="evidence-title">Supporting source passages</h2>
      <p className="evidence-note">
        Newly generated briefs show shared context once for all matched scopes.
      </p>
      <div className="evidence-list">
        {snippets.map((snippet) => (
          <article className="evidence-snippet" key={snippet.id}>
            <h3>{snippet.source}</h3>
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
