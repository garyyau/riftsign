import type { Answers } from './types'

const SESSION_KEY = 'riftward:session'

/** What the Player's device remembers between visits. */
export interface Session {
  answers: Answers
  questionSetVersion: string
  /** Encoded Profile of the last completed run, or null while in progress. */
  lastProfileCode: string | null
}

export function emptySession(questionSetVersion: string): Session {
  return { answers: {}, questionSetVersion, lastProfileCode: null }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (!parsed || typeof parsed !== 'object' || typeof parsed.questionSetVersion !== 'string') return null
    return {
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      questionSetVersion: parsed.questionSetVersion,
      lastProfileCode: typeof parsed.lastProfileCode === 'string' ? parsed.lastProfileCode : null,
    }
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Private browsing or a full quota: the run just won't survive a reload.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // best effort
  }
}
