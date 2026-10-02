import React from 'react'
import { t } from '../lang'

interface Props {
  score: number
}

export default function Score({ score }: Props) {
  return (
    <div className="chip chip-score tabular" aria-live="polite">
      <span className="ink-soft">{t('score')}:</span> <strong>{score}</strong>
    </div>
  )
}
