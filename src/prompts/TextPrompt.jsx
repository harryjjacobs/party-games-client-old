import React from "react";
import update from "immutability-helper";

export const INPUT_TYPE_TEXT = "text";

export default class TextPrompt extends React.Component {
  constructor(props) {
    super(props);

    let initialValues = new Array(this.props.promptData.prompts.length);

    for (let i = 0; i < Math.min(props.promptData.initialValues?.length, initialValues.length); i++)
    {
      initialValues[i] = props.promptData.initialValues[i];
    }

    this.state = { values: initialValues};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleInputChange(index, value) {
    this.setState({
      values: update(this.state.values, { [index]: { $set: value } }),
    });
  }

  handleSubmitClick() {
    if (typeof this.props.onSubmit === "function") {
      this.props.onSubmit({
        values: this.state.values,
        id: this.props.promptData.id,
      });
    }
  }

  renderInputField = (index, prompt, maxLength) => {
    return (
      <div className="TextPrompt-field" key={index}>
        <label className="TextPrompt-label" htmlFor={`textinput_${index}`}>
          {prompt}
        </label>
        <input
          className="App-text-input TextPrompt-input"
          name={`textinput_${index}`}
          id={`textinput_${index}`}
          type="text"
          defaultValue={this.state.values[index]}
          maxLength={maxLength}
          onChange={(event) =>
            this.handleInputChange(index, event.target.value.toUpperCase())
          }
        />
      </div>
    );
  };

  render() {
    return (
      <div className="Prompt-container TextPrompt-container">
        {this.props.promptData.prompts.map((prompt, index) =>
          this.renderInputField(
            index,
            prompt,
            this.props.promptData.maxInputLength
          )
        )}
        <button
          className="TextPrompt-submit App-button"
          onClick={this.handleSubmitClick}
        >
          SUBMIT
        </button>
      </div>
    );
  }
}
