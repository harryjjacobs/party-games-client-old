import React from "react";
import update from "immutability-helper";
import "../../App.css";
import "./MemePrompt.css";
import MemeRenderer from "./MemeRenderer";

export const INPUT_TYPE_MEME = "meme";

class MemePrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captions: this.getInitialCaptionsText(),
    };
  }

  componentDidUpdate(prevProps) {
    let oldTemplate = prevProps.promptData.template;
    let newTemplate = this.props.promptData.template;
    if (oldTemplate !== newTemplate) {
      this.setState({
        captions: this.getInitialCaptionsText(),
      });
    }
  }

  getInitialCaptionsText() {
    return this.props.promptData.template.captions.map(
      (caption_info) => caption_info.text || ""
    );
  }

  handleSubmit() {
    if (typeof this.props.onSubmit === "function") {
      this.props.onSubmit({
        captions: this.state.captions,
        contestId: this.props.promptData.id,
      });
    }
  }

  render() {
    return (
      <div className="MemePrompt-container">
        <MemeRenderer
          template={this.props.promptData.template}
          captions={this.state.captions}
        />
        <ul className="MemePrompt-captions-container">
          {this.props.promptData.template.captions.map((_, i) => {
            var idx = i;
            return (
              <li key={i} className="MemePrompt-item">
                <label className="MemePrompt-label" htmlFor="textinput">
                  {"Caption " + (i + 1) + ":"}
                </label>
                <input
                  className="App-text-input MemePrompt-input MemePrompt-prompt"
                  name="textinput"
                  id={"textinput" + i}
                  type="text"
                  maxLength={this.props.promptData.maxInputLength}
                  defaultValue={
                    i < this.state.captions.length
                      ? this.state.captions[idx]
                      : ""
                  }
                  onChange={(evt) => {
                    this.setState({
                      captions: update(this.state.captions, {
                        [idx]: { $set: evt.target.value.toUpperCase() },
                      }),
                    });
                  }}
                />
              </li>
            );
          })}{" "}
        </ul>

        <button
          className="MemePrompt-input MemePrompt-submit App-button"
          onClick={() => this.handleSubmit()}
        >
          SUBMIT
        </button>
      </div>
    );
  }
}

export default MemePrompt;
