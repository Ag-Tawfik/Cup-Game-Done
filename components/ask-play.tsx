import React, { useEffect } from 'react'
import { useReward } from 'react-rewards'

import { t } from '../lang'
import { asset } from '../lib/assets'

export interface LastResult {
  won: boolean
  points: number
  ballPosition: number
}

interface Props {
  play: () => void
  /** Outcome of the previous round, or null when no round has been played yet. */
  lastResult: LastResult | null
}

const REWARD_ANCHOR_ID = 'play-button-reward'
const CONFETTI_COLORS = ['#de3d6b', '#26221d', '#f2b134', '#f5efe3']

export default function AskPlay({ play, lastResult }: Props) {
  const { reward } = useReward(REWARD_ANCHOR_ID, 'confetti', {
    colors: CONFETTI_COLORS,
    elementCount: 70,
    spread: 70
  })

  useEffect(() => {
    if (lastResult?.won) reward()
    // Only fire once per mount: the component remounts after every round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <button className="get-started" onClick={play}>
          <span id={REWARD_ANCHOR_ID} />
          <span className="circle" aria-hidden="true">
            <span className="icon arrow"></span>
          </span>
          <span className="button-text">{t('play')}</span>
        </button>
        <p className="mv3 ink-soft rule-text" aria-live="polite" data-result={lastResult ? (lastResult.won ? 'won' : 'lost') : ''}>
          {message}
        </p>
      </div>
    </section>
  )
}
