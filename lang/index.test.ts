import { afterEach, describe, expect, it } from 'vitest'
import en from './en'
import tr from './tr'
import { getAvailableLanguages, getLanguage, setLanguage, t } from './index'

afterEach(() => setLanguage('en'))

describe('language tables', () => {
  it('have the same keys', () => {
    expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort())
  })

  it('have no empty strings', () => {
    for (const table of [en, tr]) {
      for (const value of Object.values(table)) expect(value.trim()).not.toBe('')
    }
  })
})

describe('setLanguage / t', () => {
  it('switches languages and falls back to English for unknown codes', () => {
    expect(getAvailableLanguages()).toEqual(['en', 'tr'])
    expect(setLanguage('tr')).toBe('tr')
    expect(getLanguage()).toBe('tr')
    expect(t('play')).toBe('Oyna')
    expect(setLanguage('xx')).toBe('en')
    expect(t('play')).toBe('Play')
  })

  it('fills placeholders', () => {
    expect(t('rightSelection', { GB: 3 })).toBe('You won 3GB!')
    setLanguage('tr')
    expect(t('rightSelection', { GB: 5 })).toBe('5GB kazandınız!')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(t('rightSelection')).toBe('You won {GB}GB!')
  })
})
