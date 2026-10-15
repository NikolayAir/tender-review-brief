const MAX_INLINE_PASSAGE_CHARS = 1000

export function EvidenceSnippets({ snippets }) {
  return (
    <section className="card evidence-card" aria-labelledby="evidence-title">
      <h2 id="evidence-title">Supporting source passages</h2>
      <p className="evidence-note">
        Shared context is shown once for its matched scopes.
      </p>
      <div className="evidence-list">
        {snippets.map((snippet) => (
          <article className="evidence-snippet" key={snippet.id}>
            <h3>{snippet.source}</h3>
            {snippet.text.length > MAX_INLINE_PASSAGE_CHARS ? (
              <details className="evidence-details">
                <summary>
                  Full source passage ({snippet.text.length.toLocaleString()} characters)
                </summary>
                <p className="evidence-text">{snippet.text}</p>
              </details>
            ) : (
              <p className="evidence-text">{snippet.text}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
