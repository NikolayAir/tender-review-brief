export function DisclaimerFooter() {
  return (
    <footer className="application-footer">
      <p className="disclaimer">
        Human technical review is required. Generated briefs do not constitute legal, regulatory, safety, compliance, or engineering determinations.
      </p>
      <a
        className="source-code-link"
        href="https://github.com/NikolayAir/tender-review-brief"
        target="_blank"
        rel="noreferrer"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m7 5-5 5 5 5m6-10 5 5-5 5m-2-12-2 14" />
        </svg>
        Source code<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </footer>
  )
}
