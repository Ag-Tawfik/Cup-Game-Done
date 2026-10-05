import { describe, expect, it } from 'vitest'
import { load, save, type Persisted } from './storage'

const defaults: Persisted = { score: 0, best: 0, streak: 0, bestStreak: 0, numberOfCups: 3, shuffleIntervalMs: 450, lang: 'en', daily: null }

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    dump: () => Object.fromEntries(map)
  }
}

describe('storage', () => {
  it('round-trips', () => {
    const s = memoryStorage()
    const data = { ...defaults, score: 120, best: 340, streak: 2, bestStreak: 4, numberOfCups: 5, shuffleIntervalMs: 300, lang: 'tr', daily: { key: '2026-10-05', found: [true, false, true, true, true], points: 180 } }
    save(data, s)
    expect(load(defaults, s)).toEqual(data)
  })

  it('returns defaults when storage is missing or empty', () => {
    expect(load(defaults, null)).toEqual(defaults)
    expect(load(defaults, memoryStorage())).toEqual(defaults)
  })

  it('survives corrupt or hostile values', () => {
    expect(load(defaults, memoryStorage({ 'cup-game:v1': '{not json' }))).toEqual(defaults)
    const s = memoryStorage({ 'cup-game:v1': JSON.stringify({ score: -5, best: 'x', numberOfCups: 99, shuffleIntervalMs: 1, lang: 7 }) })
    expect(load(defaults, s)).toEqual({ ...defaults, numberOfCups: 5, shuffleIntervalMs: 200 })
    const bad = memoryStorage({ 'cup-game:v1': JSON.stringify({ daily: { key: 1, found: ['x'] } }) })
    expect(load(defaults, bad).daily).toBeNull()
  })

  it('does not throw when saving fails', () => {
    const throwing = { setItem: () => { throw new Error('quota') } }
    expect(() => save(defaults, throwing)).not.toThrow()
  })
})
