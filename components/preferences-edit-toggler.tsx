import React from 'react'
import { MdSettings } from 'react-icons/md'
import { t } from '../lang'

interface Props {
  open: () => void
}

export default function PreferencesEditToggler({ open }: Props) {
  return (
    <button type="button" aria-label={t('preferences')} onClick={open} className="chip chip-settings">
      <MdSettings aria-hidden="true" />
    </button>
  )
}
