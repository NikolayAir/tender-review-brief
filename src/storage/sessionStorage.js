// Browser storage is best-effort: access, parsing, serialization, or quota
// failures must not prevent the interface from remaining usable.

const identity = (value) => value

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function readSessionValue(key, fallback, deserialize = identity) {
  const storage = getSessionStorage()

  if (!storage) {
    return fallback
  }

  try {
    const storedValue = storage.getItem(key)
    return storedValue === null ? fallback : deserialize(storedValue)
  } catch {
    return fallback
  }
}

export function writeSessionValue(key, value, serialize = String) {
  const storage = getSessionStorage()

  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, serialize(value))
    return true
  } catch {
    return false
  }
}

export function removeSessionValue(key) {
  const storage = getSessionStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}
