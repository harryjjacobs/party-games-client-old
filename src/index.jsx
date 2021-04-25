import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import "./index.css";
import App from "./App";
import MemePromptStandalone from "./prompts/meme/MemePromptStandalone";

ReactDOM.render(
  <Router>
    <div>
      <Switch>
        <Route exact path="/">
          404 - Page not found
        </Route>
        <Route exact path="/memes">
          <App socketUrl="ws://localhost:80/memes" />
        </Route>
        <Route exact path="/memes/test">
          <MemePromptStandalone />
        </Route>
        <Route exact path="/quiz">
          <App socketUrl="ws://localhost:80/quiz" />
        </Route>
      </Switch>
    </div>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
