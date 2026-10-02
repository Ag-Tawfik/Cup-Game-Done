import React from 'react'
import { getAvailableLanguages, isLanguageCode, type LanguageCode } from '../lang'

interface Props {
  id: string
  lang: LanguageCode
  change: (lang: LanguageCode) => void
}

const LANGUAGES = getAvailableLanguages()

export default function LanguageSwitch({ id, lang, change }: Props) {
  return (
    <select
      id={id}
      className="select"
      value={lang}
      onChange={event => {
        const code = event.target.value
        if (isLanguageCode(code)) change(code)
      }}
    >
      {LANGUAGES.map(code => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
