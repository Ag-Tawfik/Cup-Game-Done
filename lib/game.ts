export type RandomSource = () => number

export const MIN_NUMBER_OF_CUPS = 3
export const MAX_NUMBER_OF_CUPS = 5
export const MIN_SHUFFLE_INTERVAL_MS = 200
export const MAX_SHUFFLE_INTERVAL_MS = 1200
export const SHUFFLE_ROUNDS = 8

/** Cups are identified by 1..n. Cup k always hides the ball worth k GB. */
export function createCups(numberOfCups: number): number[] {
  if (!Number.isInteger(numberOfCups) || numberOfCups < 1) {
    throw new RangeError(`numberOfCups must be a positive integer, got ${numberOfCups}`)
  }
  return Array.from({ length: numberOfCups }, (_, index) => index + 1)
}

export function gbValueForCup(cup: number): number {
  return cup
}

export function labelForCup(cup: number): string {
  return `${gbValueForCup(cup)}GB`
}

/**
 * Fisher-Yates shuffle that never returns the input order for two or more
 * elements, so every shuffle round visibly moves at least one cup.
 */
export function shuffleCups<T>(cups: readonly T[], random: RandomSource = Math.random): T[] {
  if (cups.length < 2) return [...cups]
  const result = [...cups]
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    if (result.some((cup, index) => cup !== cups[index])) return result
  }
  // Astronomically unlikely with a sane random source; fall back to a rotation.
  return [...cups.slice(1), cups[0]]
}

export function clampNumberOfCups(value: number): number {
  return Math.min(MAX_NUMBER_OF_CUPS, Math.max(MIN_NUMBER_OF_CUPS, Math.round(value)))
}

export function clampShuffleInterval(value: number): number {
  return Math.min(MAX_SHUFFLE_INTERVAL_MS, Math.max(MIN_SHUFFLE_INTERVAL_MS, Math.round(value)))
}
