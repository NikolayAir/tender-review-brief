import { useLayoutEffect } from 'react'
import { useAppearancePreference } from '../storage/useAppearancePreference'

const THEME_STORAGE_KEY = 'tender-brief-ui-color-theme'

export function ThemeSelect() {
  const [preference, setPreference] = useAppearancePreference(THEME_STORAGE_KEY, ['system', 'day', 'night'], 'system')

  useLayoutEffect(() => {
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const systemTheme = systemPreference.matches ? 'night' : 'day'
      document.documentElement.dataset.theme = preference === 'system' ? systemTheme : preference
    }

    applyTheme()
    if (preference !== 'system') return

    systemPreference.addEventListener('change', applyTheme)
    return () => systemPreference.removeEventListener('change', applyTheme)
  }, [preference])

  return (
    <div className="appearance-control">
      <svg className="appearance-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 3a7 7 0 0 0 0 14Z" fill="currentColor" stroke="none" />
      </svg>
      <select aria-label="Color theme" value={preference} onChange={(event) => setPreference(event.target.value)}>
        <option value="system">System</option>
        <option value="day">Day</option>
        <option value="night">Night</option>
      </select>
    </div>
  )
}
