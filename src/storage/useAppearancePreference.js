import { useState } from 'react'

export function useAppearancePreference(key, choices, fallback) {
  const [preference, setPreference] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return choices.includes(saved) ? saved : fallback
    } catch {
      return fallback
    }
  })

  function updatePreference(nextPreference) {
    setPreference(nextPreference)
    try {
      window.localStorage.setItem(key, nextPreference)
    } catch {
      // The current page can still apply preferences when saving is unavailable.
    }
  }

  return [preference, updatePreference]
}
