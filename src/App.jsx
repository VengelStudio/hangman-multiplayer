import React from "react"
import "./App.css"

import Header from "./Components/Header/Header"
import About from "./Components/About/About"
import Popup from "./Components/Popup/Popup"
import Options from "./Components/Menu/Options/Options"
import Game from "./Components/Game/Game"
import Credits from "./Components/Menu/Credits/Credits"
import Menu from "./Components/Menu/Menu"
import PlayersBrowser from "./Components/PlayersBrowser/PlayersBrowser"

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			title: "Hangman Multiplayer",
			nickname: null,
			openedComponent: (
				<Menu
					addPopup={this.addPopup}
					menuPlayHandler={this.menuPlayHandler}
					nickPopup={this.passNickname}
					optionsStartHandler={this.optionsStartHandler}
					creditsStartHandler={this.creditsStartHandler}
				/>
			),
			popups: [],
			lastPopupId: 0
		}
	}

	addPopup = content => {
		this.setState({
			popups: [
				...this.state.popups,
				{ id: this.state.lastPopupId, content: content }
			]
		})
		this.setState((prevState, props) => {
			lastPopupId: prevState.lastPopupId++
		})
	}

	gameStartHandler = () => {
		this.setState({ openedComponent: <Game /> })
	}

	menuPlayHandler = nickname => {
		this.setState({ nickname: nickname }, () => {
			this.setState({ title: "Players browser" }, () => {
				this.setState({
					openedComponent: (
						<PlayersBrowser
							nickname={nickname}
							gameStartHandler={this.gameStartHandler}
						/>
					)
				})
			})
		})
	}
	optionsStartHandler = () => {
		this.setState({ title: "Options" }, () => {
			this.setState({ openedComponent: <Options /> })
		})
	}
	creditsStartHandler = () => {
		this.setState({ title: "Credits" }, () => {
			this.setState({ openedComponent: <Credits /> })
		})
	}


	onPopupClose = id => {
		let newPopups = this.state.popups.filter(popup => {
			return popup.id !== id
		})
		this.setState({ popups: newPopups })
	}

	render() {
		return (
			<div className="container of-rows width-full height-full text-nunito ">
				<Header title={this.state.title} />
				<div className="row width-full height-full bg-lightgrey">
					{this.state.popups &&
						this.state.popups.map(x => {
							return (
								<Popup
									title={x.title}
									content={x.content}
									key={x.id}
									id={x.id}
									onClose={this.onPopupClose}
								/>
							)
						})}
					{this.state.openedComponent && this.state.openedComponent}
				</div>
				<About />
			</div>
		)
	}
}

export default App
