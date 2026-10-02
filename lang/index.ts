import en, { type Strings } from './en'
import tr from './tr'

const TABLES = { en, tr } satisfies Record<string, Strings>

export type LanguageCode = keyof typeof TABLES
export type StringKey = keyof Strings

const AVAILABLE = Object.keys(TABLES) as LanguageCode[]

let current: LanguageCode = 'en'

export function isLanguageCode(value: string): value is LanguageCode {
  return (AVAILABLE as string[]).includes(value)
}

export function setLanguage(code: string): LanguageCode {
  current = isLanguageCode(code) ? code : 'en'
  return current
}

export function getLanguage(): LanguageCode {
  return current
}

export function getAvailableLanguages(): LanguageCode[] {
  return [...AVAILABLE]
}

/** Looks up a string in the current language, filling `{NAME}` placeholders. */
export function t(key: StringKey, params: Record<string, string | number> = {}): string {
  const template = TABLES[current][key]
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}
