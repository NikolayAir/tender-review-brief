import { useRef } from 'react'

export function ReviewHelp() {
  const triggerRef = useRef(null)
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const closeRef = useRef(null)
  const documentationRef = useRef(null)
  const pointerStartedOnBackdrop = useRef(false)

  function openHelp() {
    const dialog = dialogRef.current
    dialog.showModal()
    dialog.scrollTop = 0
    pointerStartedOnBackdrop.current = false
    // Start at the title so the numbered instructions can be read in order.
    titleRef.current.focus({ preventScroll: true })
  }

  function closeHelp() {
    dialogRef.current.close()
  }

  function isBackdropEvent(event) {
    if (event.target !== event.currentTarget) return false
    const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect()
    return event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom
  }

  function handleKeyDown(event) {
    if (event.key !== 'Tab') return

    // WebKit can skip both controls during native Tab navigation.
    event.preventDefault()
    const focusDocumentation = event.target === closeRef.current ||
      (event.target === titleRef.current && event.shiftKey)
    const next = focusDocumentation ? documentationRef.current : closeRef.current
    next.focus()
  }

  return (
    <>
      <button ref={triggerRef} type="button" className="help-trigger" aria-haspopup="dialog" onClick={openHelp}>
        <svg className="help-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" />
          <path d="M7.75 7.5a2.25 2.25 0 0 1 4.5 0c0 1.5-2.25 1.5-2.25 3" />
          <circle className="help-icon-dot" cx="10" cy="14" r="0.75" />
        </svg>
        How to use
      </button>
      <dialog
        ref={dialogRef}
        className="review-dialog help-dialog"
        aria-labelledby="review-help-title"
        onClose={() => triggerRef.current.focus()}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          pointerStartedOnBackdrop.current = isBackdropEvent(event)
        }}
        onPointerCancel={() => { pointerStartedOnBackdrop.current = false }}
        onClick={(event) => {
          // A text-selection drag can end on the backdrop without starting there.
          const dismiss = pointerStartedOnBackdrop.current && isBackdropEvent(event)
          pointerStartedOnBackdrop.current = false
          if (dismiss) closeHelp()
        }}
      >
        <div className="help-dialog-content">
          <header className="help-dialog-header">
            <h2 id="review-help-title" ref={titleRef} tabIndex={-1}>How to use</h2>
            <button ref={closeRef} type="button" className="help-close" aria-label="Close help" onClick={closeHelp}>
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <div className="help-dialog-body">
            <ol className="help-steps">
              <li>Paste a public, non-confidential excerpt, or choose <strong>Restore sample</strong>.</li>
              <li>Choose <strong>Generate review brief</strong>. The rules suggest technical scopes and review points.</li>
              <li>Review <strong>Overview</strong> and <strong>Checks</strong>, then check <strong>Source passages</strong> against the complete tender documents.</li>
              <li>After editing the excerpt, generate again. An <strong>Excerpt changed</strong> notice marks the previous result.</li>
            </ol>
            <p className="help-note">Processing runs in this browser. Keyword matches require human review.</p>
            <a
              ref={documentationRef}
              className="help-documentation"
              href="https://github.com/NikolayAir/tender-review-brief#review-a-tender-excerpt"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="help-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 2.75h6l4 4v10.5H5zM11 2.75v4h4M7.5 10h5M7.5 13h5" />
              </svg>
              Full documentation on GitHub <span aria-hidden="true">↗</span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </dialog>
    </>
  )
}
