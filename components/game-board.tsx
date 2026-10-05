import React from 'react'
import { Flipper, Flipped } from 'react-flip-toolkit'
import { MdShuffle } from 'react-icons/md'

import { t } from '../lang'
import { asset } from '../lib/assets'
import {
  ballPosition,
  beginShuffle,
  finishReveal,
  isWin,
  pick,
  settle,
  shuffleStep,
  startRound,
  type RoundState
} from '../lib/round'
import { intervalFor, shuffleStepsFor } from '../lib/scoring'
import Cup from './cup'

export interface RoundResult {
  won: boolean
  /** 1-based position of the ball when the round ended. */
  ballPosition: number
}

interface Props {
  numberOfCups: number
  shuffleIntervalMs: number
  streak: number
  done: (result: RoundResult) => void
}

interface State {
  round: RoundState
  /** Position announced during the reveal, kept so the text does not change mid-shuffle. */
  revealedPosition: number
}

const REVEAL_DURATION_MS = 1400
const RESULT_DELAY_MS = 900
const LOSS_SHOW_BALL_MS = 1100
const SETTLE_FALLBACK_MS = 900
const TITLE_LETTER_STAGGER_S = 0.05

/** Letters fade in one by one; words are kept unbreakable so lines wrap between words only. */
function renderStaggeredTitle(text: string) {
  let letterIndex = 0
  return text.split(' ').map((word, wordIndex) => (
    <React.Fragment key={`word-${wordIndex}`}>
      {wordIndex > 0 && ' '}
      <span className="word" aria-hidden="true">
        {word.split('').map(char => {
          const delay = `${letterIndex++ * TITLE_LETTER_STAGGER_S}s`
          return (
            <span key={`${wordIndex}-${letterIndex}`} style={{ animationDelay: delay }} className="dib fade-in">
              {char}
            </span>
          )
        })}
      </span>
    </React.Fragment>
  ))
}

class GameBoard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const round = startRound(props.numberOfCups)
    this.state = { round, revealedPosition: ballPosition(round) }
  }

  private timers = new Set<ReturnType<typeof setTimeout>>()
  private shuffleInterval: ReturnType<typeof setInterval> | null = null
  private unmounted = false

  componentDidMount() {
    this.unmounted = false
    this.after(REVEAL_DURATION_MS, () => this.setState(s => ({ round: finishReveal(s.round) })))
  }

  componentWillUnmount() {
    this.unmounted = true
    this.timers.forEach(clearTimeout)
    this.timers.clear()
    if (this.shuffleInterval !== null) clearInterval(this.shuffleInterval)
  }

  /** setTimeout that is cancelled on unmount. */
  private after(ms: number, fn: () => void) {
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      if (!this.unmounted) fn()
    }, ms)
    this.timers.add(timer)
  }

  private shuffle = () => {
    const steps = shuffleStepsFor(this.props.streak)
    const interval = intervalFor(this.props.shuffleIntervalMs, this.props.streak)
    const next = beginShuffle(this.state.round, steps)
    if (next === this.state.round) return
    this.setState({ round: next })

    this.shuffleInterval = setInterval(() => {
      this.setState(
        s => ({ round: shuffleStep(s.round) }),
        () => {
          if (this.state.round.phase !== 'settling') return
          if (this.shuffleInterval !== null) clearInterval(this.shuffleInterval)
          this.shuffleInterval = null
          // Flipper's onComplete settles sooner; this covers reduced-motion or a skipped animation.
          this.after(SETTLE_FALLBACK_MS, this.settle)
        }
      )
    }, interval)
  }

  private settle = () => {
    this.setState(s => ({ round: settle(s.round) }))
  }

  private pickCup = (cup: string) => {
    const next = pick(this.state.round, cup)
    if (next === this.state.round) return
    this.setState({ round: next })
    const won = isWin(next)
    const position = ballPosition(next)
    if (won) {
      this.after(RESULT_DELAY_MS, () => this.props.done({ won, ballPosition: position }))
      return
    }
    // Show the player where the ball actually was before ending the round.
    this.after(RESULT_DELAY_MS, () => {
      this.setState(s => ({ round: { ...s.round, openedCup: s.round.ballUnder } }))
      this.after(LOSS_SHOW_BALL_MS, () => this.props.done({ won, ballPosition: position }))
    })
  }

  public render() {
    const { round, revealedPosition } = this.state
    const { phase, cups, openedCup } = round
    const canPick = phase === 'shuffled'
    const canShuffle = phase === 'ready' || phase === 'shuffled'
    const showBall = phase === 'revealing' || phase === 'resolving'
    const status = phase === 'revealing' ? t('revealing', { POS: revealedPosition }) : t('gameRule')

    return (
      <section className="relative" aria-label={t('title')}>
        <div className="tc pa4">
          <h2 className="fw7 lh-solid mt0 mb2 title balance" aria-label={t('title')}>
            {renderStaggeredTitle(t('title'))}
          </h2>
          <p className="rule-text ink-soft" aria-live="polite">{status}</p>
          <div className="mv4">
            <Flipper flipKey={cups.join(',')} onComplete={phase === 'settling' ? this.settle : undefined}>
              <div className="cups">
                {cups.map((cup, index) => (
                  <Flipped key={cup} flipId={cup}>
                    <div className="cup-col">
                      {showBall && cup === round.ballUnder && (
                        <div className="ball" aria-hidden="true">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={asset('/images/ball.png')} className="ball-image" alt="" />
                        </div>
                      )}
                      <div className={'cup-container' + (cup === openedCup ? ' jump' : '')}>
                        <Cup
                          label={t('cupLabel', { POS: index + 1, COUNT: cups.length })}
                          select={() => this.pickCup(cup)}
                          disabled={!canPick}
                        />
                      </div>
                    </div>
                  </Flipped>
                ))}
              </div>
            </Flipper>
          </div>
          <div className="mt4">
            <button type="button" className="btn btn-text f3" onClick={this.shuffle} disabled={!canShuffle}>
              <MdShuffle aria-hidden="true" /> {t('shuffle')}
            </button>
          </div>
        </div>
      </section>
    )
  }
}

export default GameBoard
