import React from 'react'
import { asset } from '../lib/assets'

interface Props {
  className?: string
}

const CUP_IMAGES = ['cup-1', 'cup-1', 'cup-1', 'cup-2', 'cup-2', 'cup-2', 'cup-3', 'cup-3', 'cup-3', 'cup-3']

export default function AscendingBoxes({ className = '' }: Props) {
  return (
    <div className={`${className} area o-20`} aria-hidden="true">
      <ul className="circles">
        {CUP_IMAGES.map((name, index) => (
          <li key={index}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="upside-down" src={asset(`/images/${name}.svg`)} alt="" />
          </li>
        ))}
      </ul>
    </div>
  )
}
