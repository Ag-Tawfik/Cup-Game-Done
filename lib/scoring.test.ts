import { describe, expect, it } from 'vitest'
import { MAX_SHUFFLE_INTERVAL_MS, MIN_SHUFFLE_INTERVAL_MS } from './game'
import { BASE_SHUFFLE_STEPS, MAX_SHUFFLE_STEPS, intervalFor, pointsFor, shuffleStepsFor } from './scoring'

describe('difficulty ramp', () => {
  it('adds one shuffle step per streak, capped', () => {
    expect(shuffleStepsFor(0)).toBe(BASE_SHUFFLE_STEPS)
    expect(shuffleStepsFor(3)).toBe(BASE_SHUFFLE_STEPS + 3)
    expect(shuffleStepsFor(100)).toBe(MAX_SHUFFLE_STEPS)
    expect(shuffleStepsFor(-5)).toBe(BASE_SHUFFLE_STEPS)
  })

  it('speeds up with streak and respects the bounds', () => {
    expect(intervalFor(450, 0)).toBe(450)
    expect(intervalFor(450, 1)).toBeLessThan(450)
    expect(intervalFor(450, 200)).toBe(MIN_SHUFFLE_INTERVAL_MS)
    expect(intervalFor(99999, 0)).toBe(MAX_SHUFFLE_INTERVAL_MS)
  })
})

describe('points', () => {
  it('rewards more cups, faster shuffles and longer streaks', () => {
    const base = pointsFor(3, MAX_SHUFFLE_INTERVAL_MS, 0)
    expect(base).toBe(30)
    expect(pointsFor(5, MAX_SHUFFLE_INTERVAL_MS, 0)).toBeGreaterThan(base)
    expect(pointsFor(3, MIN_SHUFFLE_INTERVAL_MS, 0)).toBeGreaterThan(base)
    expect(pointsFor(3, MAX_SHUFFLE_INTERVAL_MS, 4)).toBeGreaterThan(base)
  })

  it('is always a positive integer', () => {
    for (const cups of [3, 4, 5]) for (const ms of [200, 450, 1200]) for (const streak of [0, 1, 9]) {
      const p = pointsFor(cups, ms, streak)
      expect(Number.isInteger(p)).toBe(true)
      expect(p).toBeGreaterThan(0)
    }
  })
})
