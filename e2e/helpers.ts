import { expect, type Page } from '@playwright/test'
import { beginShuffle, finishReveal, settle, shuffleStep, startRound } from '../lib/round'
import { shuffleStepsFor } from '../lib/scoring'

/** Deterministic Math.random for the page and for replaying the round in the test. */
export const ZERO = () => 0

export async function makeDeterministic(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
}

/** Replays the round logic with the same random source to learn where the ball ends up. */
export function expectedBallPosition(numberOfCups: number, streak: number): number {
  let s = beginShuffle(finishReveal(startRound(numberOfCups, ZERO)), shuffleStepsFor(streak))
  while (s.phase === 'shuffling') s = shuffleStep(s, ZERO)
  s = settle(s)
  return s.cups.indexOf(s.ballUnder) + 1
}

export const cup = (page: Page, position: number) => page.locator(`.cups button[aria-label^="Cup ${position} "], .cups button[aria-label^="Bardak ${position} "]`)
export const cups = (page: Page) => page.locator('.cups button')
export const status = (page: Page) => page.locator('.rule-text').first()
export const stat = (page: Page, name: 'score' | 'best' | 'streak') => page.locator(`[data-stat="${name}"]`)
export const playButton = (page: Page) => page.locator('button.get-started')
export const shuffleButton = (page: Page) => page.locator('section button.btn-text')

export async function startRoundInBrowser(page: Page) {
  await playButton(page).click()
  await expect(cups(page).first()).toBeVisible()
}

export async function waitForReady(page: Page) {
  await expect(status(page)).not.toContainText(/under cup \d|bardağın altında\./, { timeout: 8000 })
  await expect(shuffleButton(page)).toBeEnabled()
}

export async function shuffleAndWait(page: Page) {
  await shuffleButton(page).click()
  await expect(shuffleButton(page)).toBeDisabled()
  await expect(cups(page).first()).toBeEnabled({ timeout: 20000 })
}
