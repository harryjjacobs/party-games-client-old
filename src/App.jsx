import React from "react";
import Comms from "./Comms";
import ErrorMessage from "./ErrorMessage";
import TextPrompt, { INPUT_TYPE_TEXT } from "./prompts/TextPrompt";
import MultiChoicePrompt, {
  INPUT_TYPE_MULTI_CHOICE,
} from "./prompts/MultiChoicePrompt";
import MemePrompt, { INPUT_TYPE_MEME } from "./prompts/meme/MemePrompt";
import ButtonPrompt, { INPUT_TYPE_BUTTON } from "./prompts/ButtonPrompt";

import "./App.css";

const MAX_USERNAME_LENGTH = 15;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      joined: false,
      username: "",
      showError: false,
      errorText: "",
      showPrompt: false,
      messageData: {},
    };

    this.commsRef = React.createRef();
  }

  sendPromptResponse = (responseData) => {
    this.commsRef.current.sendPromptResponse(responseData);
  };

  sendJoinRequest = (roomCode, username) => {
    this.commsRef.current.requestJoin(roomCode, username);
  };

  renderInputPrompt = () => {
    console.log(this.state.messageData);
    var promptType = this.state.messageData.promptType;
    var Prompt;
    if (promptType === INPUT_TYPE_BUTTON) {
      Prompt = ButtonPrompt;
    } else if (promptType === INPUT_TYPE_MEME) {
      Prompt = MemePrompt;
    } else if (promptType === INPUT_TYPE_MULTI_CHOICE) {
      Prompt = MultiChoicePrompt;
    } else if (promptType === INPUT_TYPE_TEXT) {
      Prompt = TextPrompt;
    } else {
      console.warn(
        "[renderInputPrompt] promptType " + promptType + " invalid."
      );
      return null;
    }

    return (
      <Prompt
        className="App-question-prompt"
        promptData={this.state.messageData.promptData}
        onSubmit={(data) => this.sendPromptResponse(data)}
      />
    );
  };

  renderJoinInput = () => {
    var searchParams = new URLSearchParams(window.location.search);
    var room_code = searchParams.get("room") || "";
    return (
      <TextPrompt
        className="App-join-prompt"
        promptData={{
          prompts: ["ROOM CODE", "USERNAME"],
          initialValues: [room_code, ""],
          maxInputLength: MAX_USERNAME_LENGTH
        }}
        onSubmit={(response) =>
          this.sendJoinRequest(response.values[0], response.values[1])
        }
      />
    );
  };

  renderBody = () => {
    if (this.state.joined) {
      if (this.state.showPrompt) {
        return this.renderInputPrompt();
      }
    } else {
      return this.renderJoinInput();
    }
    return null;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">Party Games</header>
        <div className="App-body">
          <Comms
            ref={this.commsRef}
            onJoinStateChanged={(state) => this.setState({ joined: state })}
            onShowInputPrompt={(data) =>
              this.setState({ showPrompt: true, messageData: data })
            }
            onHideInputPrompt={() => this.setState({ showPrompt: false })}
            onError={(msg) =>
              this.setState({ showError: true, errorText: msg })
            }
          />

          {this.renderBody()}

          <ErrorMessage
            show={this.state.showError}
            timeout={2000}
            message={this.state.errorText}
            onHide={() => this.setState({ showError: false })}
          />
        </div>
      </div>
    );
  }
}

export default App;
