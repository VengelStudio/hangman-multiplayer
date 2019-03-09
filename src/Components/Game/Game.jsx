import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import PropTypes from 'prop-types'
import ReactAudioPlayer from 'react-audio-player'

import './Game.css'
import Cards from './Cards'
import Content from './Content'

const { isMove } = require('../../Shared/Functions')
const { winHandler } = require('./Functions')
const { setScore } = require('../../Shared/Functions')
const { GAME_MOVE, WIN } = require('../../Shared/Events')
const { Result } = require('../../Shared/Enums')
class Game extends Component {
    state = {
        game: this.props.game,
        gameFromProps: true,
        allowMove: true,
        myCards: null,
        enemyCards: null,
        cardTargetHighlight: false,
        usedCardIndexes: { 0: false, 1: false, 2: false },
        soundSrc: '',
        isDiscardEnabled: false,
        discardMoves: []
    }

    initializeSocket = () => {
        const { socket } = this.props
        socket.on(GAME_MOVE, ({ game }) => {
            this.setState({ game: game }, () => {
                this.props.setMove(
                    isMove({ game: this.state.game, player: this.props.player })
                )
            })
        })
        socket.on(WIN, ({ winner, score, type, game }) => {
            if (type === Result.TURN_WIN || type === Result.TURN_TIE) {
                this.props.addPopup({
                    popupData: {
                        title: 'Guessed word',
                        content: this.state.game.word.word
                    }
                })
            }
            let winObj = winHandler({
                type,
                setScore,
                score,
                game,
                winner,
                props: this.props,
                returnToMenu: () => {
                    this.props.history.push('/browser')
                }
            })

            this.setState({ ...winObj })
        })
    }

    static getDerivedStateFromProps(props, state) {
        if (state.gameFromProps) {
            if (props.game !== state.game) {
                setScore({
                    player: props.player,
                    game: props.game,
                    setTitle: props.setTitle
                })
                return {
                    gameFromProps: false,
                    game: props.game
                }
            }
            return null
        }
        return null
    }

    ctrlPressHandler(event, isDown) {
        let { player } = this.props
        let { game } = this.state
        if (player !== null && game !== null) {
            let mySocketId = player.socketId
            let myBlocked = game.blockCounters[mySocketId]
            if (event.keyCode === 17 && myBlocked <= 0) {
                this.setState({ isDiscardEnabled: isDown })
            }
        }
    }
    componentDidMount() {
        this.props.socket && this.initializeSocket()
        this.props.muteMusic(true)
        document.addEventListener(
            'keydown',
            e => {
                this.ctrlPressHandler(e, true)
            },
            false
        )
        document.addEventListener(
            'keyup',
            e => {
                this.ctrlPressHandler(e, false)
            },
            false
        )
    }
    componentWillUnmount() {
        document.removeEventListener(
            'keydown',
            e => {
                this.ctrlPressHandler(e, false)
            },
            false
        )
        document.removeEventListener(
            'keyup',
            e => {
                this.ctrlPressHandler(e, false)
            },
            false
        )
    }

    moveHandler = ({ moves = null }) => {
        if (this.state.allowMove === true) {
            const { socket } = this.props
            let allMoves = [...moves, ...this.state.discardMoves]
            socket.emit(GAME_MOVE, { game: this.state.game, moves: allMoves })
        }
    }

    onMoveTimeout = () => {
        this.moveHandler({
            moves: [
                {
                    type: 'key',
                    key: '',
                    playerSocketId: this.props.player.socketId
                }
            ]
        })
    }

    setCardTargetHighlight = bool => {
        this.setState({ cardTargetHighlight: bool })
    }

    updateUsedCardIndexes = newIndexes => {
        this.setState({ usedCardIndexes: newIndexes })
    }

    onUseAbort = index => {
        let newIndexes = this.state.usedCardIndexes
        newIndexes[index] = false
        this.updateUsedCardIndexes(newIndexes)
    }

    playSound = src => {
        this.setState({ soundSrc: src })
    }

    onDiscard = (index, cardId) => {
        let move = {
            type: 'card',
            card: cardId,
            playerSocketId: this.props.player.socketId,
            discarded: true
        }
        let newGame = this.state.game
        let mySocketId = this.props.player.socketId
        console.log(newGame.cards)
        newGame.cards[mySocketId] = newGame.cards[mySocketId].filter(
            (val, i) => {
                return i !== index
            }
        )
        console.log(newGame.cards)
        let newDiscardMoves = this.state.discardMoves
        newDiscardMoves.push(move)
        this.setState({
            discardMoves: newDiscardMoves,
            game: newGame
        })
    }

    render() {
        let cards = { my: null, enemy: null }
        if (this.state.game !== null) {
            let gameCards = this.state.game.cards
            let mySocketId = this.props.player.socketId
            cards.my = gameCards[mySocketId]
            let enemySocketId = this.state.game.playerSockets.filter(x => {
                return x.socketId !== this.props.player.socketId
            })[0].socketId
            cards.enemy = gameCards[enemySocketId]
        }
        return (
            <div className='gameWrapper'>
                <ReactAudioPlayer
                    volume={this.props.soundVolume}
                    src={this.state.soundSrc}
                    autoPlay
                    onEnded={() => {
                        this.setState({ soundSrc: '' })
                    }}
                />
                <Cards
                    cards={cards.my}
                    onUseAbort={this.onUseAbort}
                    usedCardIndexes={this.state.usedCardIndexes}
                    areMine={true}
                    move={this.props.isMove}
                    title='Your cards:'
                    setCardTargetHighlight={this.setCardTargetHighlight}
                    playSound={this.playSound}
                    game={this.state.game}
                    player={this.props.player}
                    isDiscardEnabled={this.state.isDiscardEnabled}
                    onDiscard={this.onDiscard}
                />
                <Content
                    player={this.props.player}
                    updateUsedCardIndexes={this.updateUsedCardIndexes}
                    usedCardIndexes={this.state.usedCardIndexes}
                    moveHandler={this.moveHandler}
                    onMoveTimeout={this.onMoveTimeout}
                    move={this.props.isMove}
                    game={this.state.game}
                    addPopup={this.props.addPopup}
                    isCardTargetHighlight={this.state.cardTargetHighlight}
                    playSound={this.playSound}
                />
                <Cards
                    cards={cards.enemy}
                    usedCardIndexes={{ 0: false, 1: false, 2: false }}
                    areMine={false}
                    move={!this.props.isMove}
                    title='Enemy cards:'
                    setCardTargetHighlight={this.setCardTargetHighlight}
                    playSound={this.playSound}
                    game={this.state.game}
                    player={this.props.player}
                />
            </div>
        )
    }
}

Game.propTypes = {
    game: PropTypes.object,
    socket: PropTypes.object,
    player: PropTypes.object,
    history: PropTypes.object.isRequired,
    isMove: PropTypes.bool.isRequired,
    muteMusic: PropTypes.func.isRequired,
    setMove: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired,
    soundVolume: PropTypes.number.isRequired
}

export default withRouter(Game)
