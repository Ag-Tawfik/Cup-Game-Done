import type { AppProps } from 'next/app'
import { Kalam } from 'next/font/google'

import 'tachyons/css/tachyons.min.css'
import '../styles/main.sass'
import '../styles/shadows.sass'
import '../styles/game-board.sass'
import '../styles/ascending-boxes.sass'
import '../styles/button-get-started.scss'

const kalam = Kalam({ weight: ['400', '700'], subsets: ['latin', 'latin-ext'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={kalam.className}>
      <Component {...pageProps} />
    </main>
  )
}
