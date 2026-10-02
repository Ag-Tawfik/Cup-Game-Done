import React from 'react'
import { getAvailableLanguages, isLanguageCode, type LanguageCode } from '../lang'

interface Props {
  lang: LanguageCode
  change: (lang: LanguageCode) => void
  label: string
}

const LANGUAGES = getAvailableLanguages()

export default function LanguageSwitch({ lang, change, label }: Props) {
  return (
    <select
      aria-label={label}
      className="w-100 pa2 ba b--black-20 br2 bg-white"
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
