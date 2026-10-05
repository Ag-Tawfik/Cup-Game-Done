import React, { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'

import { t } from '../lang'
import { asset } from '../lib/assets'
import { DAILY_ROUNDS, shareText, type DailyResult } from '../lib/daily'

export interface LastResult {
  won: boolean
  points: number
  ballPosition: number
}

interface Props {
  play: () => void
  playDaily: () => void
  dailyNumber: number
  /** Today's completed daily result, or null if not played yet. */
  dailyResult: DailyResult | null
  /** Outcome of the previous free round, or null when none was played. */
  lastResult: LastResult | null
  /** True right after a daily challenge finished, to celebrate once. */
  dailyJustFinished: boolean
  shareUrl: string
}

const REWARD_ANCHOR_ID = 'play-button-reward'
const CONFETTI_COLORS = ['#de3d6b', '#26221d', '#f2b134', '#f5efe3']

export default function AskPlay({ play, playDaily, dailyNumber, dailyResult, lastResult, dailyJustFinished, shareUrl }: Props) {
  const { reward } = useReward(REWARD_ANCHOR_ID, 'confetti', {
    colors: CONFETTI_COLORS,
    elementCount: 70,
    spread: 70
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dailyWorthCelebrating = dailyJustFinished && dailyResult !== null && dailyResult.found.filter(Boolean).length >= 3
    if (lastResult?.won || dailyWorthCelebrating) reward()
    // Only fire once per mount: the component remounts after every round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const share = async () => {
    if (!dailyResult) return
    const text = shareText(t('shareLine', { N: dailyNumber, FOUND: dailyResult.found.filter(Boolean).length, TOTAL: dailyResult.found.length, POINTS: dailyResult.points }), dailyResult, shareUrl)
    try {
      if (typeof navigator.share === 'function' && navigator.canShare?.({ text })) {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // The user dismissed the sheet or the clipboard is blocked; nothing to do.
    }
  }

  const message = lastResult
    ? lastResult.won
      ? t('won', { POINTS: lastResult.points })
      : t('lost', { POS: lastResult.ballPosition })
    : ' '

  return (
    <section className="tc" aria-labelledby="game-title">
      <div className="mv4">
        <h1 id="game-title" className="logo rise balance" style={{ animationDelay: '0s' }}>THE CUP GAME</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w3 mt3 rise" style={{ animationDelay: '.1s' }} src={asset('/images/cup.png')} alt="" />
      </div>
      <div className="mv4 rise" style={{ animationDelay: '.2s' }}>
        <div className="start-actions">
          <button className="get-started" onClick={play}>
            <span id={REWARD_ANCHOR_ID} />
            <span className="circle" aria-hidden="true">
              <span className="icon arrow"></span>
            </span>
            <span className="button-text">{t('play')}</span>
          </button>
          <button type="button" className="btn btn-daily" onClick={playDaily} disabled={dailyResult !== null} data-daily>
            <span>{t('daily', { N: dailyNumber })}</span>
            <small>{dailyResult ? t('dailyPlayed') : t('dailyIntro')}</small>
          </button>
        </div>
        {dailyResult ? (
          <div className="daily-summary ui" data-daily-summary>
            <span className="squares" aria-hidden="true">{dailyResult.found.map(ok => (ok ? '🟩' : '🟥')).join('')}</span>
            <bdi>
              {t('dailySummary', { FOUND: dailyResult.found.filter(Boolean).length, TOTAL: DAILY_ROUNDS, POINTS: dailyResult.points })}
            </bdi>
            <button type="button" className="btn btn-primary" onClick={share} data-share>
              {copied ? t('copied') : t('share')}
            </button>
          </div>
        ) : (
          <p className="mv3 ink-soft rule-text result-text" aria-live="polite" data-result={lastResult ? (lastResult.won ? 'won' : 'lost') : ''}>
            {message}
          </p>
        )}
      </div>
    </section>
  )
}
