import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./index.css";
import App from "./App";

function memePromptStandalone() {
  let PRODUCTION = process.env.NODE_ENV === "production";
  if (!PRODUCTION) {
    const MemePromptStandalone = require("./prompts/meme/MemePromptStandalone")
      .default;
    return (
      <Route exact path="/memes/test">
        <MemePromptStandalone />
      </Route>
    );
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
        {memePromptStandalone()}
      </Switch>
    </div>
  </Router>,
  document.getElementById("root")
);
