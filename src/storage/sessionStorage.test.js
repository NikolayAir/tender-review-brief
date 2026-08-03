import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  readSessionValue,
  removeSessionValue,
  writeSessionValue,
} from './sessionStorage'

function createStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues))

  return {
    getItem: vi.fn((key) => (values.has(key) ? values.get(key) : null)),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  }
}

function useStorage(storage) {
  vi.stubGlobal('window', { sessionStorage: storage })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('readSessionValue', () => {
  it('returns and deserializes a stored value', () => {
    const storage = createStorage({ brief: '{"title":"Example"}' })
    useStorage(storage)

    expect(readSessionValue('brief', null, JSON.parse)).toEqual({
      title: 'Example',
    })
  })

  it('returns the fallback when the key is missing', () => {
    useStorage(createStorage())

    expect(readSessionValue('brief', 'fallback')).toBe('fallback')
  })

  it('returns the fallback when deserialization fails', () => {
    useStorage(createStorage({ brief: 'invalid json' }))

    expect(readSessionValue('brief', 'fallback', JSON.parse)).toBe(
      'fallback',
    )
  })

  it('returns the fallback when storage is unavailable', () => {
    vi.stubGlobal('window', {
      get sessionStorage() {
        throw new Error('Storage unavailable')
      },
    })

    expect(readSessionValue('brief', 'fallback')).toBe('fallback')
  })

  it('returns the fallback when reading a storage item fails', () => {
    useStorage({
      getItem: () => {
        throw new Error('Read failed')
      },
    })

    expect(readSessionValue('brief', 'fallback')).toBe('fallback')
  })
})

describe('writeSessionValue', () => {
  it('serializes and stores a value', () => {
    const storage = createStorage()
    useStorage(storage)

    expect(writeSessionValue('brief', { id: 1 }, JSON.stringify)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith('brief', '{"id":1}')
  })

  it('returns false when the write fails', () => {
    useStorage({
      setItem: () => {
        throw new Error('Storage unavailable')
      },
    })

    expect(writeSessionValue('brief', 'value')).toBe(false)
  })

  it('returns false when serialization fails', () => {
    useStorage(createStorage())

    expect(
      writeSessionValue('brief', 'value', () => {
        throw new Error('Serialization failed')
      }),
    ).toBe(false)
  })
})

describe('removeSessionValue', () => {
  it('removes a stored value', () => {
    const storage = createStorage({ brief: 'value' })
    useStorage(storage)

    expect(removeSessionValue('brief')).toBe(true)
    expect(storage.removeItem).toHaveBeenCalledWith('brief')
  })

  it('returns false when removal fails', () => {
    useStorage({
      removeItem: () => {
        throw new Error('Storage unavailable')
      },
    })

    expect(removeSessionValue('brief')).toBe(false)
  })
})
