import { useLayoutEffect } from 'react'
import { useAppearancePreference } from '../storage/useAppearancePreference'

const TEXT_SIZE_STORAGE_KEY = 'tender-brief-ui-text-size'

export function TextSizeSelect() {
  const [size, setSize] = useAppearancePreference(TEXT_SIZE_STORAGE_KEY, ['small', 'medium', 'large'], 'medium')

  useLayoutEffect(() => {
    document.documentElement.dataset.textSize = size
  }, [size])

  return (
    <div className="appearance-control">
      <svg className="appearance-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="m2 14 3.75-8 3.75 8M3.5 11h4.5M17 9v5m0-2.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 1 0 5 0" />
      </svg>
      <select aria-label="Text size" title="Text size" value={size} onChange={(event) => setSize(event.target.value)}>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>
  )
}
