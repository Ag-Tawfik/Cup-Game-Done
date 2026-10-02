import React, { useEffect } from 'react'
import { useReward } from 'react-rewards'

import { t } from '../lang'
import { asset } from '../lib/assets'

interface Props {
  play: () => void
  /** GB won in the previous round, or null when no round has been played yet. */
  gbWon: number | null
}

const REWARD_ANCHOR_ID = 'play-button-reward'

export default function AskPlay({ play, gbWon }: Props) {
  const { reward } = useReward(REWARD_ANCHOR_ID, 'confetti')

  useEffect(() => {
    if (gbWon !== null) reward()
    // Only fire once per mount: the component remounts after every round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tc">
      <div className="mv4">
        <div className="f1 the-cup-game"><strong>THE CUP GAME</strong></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w3" src={asset('/images/cup.png')} alt="" />
      </div>
      <div className="mv4">
        <button className="get-started" onClick={play}>
          <span id={REWARD_ANCHOR_ID} />
          <span className="circle" aria-hidden="true">
            <span className="icon arrow"></span>
          </span>
          <span className="button-text">{t('play')}</span>
        </button>
        <div className="mv3 white">
          {gbWon !== null && <div>{t('rightSelection', { GB: gbWon })}</div>}
        </div>
      </div>
    </div>
  )
}
