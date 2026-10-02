import React, { useState } from 'react'

import { t, type LanguageCode } from '../lang'
import {
  MAX_NUMBER_OF_CUPS,
  MAX_SHUFFLE_INTERVAL_MS,
  MIN_NUMBER_OF_CUPS,
  MIN_SHUFFLE_INTERVAL_MS,
  clampNumberOfCups,
  clampShuffleInterval
} from '../lib/game'
import LanguageSwitch from './language-switch'

export interface Preferences {
  numberOfCups: number
  shuffleIntervalMs: number
  lang: LanguageCode
}

interface Props extends Preferences {
  done: (preferences: Preferences) => void
  cancel: () => void
}

export default function PreferencesEdit(props: Props) {
  const [numberOfCups, setNumberOfCups] = useState(props.numberOfCups)
  const [shuffleIntervalMs, setShuffleIntervalMs] = useState(props.shuffleIntervalMs)
  const [lang, setLang] = useState<LanguageCode>(props.lang)

  const save = () =>
    props.done({
      numberOfCups: clampNumberOfCups(numberOfCups),
      shuffleIntervalMs: clampShuffleInterval(shuffleIntervalMs),
      lang
    })

  return (
    <div>
      <h1 className="lh-solid mt0 mb2">{t('preferences')}</h1>
      <div className="mv3">
        {t('numOfCup')} : {numberOfCups}<br />
        <input
          type="range"
          className="w-100"
          aria-label={t('numOfCup')}
          step={1}
          min={MIN_NUMBER_OF_CUPS}
          max={MAX_NUMBER_OF_CUPS}
          value={numberOfCups}
          onChange={event => setNumberOfCups(Number(event.target.value))}
        />
      </div>
      <div className="mv3">
        {t('shuffleInterval')}: {shuffleIntervalMs}ms<br />
        <input
          type="range"
          className="w-100"
          aria-label={t('shuffleInterval')}
          step={10}
          min={MIN_SHUFFLE_INTERVAL_MS}
          max={MAX_SHUFFLE_INTERVAL_MS}
          value={shuffleIntervalMs}
          onChange={event => setShuffleIntervalMs(Number(event.target.value))}
        />
      </div>
      <div>
        {t('lang')}<br />
        <LanguageSwitch lang={lang} change={setLang} label={t('lang')} />
      </div>
      <div className="mt4">
        <button onClick={save} className="ph3 pv2 mh3 bn bg-blue white light-shadow pointer">{t('save')}</button>
        <button onClick={props.cancel} className="ph3 pv2 mh3 bn bg-transparent light-shadow pointer">{t('cancel')}</button>
      </div>
    </div>
  )
}
