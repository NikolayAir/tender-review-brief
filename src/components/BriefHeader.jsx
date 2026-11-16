import { ReviewHelp } from './ReviewHelp'

export function BriefHeader() {
  return (
    <header className="application-bar">
      <div className="application-bar-inner">
        <div className="application-identity">
          <svg className="application-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 3h7l4 4v14H6V3h1Z" />
            <path d="M14 3v5h4M9 12h6M9 16h4" />
          </svg>
          <div>
            <h1>Tender Review Brief</h1>
            <p>Technical review support</p>
          </div>
        </div>
        <ReviewHelp />
      </div>
    </header>
  )
}
