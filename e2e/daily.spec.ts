import { expect, test } from '@playwright/test'
import { dailyKey, dailyPlan, dailyRoundRandom, DAILY_ROUNDS } from '../lib/daily'
import { beginShuffle, finishReveal, settle, shuffleStep, startRound } from '../lib/round'
import { cup, cups, playButton, shuffleAndWait, shuffleButton, status, waitForReady } from './helpers'

// Freeze the calendar so every run plays the same daily puzzle.
const FIXED = new Date(2026, 9, 7, 12, 0, 0) // local time, daily #3
const KEY = dailyKey(FIXED)

function expectedBallPosition(round: number): number {
  const plan = dailyPlan(KEY)[round]
  const random = dailyRoundRandom(KEY, round)
  let s = beginShuffle(finishReveal(startRound(plan.numberOfCups, random)), plan.shuffleSteps)
  while (s.phase === 'shuffling') s = shuffleStep(s, random)
  s = settle(s)
  return s.cups.indexOf(s.ballUnder) + 1
}

test.describe('daily challenge', () => {
  test.beforeEach(async ({ page }) => {
    // Pin "today" without touching timers or animation clocks: only the no-argument Date forms are fixed.
    await page.addInitScript((fixedMs: number) => {
      const RealDate = Date
      class FixedDate extends RealDate {
        constructor(...args: unknown[]) {
          // Only the no-argument form is pinned; explicit dates still construct normally.
          if (args.length === 0) super(fixedMs)
          else super(...(args as [number]))
        }
        static now() {
          return fixedMs
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).Date = FixedDate
    }, FIXED.getTime())
    await page.goto('/')
  })

  test('five scripted rounds, one shuffle each, shareable result that persists for the day', async ({ page, context, browserName }) => {
    // Five full rounds of reveal, shuffle and result take well over Playwright's 30 s default.
    test.setTimeout(120_000)
    const dailyButton = page.locator('[data-daily]')
    await expect(dailyButton).toBeEnabled()
    await expect(dailyButton).toContainText('Daily #3')
    await dailyButton.click()

    const plan = dailyPlan(KEY)
    const loseIn = 2 // deliberately miss round 3
    for (let round = 0; round < DAILY_ROUNDS; round++) {
      await expect(page.locator('[data-daily-chip]')).toContainText(`Round ${round + 1} of ${DAILY_ROUNDS}`)
      await expect(cups(page)).toHaveCount(plan[round].numberOfCups)
      await expect(status(page)).toContainText('The ball is under cup')
      await waitForReady(page)
      await shuffleAndWait(page)
      // The daily gives exactly one shuffle.
      await expect(shuffleButton(page)).toBeDisabled()
      const winning = expectedBallPosition(round)
      const pickPosition = round === loseIn ? (winning === 1 ? 2 : 1) : winning
      await cup(page, pickPosition).click()
      if (round < DAILY_ROUNDS - 1) {
        await expect(page.locator('[data-daily-chip]')).toContainText(`Round ${round + 2} of ${DAILY_ROUNDS}`, { timeout: 6000 })
      }
    }

    await expect(playButton(page)).toBeVisible({ timeout: 6000 })
    const summary = page.locator('[data-daily-summary]')
    await expect(summary).toContainText(`4/${DAILY_ROUNDS} found`)
    await expect(summary.locator('.squares')).toHaveText('🟩🟩🟥🟩🟩')
    await expect(dailyButton).toBeDisabled()
    await expect(dailyButton).toContainText('Played today')
    // Free-play stats are untouched by the daily.
    await expect(page.locator('[data-stat="score"]')).toHaveText('0')

    // Share copies the result text (desktop Chromium exposes the clipboard; mobile emulation may not).
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
      await page.locator('[data-share]').click()
      const copied = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '')
      if (copied) {
        expect(copied).toMatch(/^Cup Game #3 · 4\/5 · \d+ pts\n🟩🟩🟥🟩🟩\nhttps:\/\//)
      }
    }

    await page.reload()
    await expect(page.locator('[data-daily-summary]')).toContainText(`4/${DAILY_ROUNDS} found`)
    await expect(dailyButton).toBeDisabled()
  })

  test('a new day offers a new puzzle and the old result is dropped', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('cup-game:v1', JSON.stringify({ daily: { key: '2026-10-06', found: [true, true, true, true, true], points: 300 } }))
    })
    await page.reload()
    const dailyButton = page.locator('[data-daily]')
    await expect(dailyButton).toBeEnabled()
    await expect(page.locator('[data-daily-summary]')).toHaveCount(0)
  })
})
