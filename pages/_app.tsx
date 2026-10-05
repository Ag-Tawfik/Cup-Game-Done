import type { AppProps } from 'next/app'
import { Kalam, Marhey } from 'next/font/google'

import 'tachyons/css/tachyons.min.css'
import '../styles/main.sass'
import '../styles/shadows.sass'
import '../styles/game-board.sass'
import '../styles/ascending-boxes.sass'
import '../styles/button-get-started.scss'

const kalam = Kalam({ weight: ['400', '700'], subsets: ['latin', 'latin-ext'] })
const marhey = Marhey({ weight: ['400', '700'], subsets: ['arabic', 'latin'], variable: '--font-arabic' })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${kalam.className} ${marhey.variable}`}>
      <Component {...pageProps} />
    </main>
  )
}
