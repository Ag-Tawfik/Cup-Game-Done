import React from 'react'
import { getAvailableLanguages, isLanguageCode, type LanguageCode } from '../lang'

interface Props {
  /** id of the element that labels the group. */
  labelledBy: string
  lang: LanguageCode
  change: (lang: LanguageCode) => void
}

const LANGUAGES = getAvailableLanguages()

/** Two options do not need a dropdown: a segmented control shows both and never opens a browser-drawn popup. */
export default function LanguageSwitch({ labelledBy, lang, change }: Props) {
  return (
    <div className="segmented" role="radiogroup" aria-labelledby={labelledBy}>
      {LANGUAGES.map(code => (
        <label key={code} className="segmented-option">
          <input
            type="radio"
            name="language"
            value={code}
            checked={lang === code}
            onChange={event => {
              const next = event.target.value
              if (isLanguageCode(next)) change(next)
            }}
          />
          <span>{code.toUpperCase()}</span>
        </label>
      ))}
    </div>
  )
}
