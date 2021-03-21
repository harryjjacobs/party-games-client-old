import React from 'react';
import '../App.css'
import './MemePrompt.css';

export const INPUT_TYPE_MEME = "meme";

class MemePrompt extends React.Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.imageRef = React.createRef();
    this.captions = Array(props.promptData.template.captions.length).fill("<Insert Caption Here>");
  }

  componentDidMount() {
    var canvas = this.canvasRef.current;
    this.ctx = canvas.getContext("2d");
    this.img = this.imageRef.current;
    this.img.onload = () => {
      //console.log("Image loaded");
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
    if ((typeof this.props.onSubmit) === 'function') {
      this.props.onSubmit({
        captions: this.captions,
        contestId: this.props.promptData.id
      });
    }
  }

  redrawCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.drawImage(this.img, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.props.promptData.template.captions.forEach((info, i) => {
      var area = info.area;
      var text_color = this.rgba(
        info.text_color.r,
        info.text_color.g,
        info.text_color.b,
        info.text_color.a)
      var background_color = this.rgba(
        info.background_color.r,
        info.background_color.g,
        info.background_color.b,
        info.background_color.a);
      var rotation = info.rotation;
      var center_h = info.center_h;
      var center_v = info.center_v;
      this.drawTextWithinRect(this.ctx, this.captions[i],
        area.x * this.imageScale,
        area.y * this.imageScale,
        area.width * this.imageScale,
        area.height * this.imageScale,
        rotation,
        text_color,
        background_color,
        center_h,
        center_v
      );
      // For debugging:
      // console.log(this.ctx.canvas.width);
      // console.log(this.imageScale);
      // console.log(area.x * this.imageScale);
      //this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.width);
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
    // Make it visually fill the positioned parent
    this.ctx.canvas.style.width = '100%';
    this.ctx.canvas.style.height = '100%';
    // ...then set the internal size to match
    this.ctx.canvas.width = this.ctx.canvas.offsetWidth;
    this.ctx.canvas.height = this.ctx.canvas.offsetHeight;
    if (this.unscaledImageSize) {
      this.imageScale = this.ctx.canvas.width / this.unscaledImageSize.width;
      this.ctx.canvas.height = this.unscaledImageSize.height * this.imageScale;
    }
  }

  drawTextWithinRect(ctx, text, x, y, w, h, rotation, text_color, background_color, center_h, center_v) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * (Math.PI / 180));
    this.ctx.fillStyle = background_color;
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.fillStyle = text_color;
    var fontSize = 180;  // Set to something very large initially and then scale down until it fits
    var width = w;
    var lineTest = '';
    var words = text.split(' ');
    var fits = false;
    while (!fits) {
      var lines = [];
      var line = '';
      var currentY = 0;
      var maxX = 0;
      ctx.font = `bold ${fontSize}px Montserrat`;
      if (center_h) {
        ctx.textAlign = "center";
      }
      ctx.textBaseline = 'top';
      for (let i = 0, len = words.length; i < len; i++) {
        lineTest = line + words[i] + ' ';
        // Check total width of line or last word
        if (ctx.measureText(lineTest).width > width) {
          currentY = lines.length * fontSize;
          // Record and reset the current line
          lines.push({ text: line, height: currentY });
          // Calculate the new height
          currentY += fontSize;
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
        currentY = lines.length * fontSize;
        lines.push({ text: line.trim(), height: currentY });
        currentY += fontSize;
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
    var originX = 0;
    var originY = 0;
    if (center_h) {
      var totalLineHeight = fontSize * lines.length;
      originX = w / 2;
    }
    if (center_v) {
      originY = (h - totalLineHeight) / 2;
    }
    // Draw text on canvas
    for (let i = 0, len = lines.length; i < len; i++) {
      ctx.fillText(lines[i].text, originX, originY + lines[i].height);
    }
    ctx.restore();
  }

  rgba(r, g, b, a) {
    return ["rgba(", r, ",", g, ",", b, ",", a, ")"].join("");
  }

  render() {
    return (
      <div className="MemePrompt-container">
        <div id="canvasContainer" className="MemePrompt-canvas-container">
          <canvas ref={this.canvasRef} />
        </div>
        <div style={{ fontFamily: "Montserrat", opacity: 0 }} >.</div> {/* force font to load */}
        <img ref={this.imageRef}
          alt="meme template"
          className="hidden"
          src={"data:image/png;base64, " + this.props.promptData.template.image}
          onLoad={this.initCanvas} />
        <ul className="MemePrompt-captions-container"> {
          this.props.promptData.template.captions.map((item, i) => {
            var idx = i;
            return <li key={i} className="MemePrompt-item">
              <label className="MemePrompt-label"
                htmlFor="textinput">{"Caption " + (i + 1) + ":"}</label>
              <input className="App-text-input MemePrompt-input MemePrompt-prompt"
                name="textinput" id={"textinput" + i} type="text"
                onChange={(evt) => {
                  this.captions[idx] = evt.target.value.toUpperCase();
                  this.redrawCanvas();
                }} />
            </li>
          })
        } </ul>

        <button className="MemePrompt-input MemePrompt-submit App-button"
          onClick={() => this.handleSubmit()}>SUBMIT</button>
      </div >
    );
  }
}

export default MemePrompt;