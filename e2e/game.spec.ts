import { expect, test } from '@playwright/test'
import {
  cup, cups, expectedBallPosition, makeDeterministic, playButton, shuffleAndWait, shuffleButton,
  startRoundInBrowser, stat, status, waitForReady
} from './helpers'

test.describe('round flow', () => {
  test.beforeEach(async ({ page }) => {
    await makeDeterministic(page)
    await page.goto('/')
  })

  test('reveal gates input, shuffle gates input, correct pick scores and extends the streak', async ({ page }) => {
    await expect(stat(page, 'score')).toHaveText('0')
    await startRoundInBrowser(page)

    await expect(status(page)).toContainText('The ball is under cup')
    await expect(cups(page).first()).toBeDisabled()
    await expect(shuffleButton(page)).toBeDisabled()
    await expect(page.locator('.ball')).toHaveCount(1)

    await waitForReady(page)
    await expect(cups(page).first()).toBeDisabled()
    await expect(page.locator('.ball')).toHaveCount(0)

    await shuffleAndWait(page)
    await expect(page.locator('.ball')).toHaveCount(0)

    const winning = expectedBallPosition(3, 0)
    await cup(page, winning).click()
    await expect(cups(page).nth(0)).toBeDisabled()
    await expect(playButton(page)).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-result="won"]')).toContainText('Found it. +')
    await expect(stat(page, 'score')).not.toHaveText('0')
    await expect(stat(page, 'streak')).toHaveText('1')
    await expect(stat(page, 'best')).toHaveText(await stat(page, 'score').innerText())
  })

  test('wrong pick shows where the ball was and resets the streak', async ({ page }) => {
    await startRoundInBrowser(page)
    await waitForReady(page)
    await shuffleAndWait(page)
    const winning = expectedBallPosition(3, 0)
    const wrong = winning === 1 ? 2 : 1
    await cup(page, wrong).click()
    // The ball is revealed under the true cup before the round ends.
    await expect(page.locator('.ball')).toHaveCount(1, { timeout: 3000 })
    await expect(playButton(page)).toBeVisible({ timeout: 6000 })
    await expect(page.locator('[data-result="lost"]')).toContainText(`The ball was under cup ${winning}`)
    await expect(stat(page, 'score')).toHaveText('0')
    await expect(stat(page, 'streak')).toHaveText('0')
  })

  test('a second click during the result delay is ignored (no double credit)', async ({ page }) => {
    await startRoundInBrowser(page)
    await waitForReady(page)
    await shuffleAndWait(page)
    const winning = expectedBallPosition(3, 0)
    await cup(page, winning).click()
    await cup(page, winning).click({ force: true }).catch(() => {})
    await cup(page, winning === 1 ? 2 : 1).click({ force: true }).catch(() => {})
    await shuffleButton(page).click({ force: true }).catch(() => {})
    await expect(playButton(page)).toBeVisible({ timeout: 5000 })
    await expect(stat(page, 'streak')).toHaveText('1')
    const score = Number(await stat(page, 'score').innerText())
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })

  test('cup labels and markup never expose which cup hides the ball', async ({ page }) => {
    await startRoundInBrowser(page)
    await waitForReady(page)
    await shuffleAndWait(page)
    const labels = await cups(page).evaluateAll(els => els.map(e => e.getAttribute('aria-label')))
    expect(labels).toEqual(['Cup 1 of 3', 'Cup 2 of 3', 'Cup 3 of 3'])
    expect(await page.locator('.ball').count()).toBe(0)
    const html = await page.locator('.cups').innerHTML()
    expect(html).not.toMatch(/ball/i)
  })
})

test.describe('settings and persistence', () => {
  test('language, cup count and score survive a reload; language reverts never', async ({ page }) => {
    await makeDeterministic(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.locator('.prefs-modal--open')).toBeVisible()
    await page.getByRole('radio', { name: 'TR' }).check()
    await page.locator('#pref-cups').fill('4')
    await page.locator('.prefs-modal button[type=submit]').click()
    await expect(page.locator('.prefs-modal')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
    await expect(page.locator('dt').first()).toHaveText('Puan')

    await startRoundInBrowser(page)
    await expect(cups(page)).toHaveCount(4)
    await waitForReady(page)
    await shuffleAndWait(page)
    await cup(page, expectedBallPosition(4, 0)).click()
    await expect(playButton(page)).toBeVisible({ timeout: 5000 })
    const score = await stat(page, 'score').innerText()
    expect(Number(score)).toBeGreaterThan(0)

    await page.reload()
    await expect(stat(page, 'score')).toHaveText(score)
    await expect(stat(page, 'streak')).toHaveText('1')
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')

    // Reopen, change only the interval, save: language must stay Turkish.
    await page.getByRole('button', { name: 'Ayarlar' }).click()
    await expect(page.getByRole('radio', { name: 'TR' })).toBeChecked()
    await page.locator('#pref-interval').fill('300')
    await page.locator('.prefs-modal button[type=submit]').click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')

    // Reset score clears score and streak but keeps the best.
    await page.getByRole('button', { name: 'Ayarlar' }).click()
    await page.getByRole('button', { name: 'Puanı sıfırla' }).click()
    await expect(stat(page, 'score')).toHaveText('0')
    await expect(stat(page, 'streak')).toHaveText('0')
    await expect(stat(page, 'best')).toHaveText(score)
  })

  test('Arabic flips the document to right-to-left and translates the UI', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('radio', { name: 'AR' }).check()
    await page.locator('.prefs-modal button[type=submit]').click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('dt').first()).toHaveText('النقاط')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await page.getByRole('button', { name: 'الإعدادات' }).click()
    await page.getByRole('radio', { name: 'EN' }).check()
    await page.locator('.prefs-modal button[type=submit]').click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  })

  test('settings are unavailable during a round and Escape closes the dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.locator('.prefs-modal--open')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.prefs-modal')).toHaveCount(0)
    await startRoundInBrowser(page)
    await expect(page.getByRole('button', { name: 'Settings' })).toHaveCount(0)
  })
})

test.describe('layout', () => {
  test('five cups stay on one row and the page never scrolls sideways', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.locator('#pref-cups').fill('5')
    await page.locator('.prefs-modal button[type=submit]').click()
    await startRoundInBrowser(page)
    await expect(cups(page)).toHaveCount(5)
    const tops = await page.locator('.cups .cup-col').evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().top)))
    expect(new Set(tops).size).toBe(1)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })

  test('keyboard users get a visible focus ring on cups', async ({ page }) => {
    await makeDeterministic(page)
    await page.goto('/')
    await startRoundInBrowser(page)
    await waitForReady(page)
    await shuffleAndWait(page)
    await cup(page, 2).focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement as Element).boxShadow)
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe('Cup 2 of 3')
    expect(ring).not.toBe('none')
  })
})
