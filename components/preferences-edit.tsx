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
  resetScore: () => void
  canResetScore: boolean
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
    <form
      onSubmit={event => {
        event.preventDefault()
        save()
      }}
    >
      <h2 className="title lh-solid mt0 mb3 f2">{t('preferences')}</h2>

      <label className="field" htmlFor="pref-cups">
        <span className="field-label">
          <span>{t('numOfCup')}</span>
          <strong dir="ltr">{numberOfCups}</strong>
        </span>
        <input
          id="pref-cups"
          type="range"
          className="w-100"
          step={1}
          min={MIN_NUMBER_OF_CUPS}
          max={MAX_NUMBER_OF_CUPS}
          value={numberOfCups}
          onChange={event => setNumberOfCups(Number(event.target.value))}
        />
      </label>

      <label className="field" htmlFor="pref-interval">
        <span className="field-label">
          <span>{t('shuffleInterval')}</span>
          <strong dir="ltr">{shuffleIntervalMs} ms</strong>
        </span>
        <input
          id="pref-interval"
          type="range"
          className="w-100"
          step={10}
          min={MIN_SHUFFLE_INTERVAL_MS}
          max={MAX_SHUFFLE_INTERVAL_MS}
          value={shuffleIntervalMs}
          onChange={event => setShuffleIntervalMs(Number(event.target.value))}
        />
      </label>

      <div className="field">
        <span className="field-label" id="pref-lang-label">
          <span>{t('lang')}</span>
        </span>
        <LanguageSwitch labelledBy="pref-lang-label" lang={lang} change={setLang} />
      </div>

      <div className="mt4 flex items-center flex-wrap" style={{ gap: '.75rem' }}>
        <button type="submit" className="btn btn-primary">{t('save')}</button>
        <button type="button" onClick={props.cancel} className="btn btn-ghost">{t('cancel')}</button>
        <button
          type="button"
          onClick={props.resetScore}
          disabled={!props.canResetScore}
          className="btn btn-text ml-auto"
          style={{ marginLeft: 'auto' }}
        >
          {t('resetScore')}
        </button>
      </div>
    </form>
  )
}
