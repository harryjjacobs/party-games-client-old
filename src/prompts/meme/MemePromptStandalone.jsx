import React from "react";
import MemePrompt from "./MemePrompt";

import bernie from "./templates/BernieOnceAgainAsking.json";
import boyfriend from "./templates/DistractedBoyfriend.json";

class MemePromptStandalone extends React.Component {
  constructor(props) {
    super(props);
    this.selectedTemplate = boyfriend;
    console.log(this.selectedTemplate);
  }

  render() {
    return <MemePrompt promptData={{ template: this.selectedTemplate }} />;
  }
}

export default MemePromptStandalone;
