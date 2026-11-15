import { useEffect, useRef, useState } from 'react'
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
  const resultHeadingRef = useRef(null)
  const focusResult = useRef(false)

  useEffect(() => {
    if (!focusResult.current) return
    focusResult.current = false
    resultHeadingRef.current?.focus({ preventScroll: true })
    if (window.matchMedia('(max-width: 899px)').matches) {
      resultHeadingRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [activeBrief])

  function handleAnalyze(brief) {
    focusResult.current = true
    setActiveBrief(brief)
    writeSessionValue(ACTIVE_BRIEF_STORAGE_KEY, brief, JSON.stringify)
  }

  function handleReset() {
    focusResult.current = false
    setActiveBrief(sampleBrief)
    removeSessionValue(ACTIVE_BRIEF_STORAGE_KEY)
  }

  return (
    <>
      <a className="skip-link" href="#review-brief-title">Skip to review brief</a>
      <BriefHeader />
      <main className="app-shell">
        <div className="review-workspace">
          <ExcerptAnalyzer onAnalyze={handleAnalyze} onReset={handleReset} />
          <ReviewBrief brief={activeBrief} headingRef={resultHeadingRef} />
        </div>
        <DisclaimerFooter />
      </main>
    </>
  )
}
