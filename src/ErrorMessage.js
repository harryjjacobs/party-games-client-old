import React from "react";

class ErrorMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: props.show,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      // Rising edge

      this.setState({ visible: this.props.show });

      if (this.props.timeout) {
        // Clear the previous timeout
        if (this.timer) {
          clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
          this.setState({ visible: false });
          if (typeof this.props.onHide === "function") {
            this.props.onHide();
          }
        }, this.props.timeout);
      }
    }
  }

  render() {
    if (this.state.visible) {
      return (
        <div className="ErrorMessage-container">
          <span className="ErrorMessage-text">{this.props.message}</span>
        </div>
      );
    }

    return null;
  }
}

export default ErrorMessage;
