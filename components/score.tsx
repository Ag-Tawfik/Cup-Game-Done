import React from 'react'
import { t } from '../lang'
import { DAILY_ROUNDS } from '../lib/daily'

interface Props {
  score: number
  best: number
  streak: number
  /** When set, the chip shows daily progress instead of free-play stats. */
  daily?: { number: number; round: number; found: number } | null
}

export default function Score({ score, best, streak, daily }: Props) {
  if (daily) {
    return (
      <div className="chip chip-score ui" aria-live="polite" data-daily-chip>
        <dl>
          <div>
            <dt>{t('daily', { N: daily.number })}</dt>
            <dd>{t('dailyRound', { ROUND: daily.round, TOTAL: DAILY_ROUNDS })}</dd>
          </div>
          <div>
            <dt>{t('score')}</dt>
            <dd data-stat="daily-found">{daily.found}</dd>
          </div>
        </dl>
      </div>
    )
  }
  return (
    <div className="chip chip-score ui" aria-live="polite">
      <dl>
        <div>
          <dt>{t('score')}</dt>
          <dd data-stat="score">{score}</dd>
        </div>
        <div>
          <dt>{t('best')}</dt>
          <dd data-stat="best">{best}</dd>
        </div>
        <div>
          <dt>{t('streak')}</dt>
          <dd data-stat="streak">{streak}</dd>
        </div>
      </dl>
    </div>
  )
}
