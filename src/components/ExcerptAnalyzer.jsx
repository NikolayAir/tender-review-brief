import { useEffect, useRef, useState } from 'react'
import {
  MAX_EXCERPT_CHARS,
  analyzeExcerpt,
  validateExcerptInput,
} from '../rules/analyzeExcerpt'

export function ExcerptAnalyzer({ excerpt, onExcerptChange, onAnalyze, onReset }) {
  const [error, setError] = useState('')
  const [fitsViewport, setFitsViewport] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const panel = panelRef.current
    const updatePosition = () => {
      // A resized textarea or validation error can make the card too tall to pin.
      // Reserve the same 24 px inset above and below it as the sticky layout.
      setFitsViewport(panel.getBoundingClientRect().height + 48 <= window.innerHeight)
    }
    const observer = new ResizeObserver(updatePosition)
    observer.observe(panel)
    window.addEventListener('resize', updatePosition)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePosition)
    }
  }, [])

  const excerptDescription = error
    ? 'excerpt-help excerpt-storage-note excerpt-character-count excerpt-error'
    : 'excerpt-help excerpt-storage-note excerpt-character-count'

  function handleExcerptChange(event) {
    const nextExcerpt = event.target.value
    onExcerptChange(nextExcerpt)

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
    setError('')
    onReset()
  }

  return (
    <section
      ref={panelRef}
      className={`workspace-panel analyzer-card${fitsViewport ? ' analyzer-card--sticky' : ''}`}
      aria-labelledby="analyzer-title"
    >
      <div className="panel-heading">
        <span className="section-number" aria-hidden="true">01</span>
        <h2 id="analyzer-title">Tender excerpt</h2>
      </div>
      <p id="excerpt-help" className="analyzer-note">
        Paste a public, non-confidential excerpt or use the sample.
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
