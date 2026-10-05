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
import {
  DAILY_ROUNDS, dailyKey, dailyNumber, dailyPlan, dailyRoundPoints, dailyRoundRandom, type DailyResult, type DailyRound
} from '../lib/daily'
import { intervalFor, pointsFor, shuffleStepsFor } from '../lib/scoring'
import { load, save, type Persisted } from '../lib/storage'

const MODAL_CLASS = { base: 'prefs-modal', afterOpen: 'prefs-modal--open', beforeClose: '' }
const OVERLAY_CLASS = { base: 'prefs-overlay', afterOpen: 'prefs-overlay--open', beforeClose: '' }
const SHARE_URL = 'https://ag-tawfik.github.io/Cup-Game-Done/'

setLanguage(DEFAULT_VALUES.lang)

type Mode = 'free' | 'daily'

interface DailyProgress {
  key: string
  plan: DailyRound[]
  round: number
  found: boolean[]
  points: number
}

type Props = Record<string, never>
interface State {
  score: number
  best: number
  streak: number
  bestStreak: number
  mode: Mode
  playing: boolean
  editingPreferences: boolean
  lastResult: LastResult | null
  numberOfCups: number
  shuffleIntervalMs: number
  lang: LanguageCode
  /** Today's date key; set after mount so the static export never bakes in a date. */
  todayKey: string
  dailyNumber: number
  dailyResult: DailyResult | null
  dailyProgress: DailyProgress | null
  dailyJustFinished: boolean
}

const DEFAULTS: Persisted = {
  score: 0,
  best: 0,
  streak: 0,
  bestStreak: 0,
  numberOfCups: DEFAULT_VALUES.numberOfCups,
  shuffleIntervalMs: DEFAULT_VALUES.shuffleIntervalMs,
  lang: DEFAULT_VALUES.lang,
  daily: null
}

class Main extends React.Component<Props, State> {
  state: State = {
    score: 0,
    best: 0,
    streak: 0,
    bestStreak: 0,
    mode: 'free',
    playing: false,
    editingPreferences: false,
    lastResult: null,
    numberOfCups: DEFAULTS.numberOfCups,
    shuffleIntervalMs: DEFAULTS.shuffleIntervalMs,
    lang: getLanguage(),
    todayKey: '',
    dailyNumber: 1,
    dailyResult: null,
    dailyProgress: null,
    dailyJustFinished: false
  }

  componentDidMount() {
    // The page is statically exported, so saved state is applied after hydration.
    Modal.setAppElement('#__next')
    const saved = load({ ...DEFAULTS, lang: languageFromLocale(navigator.language) })
    const lang = setLanguage(saved.lang)
    const today = new Date()
    const todayKey = dailyKey(today)
    this.setState({
      score: saved.score,
      best: saved.best,
      streak: saved.streak,
      bestStreak: saved.bestStreak,
      numberOfCups: saved.numberOfCups,
      shuffleIntervalMs: saved.shuffleIntervalMs,
      lang,
      todayKey,
      dailyNumber: dailyNumber(today),
      // A result from an earlier day is kept in storage but is not "today's".
      dailyResult: saved.daily && saved.daily.key === todayKey ? saved.daily : null
    })
  }

  componentDidUpdate(_: Props, prev: State) {
    const s = this.state
    if (
      prev.score !== s.score || prev.best !== s.best || prev.streak !== s.streak || prev.bestStreak !== s.bestStreak ||
      prev.numberOfCups !== s.numberOfCups || prev.shuffleIntervalMs !== s.shuffleIntervalMs || prev.lang !== s.lang ||
      prev.dailyResult !== s.dailyResult
    ) {
      save({
        score: s.score,
        best: s.best,
        streak: s.streak,
        bestStreak: s.bestStreak,
        numberOfCups: s.numberOfCups,
        shuffleIntervalMs: s.shuffleIntervalMs,
        lang: s.lang,
        daily: s.dailyResult
      })
    }
  }

