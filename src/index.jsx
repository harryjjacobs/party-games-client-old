import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./index.css";
import App from "./App";

function developmentRoutes() {
	let PRODUCTION = process.env.NODE_ENV === "production";
	if (!PRODUCTION) {
		const MemePromptStandalone =
			require("./prompts/meme/MemePromptStandalone").default;
		const SongSearchPrompt =
			require("./prompts/musiq/SongSearchPrompt").default;
		return [
			<Route key="memes" exact path="/meme_prompt">
				<MemePromptStandalone />
			</Route>,
			<Route key="musiq" exact path="/song_search_prompt">
				<SongSearchPrompt />
			</Route>,
		];
	}
	return null;
}

ReactDOM.render(
	<Router>
		<div>
			<Switch>
				<Route exact path="/">
					<App />
				</Route>
				{developmentRoutes()}
			</Switch>
		</div>
	</Router>,
	document.getElementById("root")
);
