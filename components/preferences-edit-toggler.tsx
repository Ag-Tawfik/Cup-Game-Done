import React from 'react'
import { MdSettings } from 'react-icons/md'
import { t } from '../lang'

interface Props {
  open: () => void
}

export default function PreferencesEditToggler({ open }: Props) {
  return (
    <button
      type="button"
      aria-label={t('preferences')}
      onClick={open}
      className="absolute right-0 bottom-0 dib ph3 pv2 bg-white bn mb3 mr3 light-shadow pointer"
    >
      <MdSettings />
    </button>
  )
}
