import { useState } from 'react'
import './App.css'
import { BriefHeader } from './components/BriefHeader'
import { DisclaimerFooter } from './components/DisclaimerFooter'
import { ExcerptAnalyzer } from './components/ExcerptAnalyzer'
import { ReviewBrief } from './components/ReviewBrief'
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
    <>
      <BriefHeader />
      <main className="app-shell">
        <div className="review-workspace">
          <ExcerptAnalyzer onAnalyze={handleAnalyze} onReset={handleReset} />
          <ReviewBrief brief={activeBrief} />
        </div>
        <DisclaimerFooter />
      </main>
    </>
  )
}
