export function SummaryCard({ summary }) {
  return (
    <section className="card summary-card" aria-labelledby="summary-title">
      <h2 id="summary-title">Reviewer summary</h2>
      <p>{summary}</p>
    </section>
  )
}