  private play = () => {
    this.setState({ mode: 'free', playing: true, lastResult: null, dailyJustFinished: false })
  }

  private playDaily = () => {
    const { todayKey, dailyResult } = this.state
    if (!todayKey || dailyResult) return
    this.setState({
      mode: 'daily',
      playing: true,
      lastResult: null,
      dailyJustFinished: false,
      dailyProgress: { key: todayKey, plan: dailyPlan(todayKey), round: 0, found: [], points: 0 }
    })
  }

  private done = (result: RoundResult) => {
    if (this.state.mode === 'daily') return this.doneDaily(result)
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

  private doneDaily = (result: RoundResult) => {
    this.setState(prev => {
      const progress = prev.dailyProgress
      if (!progress) return null
      const found = [...progress.found, result.won]
      const points = progress.points + (result.won ? dailyRoundPoints(progress.plan[progress.round], progress.round) : 0)
      const finished = found.length >= DAILY_ROUNDS
      return {
        playing: !finished,
        mode: finished ? 'free' : 'daily',
        dailyProgress: finished ? null : { ...progress, round: progress.round + 1, found, points },
        dailyJustFinished: finished,
        dailyResult: finished ? { key: progress.key, found, points } : prev.dailyResult
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

  private renderBoard() {
    const s = this.state
    if (s.mode === 'daily' && s.dailyProgress) {
      const { key, plan, round } = s.dailyProgress
      const current = plan[round]
      return (
        <GameBoard
          key={`daily-${key}-${round}`}
          numberOfCups={current.numberOfCups}
          shuffleSteps={current.shuffleSteps}
          shuffleIntervalMs={current.shuffleIntervalMs}
          random={dailyRoundRandom(key, round)}
          allowReshuffle={false}
          done={this.done}
        />
      )
    }
    return (
      <GameBoard
        key="free"
        numberOfCups={s.numberOfCups}
        shuffleSteps={shuffleStepsFor(s.streak)}
        shuffleIntervalMs={intervalFor(s.shuffleIntervalMs, s.streak)}
        done={this.done}
      />
    )
  }

  public render() {
    const s = this.state
    const dailyChip = s.mode === 'daily' && s.dailyProgress
      ? { number: s.dailyNumber, round: s.dailyProgress.round + 1, found: s.dailyProgress.found.filter(Boolean).length }
      : null
    return (
      <div className="screen">
        <Head>
          <title>Cup Game</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content="A cup-and-ball game. Watch the ball, survive the shuffle, pick the right cup. Free play with streaks, or the daily challenge everyone shares." />
          <meta name="theme-color" content="#f5efe3" />
          <meta property="og:title" content="Cup Game" />
          <meta property="og:description" content="Watch the ball, survive the shuffle, pick the right cup. New daily challenge every day." />
          <link rel="icon" href={asset('/favicon.ico')} />
        </Head>
        <div className="backdrop">
          <AscendingBoxes />
        </div>
        <div className="stage">
          {s.playing ? (
            this.renderBoard()
          ) : (
            <AskPlay
              play={this.play}
              playDaily={this.playDaily}
              dailyNumber={s.dailyNumber}
              dailyResult={s.dailyResult}
              lastResult={s.lastResult}
              dailyJustFinished={s.dailyJustFinished}
              shareUrl={SHARE_URL}
            />
          )}
        </div>
        <Score score={s.score} best={s.best} streak={s.streak} daily={dailyChip} />
        {/* Settings are locked during a round so they cannot reset a shuffled board. */}
        {!s.playing && <PreferencesEditToggler open={this.openPreferences} />}
        <Modal
          isOpen={s.editingPreferences}
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
            canResetScore={s.score > 0 || s.streak > 0}
            lang={s.lang}
            numberOfCups={s.numberOfCups}
            shuffleIntervalMs={s.shuffleIntervalMs}
          />
        </Modal>
      </div>
    )
  }
}

export default Main
