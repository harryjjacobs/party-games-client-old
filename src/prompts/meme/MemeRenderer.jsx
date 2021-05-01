import React from "react";
import WebFont from "webfontloader";
import textFit from "./textFit";

import "./MemeRenderer.css";

WebFont.load({
  google: {
    families: ["Montserrat:400,800"],
  },
});

const CAPTION_TEXT_PADDING = 10; // px

class MemeRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSize: { width: 500, height: 300 },
    };
  }

  initialize() {
    this.imageData = "data:image/png;base64, " + this.props.template.image;
    this.initializeSvgSize();
  }

  initializeSvgSize() {
    var image = new Image();
    image.onload = () => {
      this.setState({
        imageSize: { width: image.naturalWidth, height: image.naturalHeight },
      });
    };
    image.src = this.imageData;
  }

  applyTextFit() {
    this.props.template.captions.forEach((captionTemplate, i) => {
      var hAlign = captionTemplate.center_h;
      var vAlign = captionTemplate.center_v;
      var maxFontSize = 100;
      var minFontSize = 6;
      if (captionTemplate.font_size) {
        maxFontSize = captionTemplate.font_size;
      }
      textFit(document.getElementById(this.captionTextId(i)), {
        multiLine: true,
        reProcess: true,
        alignHoriz: hAlign,
        alignVert: vAlign,
        maxFontSize: maxFontSize,
        minFontSize: minFontSize,
      });
    });
  }

  rgba(rgba) {
    return [
      "rgba(",
      Math.round(rgba.r * 255),
      ",",
      Math.round(rgba.g * 255),
      ",",
      Math.round(rgba.b * 255),
      ",",
      Math.round(rgba.a * 255),
      ")",
    ].join("");
  }

  captionTextId(key) {
    return `MemeRenderer-caption-text_${key}`;
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.template !== this.props.template) {
      this.initialize();
    }
    this.applyTextFit();
  }

  renderCaption(key, captionTemplate, captionText) {
    return (
      <foreignObject
        key={key}
        x={captionTemplate.area.x}
        y={captionTemplate.area.y}
        width={captionTemplate.area.width}
        height={captionTemplate.area.height}
        transform={`rotate(${captionTemplate.rotation} ${captionTemplate.area.x} ${captionTemplate.area.y})`}
      >
        <div
          className="MemeRenderer-caption"
          style={{
            width: captionTemplate.area.width,
            height: captionTemplate.area.height,
            backgroundColor: this.rgba(captionTemplate.background_color),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              height: `calc(100% - ${CAPTION_TEXT_PADDING}px)`,
              width: `calc(100% - ${CAPTION_TEXT_PADDING}px)`,
              fontFamily: captionTemplate.font_family || "Montserrat",
              fontWeight: "bolder",
              color: this.rgba(captionTemplate.text_color),
            }}
            id={this.captionTextId(key)}
          >
            {captionText}
          </div>
        </div>
      </foreignObject>
    );
  }

  render() {
    return (
      <div className="MemePrompt-renderer">
        <div className="MemeRenderer-canvas-container">
          <svg
            className="MemeRenderer-svg"
            height="100%"
            width="100%"
            viewBox={`0 0 ${this.state.imageSize.width} ${this.state.imageSize.height}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <image
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              href={this.imageData}
            ></image>
            {this.props.template.captions.map((e, i) =>
              this.renderCaption(i, e, this.props.captions[i])
            )}
          </svg>
        </div>
      </div>
    );
  }
}

export default MemeRenderer;
