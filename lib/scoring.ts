import { MAX_SHUFFLE_INTERVAL_MS, MIN_SHUFFLE_INTERVAL_MS } from './game'

export const BASE_SHUFFLE_STEPS = 8
export const MAX_SHUFFLE_STEPS = 16
const SPEED_UP_PER_STREAK = 0.94

/** More moves as the streak grows, capped. */
export function shuffleStepsFor(streak: number): number {
  return Math.min(MAX_SHUFFLE_STEPS, BASE_SHUFFLE_STEPS + Math.max(0, streak))
}

/** Faster moves as the streak grows, never below the minimum interval. */
export function intervalFor(baseMs: number, streak: number): number {
  const scaled = Math.round(baseMs * Math.pow(SPEED_UP_PER_STREAK, Math.max(0, streak)))
  return Math.min(MAX_SHUFFLE_INTERVAL_MS, Math.max(MIN_SHUFFLE_INTERVAL_MS, scaled))
}

/** Points for a correct pick: more cups, faster shuffle and longer streak all pay more. */
export function pointsFor(numberOfCups: number, intervalMs: number, streak: number): number {
  const base = numberOfCups * 10
  const speedBonus = Math.round((MAX_SHUFFLE_INTERVAL_MS - intervalMs) / 50)
  const streakBonus = Math.max(0, streak) * 5
  return base + speedBonus + streakBonus
}
