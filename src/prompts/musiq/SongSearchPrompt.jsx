import React from "react";
import SpotifyWebApi from "spotify-web-api-js";
import "../../App.css";
import "./SongSearchPrompt.css";

export const INPUT_TYPE_SONG_SEARCH = "song_search";

const SEARCH_DEBOUNCE_TIME_MS = 300;

class SongSearchPrompt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchResults: [],
		};
		let accessToken = props.promptData?.apiAccessToken;
		this.spotifyApi = new SpotifyWebApi();
		if (!accessToken) {
			let searchParams = new URLSearchParams(window.location.search);
			accessToken = searchParams.get("access_token");
		}
		if (!accessToken) {
			console.error("No valid spotify access token provided");
		}
		this.spotifyApi.setAccessToken(accessToken);
	}

	handleSubmit(track) {
		if (typeof this.props.onSubmit === "function") {
			if (track) {
				this.props.onSubmit({
					trackId: track.id,
					title: track.name,
					artists: track.artists.map((artist) => artist.name),
					contestId: this.props.promptData.contestId,
				});
			} else {
				this.props.onSubmit({
					contestId: this.props.promptData.contestId,
				});
			}
		}
	}

	debounce(func, timeout = SEARCH_DEBOUNCE_TIME_MS) {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => { func.apply(this, args); }, timeout);
		};
	}

	searchSpotify = this.debounce((query) => {
		if (query) {
			this.cancelSearch = false;
			this.spotifyApi
				.searchTracks(query)
				.then((response) => {
					if (!this.cancelSearch) {
						this.setState({ searchResults: response.tracks.items ?? [] });
					}
				})
				.catch(function (error) {
					console.error(error);
				});
		} else {
			this.cancelSearch = true;
			this.setState({ searchResults: [] });
		}
	});

	render() {
		return (
			<div className="SongSearchPrompt-container">
				<button
					className="App-button SongSearchPrompt-skip"
					onClick={() => this.handleSubmit()}
				>
					Skip
				</button>
				<input
					className="App-text-input SongSearchPrompt-input SongSearchPrompt-prompt"
					name="textinput"
					type="text"
					onChange={async (evt) => {
						this.searchSpotify(evt.target.value);
					}}
				/>
				<ul className="SongSearchPrompt-results-container">
					{this.state.searchResults.map((track, i) => {
						return (
							// <li >
							<button
								key={i}
								className="App-button SongSearchPrompt-result-item"
								onClick={() => this.handleSubmit(track)}
							>
								<img
									alt="Artwork"
									className="SongSearchPrompt-result-item-image"
									src={track.album.images ? track.album.images[0]?.url : ""}
								/>
								<div className="SongSearchPrompt-result-item-details">
									<p className="SongSearchPrompt-result-title">{track.name}</p>
									<p className="SongSearchPrompt-result-subtitle">
										{track.artists.map((artist) => artist.name).join(", ")}
									</p>
								</div>
							</button>
							// </li>
						);
					})}
				</ul>
			</div>
		);
	}
}

export default SongSearchPrompt;
