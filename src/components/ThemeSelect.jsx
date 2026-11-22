import { useLayoutEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'tender-brief-ui-color-theme'

function readThemePreference() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'day' || savedTheme === 'night') return savedTheme
  } catch {
    // A browser can block access to local storage.
  }

  return 'system'
}

export function ThemeSelect() {
  const [preference, setPreference] = useState(readThemePreference)

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

  function handleThemeChange(event) {
    const nextPreference = event.target.value
    setPreference(nextPreference)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference)
    } catch {
      // The theme still changes for the current page when saving is unavailable.
    }
  }

  return (
    <div className="theme-control">
      <svg className="theme-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 3a7 7 0 0 0 0 14Z" fill="currentColor" stroke="none" />
      </svg>
      <select aria-label="Color theme" value={preference} onChange={handleThemeChange}>
        <option value="system">System</option>
        <option value="day">Day</option>
        <option value="night">Night</option>
      </select>
    </div>
  )
}
