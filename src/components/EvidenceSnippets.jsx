export function EvidenceSnippets({ snippets }) {
  return (
    <section className="card evidence-card" aria-labelledby="evidence-title">
      <h2 id="evidence-title">Source-linked evidence</h2>
      <div className="evidence-list">
        {snippets.map((snippet) => (
          <article className="evidence-snippet" key={snippet.id}>
            <h3>{snippet.source}</h3>
            <p>{snippet.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
