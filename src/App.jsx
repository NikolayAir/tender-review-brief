import { useEffect, useRef, useState } from 'react'
import './App.css'
import { BriefHeader } from './components/BriefHeader'
import { DisclaimerFooter } from './components/DisclaimerFooter'
import { ExcerptAnalyzer } from './components/ExcerptAnalyzer'
import { ReviewBrief } from './components/ReviewBrief'
import { parseStoredBrief } from './brief/parseStoredBrief'
import { validateExcerptInput } from './rules/analyzeExcerpt'
import { sampleBrief, sampleExcerpt } from './sampleBrief'
import {
  readSessionValue,
  removeSessionValue,
  writeSessionValue,
} from './storage/sessionStorage'

const ACTIVE_BRIEF_STORAGE_KEY = 'tender-brief-ui-active-brief'
const EXCERPT_STORAGE_KEY = 'tender-brief-ui-current-excerpt'

function loadStoredExcerpt() {
  return readSessionValue(EXCERPT_STORAGE_KEY, sampleExcerpt)
}

function loadStoredBrief() {
  return readSessionValue(
    ACTIVE_BRIEF_STORAGE_KEY,
    sampleBrief,
    parseStoredBrief,
  )
}

export default function App() {
  const [activeBrief, setActiveBrief] = useState(loadStoredBrief)
  const [excerpt, setExcerpt] = useState(loadStoredExcerpt)
  const resultHeadingRef = useRef(null)
  const resultPanelRef = useRef(null)
  const focusResult = useRef(false)

  useEffect(() => {
    if (!focusResult.current) return
    focusResult.current = false
    const heading = resultHeadingRef.current
    const panel = resultPanelRef.current
    if (!heading || !panel) return

    heading.focus({ preventScroll: true })
    // The editor can stay pinned when the brief heading has scrolled out of view.
    if (
      window.matchMedia('(max-width: 899px)').matches ||
      panel.getBoundingClientRect().top < 0 ||
      heading.getBoundingClientRect().bottom > window.innerHeight
    ) {
      panel.scrollIntoView({ block: 'start' })
    }
  }, [activeBrief])

  function handleAnalyze(brief) {
    focusResult.current = true
    const nextBrief = { ...brief, sourceExcerpt: excerpt }
    setActiveBrief(nextBrief)
    writeSessionValue(ACTIVE_BRIEF_STORAGE_KEY, nextBrief, JSON.stringify)
  }

  function handleExcerptChange(nextExcerpt) {
    setExcerpt(nextExcerpt)
    writeSessionValue(EXCERPT_STORAGE_KEY, nextExcerpt)
  }

  function handleReset() {
    focusResult.current = false
    setExcerpt(sampleExcerpt)
    setActiveBrief(sampleBrief)
    removeSessionValue(EXCERPT_STORAGE_KEY)
    removeSessionValue(ACTIVE_BRIEF_STORAGE_KEY)
  }

  // Legacy briefs can be valid without a usable snapshot of their source excerpt.
  const savedSource = activeBrief.sourceExcerpt
  const briefSource = activeBrief === sampleBrief
    ? sampleExcerpt
    : typeof savedSource === 'string' && validateExcerptInput(savedSource) === null
      ? savedSource
      : null
  const sourceStatus = briefSource === null
    ? 'unknown'
    : briefSource === excerpt ? 'current' : 'stale'

  return (
    <>
      <a className="skip-link" href="#review-brief-title">Skip to review brief</a>
      <BriefHeader />
      <main className="app-shell">
        <div className="review-workspace">
          <ExcerptAnalyzer
            excerpt={excerpt}
            confirmSampleRestore={excerpt !== sampleExcerpt || activeBrief !== sampleBrief}
            onExcerptChange={handleExcerptChange}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
          />
          <ReviewBrief
            brief={activeBrief}
            sourceStatus={sourceStatus}
            headingRef={resultHeadingRef}
            panelRef={resultPanelRef}
          />
        </div>
        <DisclaimerFooter />
      </main>
    </>
  )
}
