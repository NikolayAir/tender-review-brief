export function SummaryCard({ summary }) {
  return (
    <section className="brief-section summary-section" aria-labelledby="summary-title">
      <h3 id="summary-title">Reviewer summary</h3>
      <p>{summary}</p>
    </section>
  )
}
