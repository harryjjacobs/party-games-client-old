import React from 'react';
import update from 'immutability-helper';

export const INPUT_TYPE_TEXT = 'text';

export default class TextPrompt extends React.Component {

  constructor(props) {
    super(props);
    this.state = { values: new Array(this.props.promptData.prompts.length) };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleInputChange(index, value) {
    this.setState({ values: update(this.state.values, { [index]: { $set: value } }) });
  }

  handleSubmitClick() {
    if (typeof (this.props.onSubmit) === 'function') {
      this.props.onSubmit({
        values: this.state.values,
        id: this.props.promptData.id
      });
    }
  }

  renderInputField = (index, prompt) => {
    return (
      <div className="TextPrompt-field" key={index}>
        <label className="TextPrompt-input TextPrompt-label"
          htmlFor={`textinput_${index}`}>{prompt}</label>
        <input className="App-text-input TextPrompt-input TextPrompt-prompt"
          name={`textinput_${index}`} id={`textinput_${index}`} type="text"
          value={this.state.value}
          onChange={(event) => this.handleInputChange(index, event.target.value.toUpperCase())}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="TextPrompt-container" >
        {
          this.props.promptData.prompts.map((prompt, index) => this.renderInputField(index, prompt))
        }
        <button className="TextPrompt-input TextPrompt-submit App-button"
          onClick={this.handleSubmitClick} >SUBMIT</button>
      </div>
    );
  }
}