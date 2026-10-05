import { createCups, shuffleCups, type RandomSource } from './game'

/**
 * revealing: the cup hiding the ball is lifted so the player sees where it is.
 * ready:     the player may shuffle.
 * shuffling: cups are moving; input is ignored.
 * settling:  the last move is still animating; input is ignored.
 * shuffled:  the player may pick a cup, or shuffle again.
 * resolving: a cup has been picked; the result is being shown. No further input.
 */
export type Phase = 'revealing' | 'ready' | 'shuffling' | 'settling' | 'shuffled' | 'resolving'

export interface RoundState {
  /** Cup ids in left-to-right order. Ids are opaque tokens, not values. */
  cups: string[]
  /** Id of the cup hiding the ball. Lives only in memory, never in the DOM. */
  ballUnder: string
  phase: Phase
  /** Cup currently lifted, if any. */
  openedCup: string | null
  /** Cup the player picked, once resolving. */
  picked: string | null
  shuffleStepsLeft: number
}

let roundCounter = 0

function freshIds(count: number): string[] {
  roundCounter += 1
  return createCups(count).map(n => `r${roundCounter}-c${n}-${Math.random().toString(36).slice(2, 8)}`)
}

export function startRound(numberOfCups: number, random: RandomSource = Math.random): RoundState {
  const cups = freshIds(numberOfCups)
  const ballUnder = cups[Math.floor(random() * cups.length)]
  return { cups, ballUnder, phase: 'revealing', openedCup: ballUnder, picked: null, shuffleStepsLeft: 0 }
}

export function finishReveal(state: RoundState): RoundState {
  if (state.phase !== 'revealing') return state
  return { ...state, phase: 'ready', openedCup: null }
}

export function beginShuffle(state: RoundState, steps: number): RoundState {
  if (state.phase !== 'ready' && state.phase !== 'shuffled') return state
  return { ...state, phase: 'shuffling', openedCup: null, shuffleStepsLeft: Math.max(1, steps) }
}

export function shuffleStep(state: RoundState, random: RandomSource = Math.random): RoundState {
  if (state.phase !== 'shuffling') return state
  const stepsLeft = state.shuffleStepsLeft - 1
  return {
    ...state,
    cups: shuffleCups(state.cups, random),
    shuffleStepsLeft: stepsLeft,
    phase: stepsLeft <= 0 ? 'settling' : 'shuffling'
  }
}

/**
 * Called once the final move has finished animating. Cup ids are re-issued here so
 * an element identity observed during the reveal cannot be matched after the shuffle.
 */
export function settle(state: RoundState): RoundState {
  if (state.phase !== 'settling') return state
  const next = freshIds(state.cups.length)
  const ballIndex = state.cups.indexOf(state.ballUnder)
  return { ...state, cups: next, ballUnder: next[ballIndex], phase: 'shuffled' }
}

export function pick(state: RoundState, cup: string): RoundState {
  if (state.phase !== 'shuffled' || !state.cups.includes(cup)) return state
  return { ...state, phase: 'resolving', picked: cup, openedCup: cup }
}

export function isWin(state: RoundState): boolean {
  return state.phase === 'resolving' && state.picked === state.ballUnder
}

/** 1-based left-to-right position of the ball, for announcements. */
export function ballPosition(state: RoundState): number {
  return state.cups.indexOf(state.ballUnder) + 1
}
