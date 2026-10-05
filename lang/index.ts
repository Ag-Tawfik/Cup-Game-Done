import en, { type Strings } from './en'
import tr from './tr'
import ar from './ar'

const TABLES = { en, tr, ar } satisfies Record<string, Strings>

const RTL: ReadonlySet<string> = new Set(['ar'])

export type LanguageCode = keyof typeof TABLES
export type StringKey = keyof Strings

const AVAILABLE = Object.keys(TABLES) as LanguageCode[]

let current: LanguageCode = 'en'

export function isLanguageCode(value: string): value is LanguageCode {
  return (AVAILABLE as string[]).includes(value)
}

export function isRightToLeft(code: LanguageCode): boolean {
  return RTL.has(code)
}

export function setLanguage(code: string): LanguageCode {
  current = isLanguageCode(code) ? code : 'en'
  if (typeof document !== 'undefined') {
    document.documentElement.lang = current
    document.documentElement.dir = isRightToLeft(current) ? 'rtl' : 'ltr'
  }
  return current
}

export function getLanguage(): LanguageCode {
  return current
}

export function getAvailableLanguages(): LanguageCode[] {
  return [...AVAILABLE]
}

/** Best supported language for a BCP 47 tag such as "tr-TR"; English otherwise. */
export function languageFromLocale(locale: string | undefined): LanguageCode {
  const primary = (locale ?? '').toLowerCase().split('-')[0]
  return isLanguageCode(primary) ? primary : 'en'
}

/** Looks up a string in the current language, filling `{NAME}` placeholders. */
export function t(key: StringKey, params: Record<string, string | number> = {}): string {
  const template = TABLES[current][key]
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}
