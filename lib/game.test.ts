import { describe, expect, it } from 'vitest'
import {
  clampNumberOfCups,
  clampShuffleInterval,
  createCups,
  gbValueForCup,
  labelForCup,
  shuffleCups
} from './game'

describe('createCups', () => {
  it('numbers cups from 1 to n', () => {
    expect(createCups(3)).toEqual([1, 2, 3])
    expect(createCups(5)).toEqual([1, 2, 3, 4, 5])
  })

  it('rejects invalid counts', () => {
    expect(() => createCups(0)).toThrow(RangeError)
    expect(() => createCups(2.5)).toThrow(RangeError)
  })
})

describe('labels and values', () => {
  it('ties the GB value to the cup number', () => {
    for (const cup of createCups(5)) {
      expect(gbValueForCup(cup)).toBe(cup)
      expect(labelForCup(cup)).toBe(`${cup}GB`)
    }
  })
})

describe('shuffleCups', () => {
  it('returns a permutation of the input', () => {
    const cups = createCups(5)
    for (let i = 0; i < 200; i++) {
      const shuffled = shuffleCups(cups)
      expect([...shuffled].sort()).toEqual([...cups].sort())
    }
  })

  it('never returns the same order for two or more cups', () => {
    const cups = createCups(3)
    for (let i = 0; i < 500; i++) {
      expect(shuffleCups(cups)).not.toEqual(cups)
    }
  })

  it('falls back to a rotation when the random source keeps producing the identity', () => {
    // random() -> 0.999 keeps every element in place in Fisher-Yates.
    expect(shuffleCups([1, 2, 3], () => 0.999)).toEqual([2, 3, 1])
  })

  it('does not mutate the input', () => {
    const cups = createCups(4)
    shuffleCups(cups)
    expect(cups).toEqual([1, 2, 3, 4])
  })

  it('handles single-cup and empty inputs', () => {
    expect(shuffleCups([1])).toEqual([1])
    expect(shuffleCups([])).toEqual([])
  })
})

describe('clamping', () => {
  it('keeps settings in the supported range', () => {
    expect(clampNumberOfCups(1)).toBe(3)
    expect(clampNumberOfCups(9)).toBe(5)
    expect(clampNumberOfCups(4)).toBe(4)
    expect(clampShuffleInterval(10)).toBe(200)
    expect(clampShuffleInterval(5000)).toBe(1200)
    expect(clampShuffleInterval(450)).toBe(450)
  })
})
