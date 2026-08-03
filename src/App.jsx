import { useState } from 'react'
import './App.css'
import { BriefHeader } from './components/BriefHeader'
import { DisclaimerFooter } from './components/DisclaimerFooter'
import { EvidenceSnippets } from './components/EvidenceSnippets'
import { ExcerptAnalyzer } from './components/ExcerptAnalyzer'
import { SummaryCard } from './components/SummaryCard'
import { TagList } from './components/TagList'
import { TextList } from './components/TextList'
import { parseStoredBrief } from './brief/parseStoredBrief'
import { sampleBrief } from './sampleBrief'
import {
  readSessionValue,
  removeSessionValue,
  writeSessionValue,
} from './storage/sessionStorage'

const ACTIVE_BRIEF_STORAGE_KEY = 'tender-brief-ui-active-brief'

function loadStoredBrief() {
  return readSessionValue(
    ACTIVE_BRIEF_STORAGE_KEY,
    sampleBrief,
    parseStoredBrief,
  )
}

export default function App() {
  const [activeBrief, setActiveBrief] = useState(loadStoredBrief)

  function handleAnalyze(brief) {
    setActiveBrief(brief)
    writeSessionValue(ACTIVE_BRIEF_STORAGE_KEY, brief, JSON.stringify)
  }

  function handleReset() {
    setActiveBrief(sampleBrief)
    removeSessionValue(ACTIVE_BRIEF_STORAGE_KEY)
  }

  return (
    <main className="app-shell">
      <BriefHeader brief={activeBrief} />

      <div className="brief-grid">
        <ExcerptAnalyzer onAnalyze={handleAnalyze} onReset={handleReset} />

        <SummaryCard summary={activeBrief.summary} />

        <TagList
          id="technical-scopes"
          title="Detected technical scopes"
          items={activeBrief.technicalScopes}
        />

        <TagList
          id="review-focus-areas"
          title="Potential review focus areas"
          items={activeBrief.reviewDomains}
        />

        <TextList
          id="follow-up-checks"
          title="Potential follow-up checks"
          items={activeBrief.followUpChecks}
        />

        <TextList
          id="reviewer-questions"
          title="Suggested reviewer questions"
          items={activeBrief.reviewerQuestions}
        />

        <EvidenceSnippets snippets={activeBrief.evidenceSnippets} />
      </div>

      <DisclaimerFooter />
    </main>
  )
}
