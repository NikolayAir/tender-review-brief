export function BriefHeader({ brief }) {
  return (
    <header className="brief-header">
      <p className="app-title">Tender Review Brief</p>
      <p className="eyebrow">{brief.reviewerRole}</p>
      <h1>{brief.projectTitle}</h1>
      <p className="subtitle">{brief.subtitle}</p>
    </header>
  )
}
