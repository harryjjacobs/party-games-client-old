import React from "react";
import MemePrompt from "./MemePrompt";

import bernie from "./templates/BernieOnceAgainAsking.json";
import boyfriend from "./templates/DistractedBoyfriend.json";
import changeMyMind from "./templates/ChangeMyMind.json";
import expandingBrain from "./templates/ExpandingBrain.json";

const TEMPLATES = {
  BernieOnceAgainAsking: bernie,
  DistractedBoyfriend: boyfriend,
  ChangeMyMind: changeMyMind,
  ExpandingBrain: expandingBrain,
};

class MemePromptStandalone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTemplateName: Object.keys(TEMPLATES)[0],
    };
    console.log(TEMPLATES[this.state.selectedTemplateName]);
  }

  render() {
    return (
      <div style={{ backgroundColor: "#1f4f7f", textAlign: "center" }}>
        <select
          style={{ marginTop: "10vw" }}
          defaultValue={this.state.selectedTemplateName}
          onChange={(e) =>
            this.setState({ selectedTemplateName: e.target.value })
          }
        >
          {Object.keys(TEMPLATES).map((templateName) => {
            return (
              <option value={templateName} key={templateName}>
                {templateName}
              </option>
            );
          })}
        </select>
        <MemePrompt
          promptData={{ template: TEMPLATES[this.state.selectedTemplateName] }}
        />
      </div>
    );
  }
}

export default MemePromptStandalone;
