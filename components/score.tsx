import React from 'react'
import { t } from '../lang'

interface Props {
  score: number
}

export default function Score({ score }: Props) {
  return (
    <div className="absolute right-0 top-0 dib ph3 pv2 bg-white mt3 mr3 light-shadow">
      {t('score')} : {score}
    </div>
  )
}
