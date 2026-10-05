import { clampNumberOfCups, clampShuffleInterval } from './game'

export interface Persisted {
  score: number
  best: number
  streak: number
  bestStreak: number
  numberOfCups: number
  shuffleIntervalMs: number
  lang: string
}

const KEY = 'cup-game:v1'

function nonNegativeInt(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback
}

/** Reads saved progress and settings. Missing, blocked or corrupt storage yields the defaults. */
export function load(defaults: Persisted, storage: Pick<Storage, 'getItem'> | null = safeStorage()): Persisted {
  if (!storage) return { ...defaults }
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return { ...defaults }
    const data = JSON.parse(raw) as Partial<Record<keyof Persisted, unknown>>
    return {
      score: nonNegativeInt(data.score, defaults.score),
      best: nonNegativeInt(data.best, defaults.best),
      streak: nonNegativeInt(data.streak, defaults.streak),
      bestStreak: nonNegativeInt(data.bestStreak, defaults.bestStreak),
      numberOfCups: clampNumberOfCups(nonNegativeInt(data.numberOfCups, defaults.numberOfCups)),
      shuffleIntervalMs: clampShuffleInterval(nonNegativeInt(data.shuffleIntervalMs, defaults.shuffleIntervalMs)),
      lang: typeof data.lang === 'string' ? data.lang : defaults.lang
    }
  } catch {
    return { ...defaults }
  }
}

export function save(data: Persisted, storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
  if (!storage) return
  try {
    storage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Private mode or quota: progress simply is not kept.
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}
