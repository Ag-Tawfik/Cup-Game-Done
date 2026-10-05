import React from 'react'
import Head from 'next/head'
import Modal from 'react-modal'

import AskPlay, { type LastResult } from '../components/ask-play'
import GameBoard, { type RoundResult } from '../components/game-board'
import AscendingBoxes from '../components/ascending-boxes'
import PreferencesEdit, { type Preferences } from '../components/preferences-edit'
import PreferencesEditToggler from '../components/preferences-edit-toggler'
import Score from '../components/score'

import { getLanguage, languageFromLocale, setLanguage, t, type LanguageCode } from '../lang'
import DEFAULT_VALUES from '../default.setting'
import { asset } from '../lib/assets'
import { intervalFor, pointsFor } from '../lib/scoring'
import { load, save, type Persisted } from '../lib/storage'

const MODAL_CLASS = { base: 'prefs-modal', afterOpen: 'prefs-modal--open', beforeClose: '' }
const OVERLAY_CLASS = { base: 'prefs-overlay', afterOpen: 'prefs-overlay--open', beforeClose: '' }

setLanguage(DEFAULT_VALUES.lang)

type Props = Record<string, never>
interface State {
  score: number
  best: number
  streak: number
  bestStreak: number
  playing: boolean
  editingPreferences: boolean
  lastResult: LastResult | null
  numberOfCups: number
  shuffleIntervalMs: number
  lang: LanguageCode
}

const DEFAULTS: Persisted = {
  score: 0,
  best: 0,
  streak: 0,
  bestStreak: 0,
  numberOfCups: DEFAULT_VALUES.numberOfCups,
  shuffleIntervalMs: DEFAULT_VALUES.shuffleIntervalMs,
  lang: DEFAULT_VALUES.lang
}

class Main extends React.Component<Props, State> {
  state: State = {
    score: 0,
    best: 0,
    streak: 0,
    bestStreak: 0,
    playing: false,
    editingPreferences: false,
    lastResult: null,
    numberOfCups: DEFAULTS.numberOfCups,
    shuffleIntervalMs: DEFAULTS.shuffleIntervalMs,
    lang: getLanguage()
  }

  componentDidMount() {
    // The page is statically exported, so saved state is applied after hydration.
    Modal.setAppElement('#__next')
    const saved = load({ ...DEFAULTS, lang: languageFromLocale(navigator.language) })
    const lang = setLanguage(saved.lang)
    this.setState({
      score: saved.score,
      best: saved.best,
      streak: saved.streak,
      bestStreak: saved.bestStreak,
      numberOfCups: saved.numberOfCups,
      shuffleIntervalMs: saved.shuffleIntervalMs,
      lang
    })
  }

  componentDidUpdate(_: Props, prev: State) {
    const s = this.state
    if (
      prev.score !== s.score || prev.best !== s.best || prev.streak !== s.streak || prev.bestStreak !== s.bestStreak ||
      prev.numberOfCups !== s.numberOfCups || prev.shuffleIntervalMs !== s.shuffleIntervalMs || prev.lang !== s.lang
    ) {
      save({
        score: s.score,
        best: s.best,
        streak: s.streak,
        bestStreak: s.bestStreak,
        numberOfCups: s.numberOfCups,
        shuffleIntervalMs: s.shuffleIntervalMs,
        lang: s.lang
      })
    }
  }

  private play = () => {
    this.setState({ playing: true, lastResult: null })
  }

  private done = (result: RoundResult) => {
    this.setState(prev => {
      const points = result.won
        ? pointsFor(prev.numberOfCups, intervalFor(prev.shuffleIntervalMs, prev.streak), prev.streak)
        : 0
      const score = prev.score + points
      const streak = result.won ? prev.streak + 1 : 0
      return {
        playing: false,
        score,
        streak,
        best: Math.max(prev.best, score),
        bestStreak: Math.max(prev.bestStreak, streak),
        lastResult: { won: result.won, points, ballPosition: result.ballPosition }
      }
    })
  }

  private openPreferences = () => this.setState({ editingPreferences: true })
  private closePreferences = () => this.setState({ editingPreferences: false })

  private updatePreferences = (preferences: Preferences) => {
    setLanguage(preferences.lang)
    this.setState({
      numberOfCups: preferences.numberOfCups,
      shuffleIntervalMs: preferences.shuffleIntervalMs,
      lang: preferences.lang,
      editingPreferences: false
    })
  }

  private resetScore = () => {
    this.setState({ score: 0, streak: 0, lastResult: null, editingPreferences: false })
  }

  public render() {
    const { playing } = this.state
    return (
      <div className="screen">
        <Head>
          <title>Cup Game</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content="A cup-and-ball game. Watch the ball, survive the shuffle, pick the right cup. Streaks make it faster and worth more." />
          <meta name="theme-color" content="#f5efe3" />
          <meta property="og:title" content="Cup Game" />
          <meta property="og:description" content="Watch the ball, survive the shuffle, pick the right cup." />
          <link rel="icon" href={asset('/favicon.ico')} />
        </Head>
        <div className="backdrop">
          <AscendingBoxes />
        </div>
        <div className="stage">
          {playing ? (
            <GameBoard
              numberOfCups={this.state.numberOfCups}
              shuffleIntervalMs={this.state.shuffleIntervalMs}
              streak={this.state.streak}
              done={this.done}
            />
          ) : (
            <AskPlay play={this.play} lastResult={this.state.lastResult} />
          )}
        </div>
        <Score score={this.state.score} best={this.state.best} streak={this.state.streak} />
        {/* Settings are locked during a round so they cannot reset a shuffled board. */}
        {!playing && <PreferencesEditToggler open={this.openPreferences} />}
        <Modal
          isOpen={this.state.editingPreferences}
          onRequestClose={this.closePreferences}
          contentLabel={t('preferences')}
          className={MODAL_CLASS}
          overlayClassName={OVERLAY_CLASS}
          closeTimeoutMS={150}
        >
          <PreferencesEdit
            done={this.updatePreferences}
            cancel={this.closePreferences}
            resetScore={this.resetScore}
            canResetScore={this.state.score > 0 || this.state.streak > 0}
            lang={this.state.lang}
            numberOfCups={this.state.numberOfCups}
            shuffleIntervalMs={this.state.shuffleIntervalMs}
          />
        </Modal>
      </div>
    )
  }
}

export default Main
