import React from 'react';
import Comms from './Comms';
import ErrorMessage from "./ErrorMessage";
import TextPrompt, { INPUT_TYPE_TEXT } from "./prompts/TextPrompt";
import MultiChoicePrompt, { INPUT_TYPE_MULTI_CHOICE } from "./prompts/MultiChoicePrompt";
import MemePrompt, { INPUT_TYPE_MEME_PROMPT } from "./prompts/MemePrompt"
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      joined: false,
      username: "",
      showError: false,
      errorText: "",
      showPrompt: false,
      promptData: {},
    };

    this.commsRef = React.createRef();
  }

  sendPromptResponse = (responseData) => {
    this.commsRef.current.sendPromptResponse(responseData);
  }

  sendJoinRequest = (roomCode, username) => {
    this.commsRef.current.requestJoin(roomCode, username);
  }

  renderInputPrompt = () => {
    var inputType = this.state.promptData.type;
    var Prompt;
    if (inputType === INPUT_TYPE_MEME_PROMPT) {
      Prompt = MemePrompt;
    } else if (inputType === INPUT_TYPE_MULTI_CHOICE) {
      Prompt = MultiChoicePrompt;
    } else if (inputType === INPUT_TYPE_TEXT) {
      Prompt = TextPrompt;
    } else {
      console.warn("[renderInputPrompt] inputType " + inputType + " invalid.");
    }

    return <Prompt className="App-question-prompt"
      data={this.state.promptData}
      onSubmit={data => this.sendPromptResponse(data)}
    />
  }

  renderJoinInput = () => {
    return (
      <TextPrompt className="App-join-prompt"
        data={
          { prompts: ["ROOM CODE", "USERNAME"] }
        }
        onSubmit={
          (response) => this.sendJoinRequest(response[0], response[1])
        }
      />
    );
  }

  renderBody = () => {
    if (this.state.joined) {
      if (this.state.showPrompt) {
        return this.renderInputPrompt();
      }
    } else {
      return this.renderJoinInput();
    }
    return null;
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header" >
          Party Games
          </header>
        <div className="App-body">
          <Comms socketUrl={this.props.socketUrl}
            ref={this.commsRef}
            onJoinStateChanged={
              (state) => this.setState({ joined: state })
            }
            onShowInputPrompt={
              (data) => this.setState({ showPrompt: true, promptData: data })
            }
            onHideInputPrompt={
              () => this.setState({ showPrompt: false })
            }
            onError={
              (msg) => this.setState({ showError: true, errorText: msg })
            } />

          {this.renderBody()}

          <ErrorMessage show={this.state.showError}
            timeout={2000}
            message={this.state.errorText}
            onHide={
              () => this.setState({ showError: false })
            } />
        </div>
      </div>
    );
  }
}

export default App;