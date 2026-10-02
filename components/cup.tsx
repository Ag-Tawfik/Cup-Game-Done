import React from 'react'
import { asset } from '../lib/assets'

interface Props {
  cupKey: number
  select: (cupKey: number) => void
  disabled: boolean
}

export default function Cup({ cupKey, select, disabled }: Props) {
  return (
    <button
      type="button"
      aria-label={`Cup ${cupKey}`}
      disabled={disabled}
      onClick={() => select(cupKey)}
      className="dib w3 mh2 cup bn bg-transparent pa0 pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset('/images/cup.png')} alt="" />
    </button>
  )
}
