import { useState } from 'react'
import {
  MAX_EXCERPT_CHARS,
  analyzeExcerpt,
  validateExcerptInput,
} from '../rules/analyzeExcerpt'
import { sampleExcerpt } from '../sampleBrief'
import {
  readSessionValue,
  removeSessionValue,
  writeSessionValue,
} from '../storage/sessionStorage'

const EXCERPT_STORAGE_KEY = 'tender-brief-ui-current-excerpt'

function loadStoredExcerpt() {
  return readSessionValue(EXCERPT_STORAGE_KEY, sampleExcerpt)
}

export function ExcerptAnalyzer({ onAnalyze, onReset }) {
  const [excerpt, setExcerpt] = useState(loadStoredExcerpt)
  const [error, setError] = useState('')

  const excerptDescription = error
    ? 'excerpt-help excerpt-storage-note excerpt-character-count excerpt-error'
    : 'excerpt-help excerpt-storage-note excerpt-character-count'

  function handleExcerptChange(event) {
    const nextExcerpt = event.target.value
    setExcerpt(nextExcerpt)
    writeSessionValue(EXCERPT_STORAGE_KEY, nextExcerpt)

    if (error) {
      setError('')
    }
  }

  function handleAnalyze() {
    const validationError = validateExcerptInput(excerpt)

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    onAnalyze(analyzeExcerpt(excerpt))
  }

  function handleReset() {
    setExcerpt(sampleExcerpt)
    removeSessionValue(EXCERPT_STORAGE_KEY)
    setError('')
    onReset()
  }

  return (
    <section className="workspace-panel analyzer-card" aria-labelledby="analyzer-title">
      <div className="panel-heading">
        <span className="section-number" aria-hidden="true">01</span>
        <h2 id="analyzer-title">Tender excerpt</h2>
      </div>
      <p id="excerpt-help" className="analyzer-note">
        Paste a public, non-confidential excerpt, or try the bundled sample.
      </p>

      <textarea
        id="public-tender-excerpt"
        className="excerpt-input"
        value={excerpt}
        onChange={handleExcerptChange}
        rows={12}
        aria-label="Public tender excerpt"
        aria-describedby={excerptDescription}
        aria-invalid={Boolean(error)}
      />

      <div id="excerpt-character-count" className="analyzer-meta">
        {excerpt.length.toLocaleString()} / {MAX_EXCERPT_CHARS.toLocaleString()}{' '}
        characters
      </div>

      {error && (
        <p id="excerpt-error" className="input-error" role="alert">
          {error}
        </p>
      )}

      <div className="analyzer-actions">
        <button type="button" onClick={handleAnalyze}>
          Generate review brief
          <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="secondary-button" onClick={handleReset}>
          Restore sample
        </button>
      </div>
      <p id="excerpt-storage-note" className="analyzer-limit-note">
        Processed in this browser. Your text is not sent to a server.
      </p>
    </section>
  )
}
