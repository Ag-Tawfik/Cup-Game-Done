import React from 'react'
import { Flipper, Flipped } from 'react-flip-toolkit'
import { MdShuffle } from 'react-icons/md'

import { t } from '../lang'
import { asset } from '../lib/assets'
import { SHUFFLE_ROUNDS, createCups, gbValueForCup, labelForCup, shuffleCups } from '../lib/game'
import Cup from './cup'

interface Props {
  numberOfCups: number
  shuffleIntervalMs: number
  done: (gbValue: number) => void
}

/**
 * revealing: each cup is lifted in turn so the player sees every ball (works on touch too).
 * ready:     the player may still peek by hovering, and may shuffle.
 * shuffling: cups are moving; input is ignored.
 * shuffled:  the player may pick a cup, or shuffle again.
 * resolving: a cup has been picked; the result is being shown. No further input.
 */
type Phase = 'revealing' | 'ready' | 'shuffling' | 'shuffled' | 'resolving'

interface State {
  cups: number[]
  openedCup: number | null
  phase: Phase
}

const CUP_SHOWING_DURATION_MS = 1000
const DELAY_BEFORE_RESULT_FEEDBACK_MS = 800
const TITLE_LETTER_STAGGER_S = 0.05

class GameBoard extends React.Component<Props, State> {
  state: State = {
    cups: createCups(this.props.numberOfCups),
    openedCup: null,
    phase: 'revealing'
  }

  private timers = new Set<ReturnType<typeof setTimeout>>()
  private shuffleInterval: ReturnType<typeof setInterval> | null = null
  private unmounted = false

  componentDidMount() {
    this.unmounted = false
    void this.revealCups()
  }

  componentWillUnmount() {
    this.unmounted = true
    this.timers.forEach(clearTimeout)
    this.timers.clear()
    if (this.shuffleInterval !== null) clearInterval(this.shuffleInterval)
  }

  /** setTimeout that is cancelled on unmount. */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.timers.delete(timer)
        resolve()
      }, ms)
      this.timers.add(timer)
    })
  }

  private async revealCups() {
    for (const cup of this.state.cups) {
      if (this.unmounted) return
      this.setState({ openedCup: cup })
      await this.wait(CUP_SHOWING_DURATION_MS)
    }
    if (this.unmounted) return
    this.setState({ openedCup: null, phase: 'ready' })
  }

  private shuffle = () => {
    const { phase } = this.state
    if (phase !== 'ready' && phase !== 'shuffled') return
    this.setState({ phase: 'shuffling', openedCup: null })

    let round = 0
    this.shuffleInterval = setInterval(() => {
      this.setState(prev => ({ cups: shuffleCups(prev.cups) }))
      round++
      if (round >= SHUFFLE_ROUNDS && this.shuffleInterval !== null) {
        clearInterval(this.shuffleInterval)
        this.shuffleInterval = null
        this.setState({ phase: 'shuffled' })
      }
    }, this.props.shuffleIntervalMs)
  }

  private selectCup = async (cup: number) => {
    // 'resolving' guards against a second pick (or a shuffle) before the round ends,
    // which previously credited the score twice.
    if (this.state.phase !== 'shuffled') return
    this.setState({ phase: 'resolving', openedCup: cup })
    await this.wait(DELAY_BEFORE_RESULT_FEEDBACK_MS)
    if (this.unmounted) return
    this.props.done(gbValueForCup(cup))
  }

  public render() {
    const { cups, openedCup, phase } = this.state
    const canPick = phase === 'shuffled'
    const canHoverPeek = phase === 'ready'
    const canShuffle = phase === 'ready' || phase === 'shuffled'

    return (
      <div className="relative">
        <div className="tc pa4">
          <h2 className="fw1 f1 lh-solid mb1 title" aria-label={t('chooseTheRightCup')}>
            {t('chooseTheRightCup').split('').map((char, index) => (
              <span
                key={`chooseText-${index}`}
                aria-hidden="true"
                style={{ animationDelay: `${index * TITLE_LETTER_STAGGER_S}s` }}
                className="dib fade-in"
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </h2>
          <p className="gray mw5 center">
            {phase === 'revealing' ? t('revealing') : t('gameRuleGeneral')}
          </p>
          <div className="mv4">
            <Flipper flipKey={cups.join(',')}>
              {cups.map(cup => (
                <Flipped key={cup} flipId={String(cup)}>
                  <div className="dib">
                    <div className="ball-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset('/images/ball.png')} className="ball-image" alt="" />
                      <span className="ball-label">{labelForCup(cup)}</span>
                    </div>
                    <div
                      className={
                        'cup-container' +
                        (cup === openedCup ? ' jump' : '') +
                        (canHoverPeek ? ' can-jump-on-hover' : '')
                      }
                    >
                      <Cup cupKey={cup} select={this.selectCup} disabled={!canPick} />
                    </div>
                  </div>
                </Flipped>
              ))}
            </Flipper>
          </div>
          <div className="mt4">
            <button
              type="button"
              className="bn bg-transparent f3 pointer"
              onClick={this.shuffle}
              disabled={!canShuffle}
            >
              <MdShuffle /> {t('shuffle')}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default GameBoard
