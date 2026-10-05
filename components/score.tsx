import React from 'react'
import { t } from '../lang'

interface Props {
  score: number
  best: number
  streak: number
}

export default function Score({ score, best, streak }: Props) {
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
