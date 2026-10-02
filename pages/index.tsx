import React from 'react'
import Head from 'next/head'
import Modal from 'react-modal'

import AskPlay from '../components/ask-play'
import GameBoard from '../components/game-board'
import AscendingBoxes from '../components/ascending-boxes'
import PreferencesEdit, { type Preferences } from '../components/preferences-edit'
import PreferencesEditToggler from '../components/preferences-edit-toggler'
import Score from '../components/score'

import { getLanguage, setLanguage, t, type LanguageCode } from '../lang'
import DEFAULT_VALUES from '../default.setting'

const PREFERENCES_EDIT_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

setLanguage(DEFAULT_VALUES.lang)

type Props = Record<string, never>
interface State {
  score: number
  playing: boolean
  editingPreferences: boolean
  /** GB won in the last round, or null before the first round finishes. */
  lastGBWon: number | null
  numberOfCups: number
  shuffleIntervalMs: number
  lang: LanguageCode
}

class Main extends React.Component<Props, State> {
  state: State = {
    score: 0,
    playing: false,
    editingPreferences: false,
    lastGBWon: null,
    numberOfCups: DEFAULT_VALUES.numberOfCups,
    shuffleIntervalMs: DEFAULT_VALUES.shuffleIntervalMs,
    lang: getLanguage()
  }

  private play = () => {
    this.setState({ playing: true, lastGBWon: null })
  }

  private done = (gbValue: number) => {
    this.setState(prev => ({
      playing: false,
      lastGBWon: gbValue,
      score: prev.score + gbValue
    }))
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

  public render() {
    const { playing } = this.state
    return (
      <div>
        <Head>
          <title>Cup Game</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <div className={'absolute w-100 vh-100 bg-fade ' + (playing ? 'bg-transparent' : 'bg-near-black')}>
          <div style={{ zIndex: -1 }} className="absolute w-100 h-75">
            <AscendingBoxes />
          </div>
          <div className="w-100 h-100 flex items-center justify-center">
            {playing ? (
              <GameBoard
                numberOfCups={this.state.numberOfCups}
                shuffleIntervalMs={this.state.shuffleIntervalMs}
                done={this.done}
              />
            ) : (
              <AskPlay play={this.play} gbWon={this.state.lastGBWon} />
            )}
          </div>
          <Score score={this.state.score} />
          {/* Settings are locked during a round so they cannot reset a shuffled board. */}
          {!playing && <PreferencesEditToggler open={this.openPreferences} />}
          <Modal
            ariaHideApp={false}
            isOpen={this.state.editingPreferences}
            onRequestClose={this.closePreferences}
            contentLabel={t('preferences')}
            style={PREFERENCES_EDIT_STYLE}
          >
            <PreferencesEdit
              done={this.updatePreferences}
              cancel={this.closePreferences}
              lang={this.state.lang}
              numberOfCups={this.state.numberOfCups}
              shuffleIntervalMs={this.state.shuffleIntervalMs}
            />
          </Modal>
        </div>
      </div>
    )
  }
}

export default Main
