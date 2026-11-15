import { useRef, useState } from 'react'
import { EvidenceSnippets } from './EvidenceSnippets'
import { SummaryCard } from './SummaryCard'
import { TagList } from './TagList'
import { TextList } from './TextList'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'checks', label: 'Checks' },
  { id: 'passages', label: 'Source passages' },
]

const SOURCE_STATUS = {
  current: {
    label: 'Current excerpt',
    message: 'This brief uses the current excerpt.',
  },
  stale: {
    label: 'Excerpt changed',
    message: 'The excerpt has changed. Generate the brief again to update the results.',
  },
  unknown: {
    label: 'Saved brief',
    message: 'Generate this saved brief again to confirm it matches the current excerpt.',
  },
}

export function ReviewBrief({ brief, sourceStatus, headingRef }) {
  const [activeTab, setActiveTab] = useState('overview')
  const tabRefs = useRef({})
  const status = SOURCE_STATUS[sourceStatus]

  function handleTabKeyDown(event, index) {
    const nextIndex = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index + TABS.length - 1) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }[event.key]

    if (nextIndex === undefined) return

    event.preventDefault()
    const nextTab = TABS[nextIndex].id
    setActiveTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  return (
    <section className="workspace-panel review-panel" aria-label="Review brief">
      <header className="review-header">
        <div className="review-header-label">
          <p className="section-label"><span aria-hidden="true">02 / </span>Review brief</p>
          <span className={`source-status source-status--${sourceStatus}`}>
            <span aria-hidden="true" className="source-status-dot" />
            {status.label}
          </span>
        </div>
        <h2 id="review-brief-title" ref={headingRef} tabIndex={-1}>
          {brief.projectTitle}
        </h2>
        <p className="review-subtitle">{brief.subtitle}</p>
        <a className="edit-excerpt-link" href="#public-tender-excerpt">Edit excerpt ↑</a>
      </header>

      <div className={`brief-notice brief-notice--${sourceStatus}`} role="status" aria-atomic="true">
        <p className={sourceStatus === 'current' ? 'visually-hidden' : 'brief-notice-message'}>
          {status.message}
        </p>
      </div>

      <div className="review-tabs" role="tablist" aria-label="Review sections">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            ref={(element) => { tabRefs.current[tab.id] = element }}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="review-tab-panel"
        id="panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        tabIndex={0}
        hidden={activeTab !== 'overview'}
      >
        <SummaryCard summary={brief.summary} />
        <div className="overview-sections">
          <TagList id="technical-scopes" title="Detected technical scopes" items={brief.technicalScopes} />
          <TagList id="review-focus-areas" title="Suggested review focus areas" items={brief.reviewDomains} />
        </div>
      </div>

      <div
        className="review-tab-panel"
        id="panel-checks"
        role="tabpanel"
        aria-labelledby="tab-checks"
        tabIndex={0}
        hidden={activeTab !== 'checks'}
      >
        <div className="checks-sections">
          <TextList id="follow-up-checks" title="Suggested follow-up checks" items={brief.followUpChecks} />
          <TextList id="reviewer-questions" title="Suggested reviewer questions" items={brief.reviewerQuestions} />
        </div>
      </div>

      <div
        className="review-tab-panel"
        id="panel-passages"
        role="tabpanel"
        aria-labelledby="tab-passages"
        tabIndex={0}
        hidden={activeTab !== 'passages'}
      >
        <EvidenceSnippets snippets={brief.evidenceSnippets} />
      </div>
    </section>
  )
}
