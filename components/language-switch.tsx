import React from 'react'
import Select, { type SingleValue } from 'react-select'
import { getAvailableLanguages, type LanguageCode } from '../lang'

interface Option {
  label: string
  value: LanguageCode
}

const OPTIONS: Option[] = getAvailableLanguages().map(code => ({
  label: code.toUpperCase(),
  value: code
}))

interface Props {
  lang: LanguageCode
  change: (lang: LanguageCode) => void
}

export default function LanguageSwitch({ lang, change }: Props) {
  return (
    <Select<Option>
      instanceId="language-switch"
      menuPlacement="top"
      value={OPTIONS.find(option => option.value === lang)}
      isSearchable={false}
      onChange={(option: SingleValue<Option>) => option && change(option.value)}
      options={OPTIONS}
    />
  )
}
