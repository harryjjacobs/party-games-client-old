import React from "react";

export const INPUT_TYPE_MULTI_CHOICE = "multichoice";

class MultiChoicePrompt extends React.Component {
  constructor(props) {
    super(props);

    this.handleChoiceClick = this.handleChoiceClick.bind(this);
  }

  handleChoiceClick(choice) {
    if (typeof this.props.onSubmit === "function") {
      this.props.onSubmit({
        contestId: this.props.promptData.contestId,
        choice: choice,
      });
    }
  }

  render() {
    return (
      <ul className="MultiChoicePrompt-container">
        <span className="MultiChoicePrompt-label">
          {this.props.promptData.prompt}
        </span>
        {this.props.promptData.options.map((item, i) => {
          return (
            <li key={i} className="MultiChoicePrompt-item">
              <button
                className="App-button"
                onClick={() => this.handleChoiceClick(i)}
              >
                <pre>{item}</pre>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default MultiChoicePrompt;
