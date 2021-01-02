import React from 'react';

export const INPUT_TYPE_MULTI_CHOICE = "multichoice";

class MultiChoicePrompt extends React.Component {

  constructor(props) {
    super(props);

    this.handleChoiceClick = this.handleChoiceClick.bind(this);
  }

  handleChoiceClick(choice) {
    if (typeof (this.props.onSubmit) === 'function') {
      this.props.onSubmit({
        type: INPUT_TYPE_MULTI_CHOICE,
        id: this.props.data.id,
        choice: choice
      });
    }
  }

  render() {
    return (
      <ul className="MultiChoicePrompt-container">
        <span className="MultiChoicePrompt-label">
          {this.props.data.prompt}
        </span>
        {this.props.data.options.map((item, i) => {
          return <li key={i} className="MultiChoicePrompt-item">
            <button className="App-button"
              onClick={() => this.handleChoiceClick(i)} >{item}</button>
          </li>
        })}
      </ul>
    );
  }
}

export default MultiChoicePrompt;