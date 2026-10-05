import React from 'react'
import { asset } from '../lib/assets'

interface Props {
  /** Accessible name by position only; never by value or identity. */
  label: string
  select: () => void
  disabled: boolean
}

export default function Cup({ label, select, disabled }: Props) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={select} className="cup">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset('/images/cup.png')} alt="" />
    </button>
  )
}
