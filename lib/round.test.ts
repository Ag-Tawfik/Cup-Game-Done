import { describe, expect, it } from 'vitest'
import { ballPosition, beginShuffle, finishReveal, isWin, pick, settle, shuffleStep, startRound } from './round'

const zero = () => 0

function shuffledRound(cups = 3, steps = 3) {
  let s = beginShuffle(finishReveal(startRound(cups, zero)), steps)
  for (let i = 0; i < steps; i++) s = shuffleStep(s, zero)
  return settle(s)
}

describe('round lifecycle', () => {
  it('starts by revealing the cup that hides the ball', () => {
    const s = startRound(3, zero)
    expect(s.phase).toBe('revealing')
    expect(s.openedCup).toBe(s.ballUnder)
    expect(s.cups).toContain(s.ballUnder)
  })

  it('cup ids are opaque and unique', () => {
    const s = startRound(5)
    expect(new Set(s.cups).size).toBe(5)
    for (const id of s.cups) expect(id).not.toMatch(/^\d+$/)
  })

  it('cannot shuffle or pick while revealing', () => {
    const s = startRound(3, zero)
    expect(beginShuffle(s, 8)).toBe(s)
    expect(pick(s, s.cups[0])).toBe(s)
  })

  it('cannot pick before shuffling', () => {
    const s = finishReveal(startRound(3, zero))
    expect(s.phase).toBe('ready')
    expect(pick(s, s.cups[0])).toBe(s)
  })

  it('counts shuffle steps down and then settles', () => {
    let s = beginShuffle(finishReveal(startRound(3, zero)), 2)
    expect(s.phase).toBe('shuffling')
    s = shuffleStep(s, zero)
    expect(s.phase).toBe('shuffling')
    s = shuffleStep(s, zero)
    expect(s.phase).toBe('settling')
    expect(pick(s, s.cups[0])).toBe(s)
    s = settle(s)
    expect(s.phase).toBe('shuffled')
  })

  it('keeps the ball under the same physical cup through the shuffle and re-keying', () => {
    let s = beginShuffle(finishReveal(startRound(4, () => 0.6)), 5)
    const before = s.cups.indexOf(s.ballUnder)
    let position = before
    for (let i = 0; i < 5; i++) {
      s = shuffleStep(s, Math.random)
      position = s.cups.indexOf(s.ballUnder)
      expect(position).toBeGreaterThanOrEqual(0)
    }
    const settled = settle(s)
    expect(settled.cups.indexOf(settled.ballUnder)).toBe(position)
    // Every id has been re-issued so reveal-time identities no longer match.
    for (const id of s.cups) expect(settled.cups).not.toContain(id)
  })

  it('a second pick is ignored once resolving (no double credit)', () => {
    const s = shuffledRound()
    const first = pick(s, s.ballUnder)
    expect(first.phase).toBe('resolving')
    const other = s.cups.find(c => c !== s.ballUnder)!
    expect(pick(first, other)).toBe(first)
    expect(beginShuffle(first, 8)).toBe(first)
  })

  it('resolves wins and losses', () => {
    const s = shuffledRound()
    expect(isWin(pick(s, s.ballUnder))).toBe(true)
    const wrong = s.cups.find(c => c !== s.ballUnder)!
    expect(isWin(pick(s, wrong))).toBe(false)
    expect(isWin(s)).toBe(false)
  })

  it('ignores picks of unknown cups', () => {
    const s = shuffledRound()
    expect(pick(s, 'nope')).toBe(s)
  })

  it('reports the 1-based position of the ball', () => {
    const s = startRound(3, () => 0.99)
    expect(ballPosition(s)).toBe(3)
  })
})
