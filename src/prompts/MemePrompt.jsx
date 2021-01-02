import React from 'react';
import '../App.css'
import './MemePrompt.css';

export const INPUT_TYPE_MEME_PROMPT = "meme";

class MemePrompt extends React.Component {

  constructor(props) {
    super(props);
    this.captions = Array(props.data.template.captions.length).fill("<Insert Caption Here>");
  }

  componentDidMount() {
    var canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.img = this.refs.image;
    this.img.onload = () => {
      console.log("Image loaded");
      this.getOriginalImageSize(this.img, (size) => {
        this.unscaledImageSize = size;
        this.resizeCanvas();
        this.redrawCanvas();
        // resize the canvas to fill browser window dynamically
        window.addEventListener('resize', () => {
          this.resizeCanvas();
          this.redrawCanvas();
        }, false);
      });
    }
  }

  handleSubmit() {
    if (typeof (this.props.onSubmit) === 'function') {
      this.props.onSubmit({
        captions: this.captions,
        templateId: this.props.data.template.id
      });
    }
  }

  redrawCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.drawImage(this.img, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    console.log(this.captions);
    this.props.data.template.captions.forEach((info, i) => {
      var area = info.area;
      var color = info.color;
      this.ctx.fillStyle = "#" + (color.r).toString(16) + (color.g).toString(16) + (color.b).toString(16);
      this.drawTextWithinRect(this.ctx, this.captions[i], area.x * this.imageScale, area.y * this.imageScale, area.width * this.imageScale, area.height * this.imageScale);
      // For debugging:
      //this.ctx.fillRect(area.x * this.imageScale, area.y * this.imageScale, area.width * this.imageScale, area.height * this.imageScale);
    });
  }

  getOriginalImageSize(el, onReady) {
    var src = typeof el.attr === 'function' ? el.attr('src') : el.src !== undefined ? el.src : el;
    var image = new Image();
    image.onload = function () {
      if (typeof (onReady) == 'function') {
        onReady({
          width: image.width,
          height: image.height
        });
      }
    };
    image.src = src;
  }

  resizeCanvas() {
    this.ctx.canvas.width = document.getElementById('canvasContainer').offsetWidth;
    if (this.unscaledImageSize) {
      this.imageScale = this.ctx.canvas.width / this.unscaledImageSize.width;
      this.ctx.canvas.height = this.unscaledImageSize.height * this.imageScale;
    }
  }

  drawTextWithinRect(ctx, text, x, y, w, h) {
    var fontSize = 80;  // Set to something very large initially and then scale down until it fits
    var width = w;
    var lineTest = '';
    var words = text.split(' ');
    var fits = false;

    while (!fits) {
      var lines = [];
      var line = '';
      var currentY = 0;
      var maxX = 0;
      ctx.font = fontSize + 'px Arial';
      for (let i = 0, len = words.length; i < len; i++) {
        lineTest = line + words[i] + ' ';

        // Check total width of line or last word
        if (ctx.measureText(lineTest).width > width) {
          // Calculate the new height
          currentY = lines.length * fontSize + fontSize;
          // Record and reset the current line
          lines.push({ text: line, height: currentY });
          line = words[i] + ' ';
          // Record how wide this line is
          let currentWidth = ctx.measureText(line).width; // Measure the width of the current line
          if (currentWidth > maxX) {
            maxX = currentWidth;    // Update maximum x position with new width
          }
        } else {
          line = lineTest;
        }
      }
      // Catch last line in-case something is left over
      if (line.length > 0) {
        currentY = lines.length * fontSize + fontSize;
        lines.push({ text: line.trim(), height: currentY });
        // Record how wide this line is
        let currentWidth = ctx.measureText(line).width; // Measure the width of the current line
        if (currentWidth > maxX) {
          maxX = currentWidth;    // Update maximum x position with new width
        }
      }
      // Check whether the text fits in the y dimension of the rect
      fits = (currentY <= h) && (maxX <= width);
      fontSize -= 5;
    }
    // Draw text on canvas
    for (let i = 0, len = lines.length; i < len; i++) {
      ctx.fillText(lines[i].text, x, y + lines[i].height);
    }
  }

  render() {
    return (
      <div className="MemePrompt-container">
        <div id="canvasContainer" className="MemePrompt-canvas-container">
          <canvas ref="canvas" />
        </div>
        <img ref="image"
          alt="meme template"
          className="hidden"
          src={window.location.origin + this.props.data.template.image}
          onLoad={this.initCanvas} />
        <ul className="MemePrompt-captions-container"> {
          this.props.data.template.captions.map((item, i) => {
            var idx = i;
            return <li key={i} className="MemePrompt-item">
              <label className="MemePrompt-label"
                htmlFor="textinput">{"Caption " + (i + 1) + ":"}</label>
              <input className="App-text-input MemePrompt-input MemePrompt-prompt"
                name="textinput" id={"textinput" + i} type="text"
                onChange={(evt) => {
                  this.captions[idx] = evt.target.value;
                  this.redrawCanvas();
                }} />
            </li>
          })
        } </ul>

        <button className="MemePrompt-input MemePrompt-submit App-button"
          onClick={() => this.handleSubmit()}>SUBMIT</button>
      </div>
    );
  }
}

export default MemePrompt;