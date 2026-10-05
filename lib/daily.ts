import type { RandomSource } from './game'

/** Day 1 of the daily challenge. Days are counted in the player's local calendar, like most daily puzzles. */
const EPOCH = new Date(2026, 9, 5) // 5 October 2026, local time
export const DAILY_ROUNDS = 5

export interface DailyRound {
  numberOfCups: number
  shuffleSteps: number
  shuffleIntervalMs: number
}

export interface DailyResult {
  key: string
  found: boolean[]
  points: number
}

/** Local calendar date as YYYY-MM-DD. */
export function dailyKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 1-based puzzle number for the day. */
export function dailyNumber(date: Date = new Date()): number {
  const start = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate())
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.max(1, Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1)
}

/** FNV-1a 32-bit hash of a string. */
export function hashString(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Small deterministic PRNG (mulberry32). Same seed, same sequence, on every machine. */
export function createSeededRandom(seed: number): RandomSource {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function dailySeed(key: string): number {
  return hashString(`cup-game-daily:${key}`)
}

/** The same five rounds for everyone on a given day: more cups and faster shuffles as it goes. */
export function dailyPlan(key: string): DailyRound[] {
  const random = createSeededRandom(dailySeed(key) ^ 0x9e3779b9)
  const cups = [3, 3, 4, 4, 5]
  return cups.map((numberOfCups, index) => ({
    numberOfCups,
    shuffleSteps: 8 + index * 2 + Math.floor(random() * 2),
    shuffleIntervalMs: Math.round(520 - index * 70 - random() * 40)
  }))
}

/** Random source for round `index` of the day; independent per round so a replayed round is identical. */
export function dailyRoundRandom(key: string, index: number): RandomSource {
  return createSeededRandom(dailySeed(key) + (index + 1) * 0x85ebca6b)
}

export function dailyRoundPoints(round: DailyRound, index: number): number {
  return round.numberOfCups * 10 + Math.round((1200 - round.shuffleIntervalMs) / 50) + index * 5
}

/** Text for the share button; emoji squares are safe in every chat app. */
export function shareText(number: number, result: DailyResult, url: string): string {
  const found = result.found.filter(Boolean).length
  const row = result.found.map(ok => (ok ? '🟩' : '🟥')).join('')
  return `Cup Game #${number} · ${found}/${result.found.length} · ${result.points} pts\n${row}\n${url}`
}
