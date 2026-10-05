import { describe, expect, it } from 'vitest'
import { createSeededRandom, dailyKey, dailyNumber, dailyPlan, dailyRoundRandom, dailyRoundPoints, hashString, shareText, DAILY_ROUNDS } from './daily'
import { beginShuffle, finishReveal, settle, shuffleStep, startRound } from './round'

describe('daily key and number', () => {
  it('uses the local calendar date', () => {
    expect(dailyKey(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05')
    expect(dailyKey(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01')
  })

  it('numbers days from the epoch, never below 1', () => {
    expect(dailyNumber(new Date(2026, 9, 5))).toBe(1)
    expect(dailyNumber(new Date(2026, 9, 6, 3))).toBe(2)
    expect(dailyNumber(new Date(2026, 10, 4))).toBe(31)
    expect(dailyNumber(new Date(2020, 0, 1))).toBe(1)
  })
})

describe('seeded random', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = createSeededRandom(123)
    const b = createSeededRandom(123)
    for (let i = 0; i < 100; i++) {
      const x = a()
      expect(x).toBe(b())
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('differs across seeds and hashes', () => {
    expect(createSeededRandom(1)()).not.toBe(createSeededRandom(2)())
    expect(hashString('2026-10-05')).not.toBe(hashString('2026-10-06'))
  })
})

describe('daily plan', () => {
  it('has five rounds that get harder, identical for the same day', () => {
    const plan = dailyPlan('2026-10-05')
    expect(plan).toHaveLength(DAILY_ROUNDS)
    expect(plan).toEqual(dailyPlan('2026-10-05'))
    expect(plan.map(r => r.numberOfCups)).toEqual([3, 3, 4, 4, 5])
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].shuffleIntervalMs).toBeLessThan(plan[i - 1].shuffleIntervalMs)
      expect(plan[i].shuffleSteps).toBeGreaterThanOrEqual(plan[i - 1].shuffleSteps)
    }
    expect(plan).not.toEqual(dailyPlan('2026-10-06'))
  })

  it('produces the same ball position for everyone', () => {
    const play = () => {
      const plan = dailyPlan('2026-10-05')[2]
      const random = dailyRoundRandom('2026-10-05', 2)
      let s = beginShuffle(finishReveal(startRound(plan.numberOfCups, random)), plan.shuffleSteps)
      while (s.phase === 'shuffling') s = shuffleStep(s, random)
      s = settle(s)
      return s.cups.indexOf(s.ballUnder)
    }
    expect(play()).toBe(play())
  })

  it('points rise with round index', () => {
    const plan = dailyPlan('2026-10-05')
    expect(dailyRoundPoints(plan[4], 4)).toBeGreaterThan(dailyRoundPoints(plan[0], 0))
  })
})

describe('share text', () => {
  it('formats number, score and a result row', () => {
    const text = shareText('Cup Game #7 · 3/5 · 123 pts', { key: '2026-10-11', found: [true, true, false, true, false], points: 123 }, 'https://x.test/')
    expect(text).toBe('Cup Game #7 · 3/5 · 123 pts\n🟩🟩🟥🟩🟥\nhttps://x.test/')
  })
})
