import { afterEach, describe, expect, it } from 'vitest'
import en from './en'
import tr from './tr'
import ar from './ar'
import { getAvailableLanguages, getLanguage, isRightToLeft, languageFromLocale, setLanguage, t } from './index'

afterEach(() => setLanguage('en'))

describe('language tables', () => {
  it('have the same keys', () => {
    expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort())
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort())
  })

  it('have no empty strings', () => {
    for (const table of [en, tr]) {
      for (const value of Object.values(table)) expect(value.trim()).not.toBe('')
    }
  })
})

describe('setLanguage / t', () => {
  it('switches languages and falls back to English for unknown codes', () => {
    expect(getAvailableLanguages()).toEqual(['en', 'tr', 'ar'])
    expect(setLanguage('tr')).toBe('tr')
    expect(getLanguage()).toBe('tr')
    expect(t('play')).toBe('Oyna')
    expect(setLanguage('xx')).toBe('en')
    expect(t('play')).toBe('Play')
  })

  it('fills placeholders', () => {
    expect(t('won', { POINTS: 30 })).toBe('Found it. +30')
    setLanguage('tr')
    expect(t('won', { POINTS: 45 })).toBe('Buldun. +45')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(t('won')).toBe('Found it. +{POINTS}')
  })
})

describe('languageFromLocale', () => {
  it('maps browser locales to supported languages', () => {
    expect(languageFromLocale('tr-TR')).toBe('tr')
    expect(languageFromLocale('TR')).toBe('tr')
    expect(languageFromLocale('en-GB')).toBe('en')
    expect(languageFromLocale('ar-EG')).toBe('ar')
    expect(languageFromLocale('de-DE')).toBe('en')
    expect(languageFromLocale(undefined)).toBe('en')
  })
})

describe('direction', () => {
  it('marks Arabic as right-to-left and the others as left-to-right', () => {
    expect(isRightToLeft('ar')).toBe(true)
    expect(isRightToLeft('en')).toBe(false)
    expect(isRightToLeft('tr')).toBe(false)
  })

  it('keeps every placeholder from the English source in the Arabic strings', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      const placeholders = (en[key].match(/\{\w+\}/g) ?? []).sort()
      expect((ar[key].match(/\{\w+\}/g) ?? []).sort()).toEqual(placeholders)
    }
  })
})
