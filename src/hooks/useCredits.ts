const GUEST_KEY = 'credits_guest'
const MAX_CREDITS_LOGGED_IN = 10
const MAX_CREDITS_GUEST = 3

interface StoredCredits {
  count: number
  date: string // ISO date string "YYYY-MM-DD"
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10) // "2026-02-20"
}

function getStorageKey(userId: string | null): string {
  return userId ? `credits_${userId}` : GUEST_KEY
}

export function getMaxCredits(userId: string | null): number {
  return userId ? MAX_CREDITS_LOGGED_IN : MAX_CREDITS_GUEST
}

function loadCredits(key: string, maxCredits: number): StoredCredits {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed: StoredCredits = JSON.parse(raw)
      // If it's a new day, reset
      if (parsed.date !== getTodayDateString()) {
        return { count: maxCredits, date: getTodayDateString() }
      }
      return parsed
    }
  } catch {
    // If parsing fails, start fresh
  }
  return { count: maxCredits, date: getTodayDateString() }
}

function saveCredits(key: string, data: StoredCredits): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Returns an object describing the current credit state for the given user.
 * This is designed to be called on-demand (not a React hook) so it can be
 * used both inside and outside of React rendering.
 */
export function getCreditsState(userId: string | null): {
  credits: number
  maxCredits: number
  canSend: boolean
  consume: () => boolean
} {
  const key = getStorageKey(userId)
  const max = getMaxCredits(userId)
  const stored = loadCredits(key, max)

  return {
    credits: stored.count,
    maxCredits: max,
    canSend: stored.count > 0,
    consume: () => {
      const current = loadCredits(key, max)
      if (current.count <= 0) return false
      const updated: StoredCredits = {
        count: current.count - 1,
        date: getTodayDateString(),
      }
      saveCredits(key, updated)
      return true
    },
  }
}
