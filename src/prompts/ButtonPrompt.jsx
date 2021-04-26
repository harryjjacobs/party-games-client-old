import React from "react";

export const INPUT_TYPE_BUTTON = "button";

class ButtonPrompt extends React.Component {
  handleButtonPress() {
    if (typeof this.props.onSubmit === "function") {
      this.props.onSubmit({
        type: INPUT_TYPE_BUTTON,
        id: this.props.promptData.id,
      });
    }
  }

  render() {
    return (
      <div className="MultiChoicePrompt-container">
        <button className="App-button" onClick={() => this.handleButtonPress()}>
          {this.props.promptData.prompt}
        </button>
      </div>
    );
  }
}

export default ButtonPrompt;
