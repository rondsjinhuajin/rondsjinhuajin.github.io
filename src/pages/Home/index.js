import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

class Home extends React.PureComponent {
  componentDidMount() {
    // requestAnimationFrame polyfill by Erik Möller.
    if (!Date.now)
      Date.now = function() {
        return new Date().getTime();
      };
    //iife
    (function() {
      var vendors = ["webkit", "moz"];
      for (
        var i = 0;
        i < vendors.length && !window.requestAnimationFrame;
        ++i
      ) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
        window.cancelAnimationFrame =
          window[vp + "CancelAnimationFrame"] ||
          window[vp + "CancelRequestAnimationFrame"];
      }
      if (
        /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
        !window.requestAnimationFrame ||
        !window.cancelAnimationFrame
      ) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
          var now = Date.now();
          var nextTime = Math.max(lastTime + 16, now);
          return setTimeout(function() {
            callback((lastTime = nextTime));
          }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
      }
    })();
    var getRandomColor = function() {
      return "#" + ((Math.random() * 0xffffff) << 0).toString(16);
    };
    var canvas = document.getElementById("motion"),
      c = canvas.getContext("2d"),
      particles = {},
      particleIndex = 0,
      particleNum = 0.2;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 10;
    function Particle() {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.vx = Math.random() * 6 - 3;
      this.vy = Math.random() * 4 - 2;
      this.growth = (Math.abs(this.vx) + Math.abs(this.vy)) * 0.007;
      particleIndex++;
      particles[particleIndex] = this;
      this.id = particleIndex;
      this.size = Math.random() * 1;
      this.color = getRandomColor();
    }
    Particle.prototype.draw = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.size += this.growth;
      if (this.x > canvas.width || this.y > canvas.height) {
        delete particles[this.id];
      }
      c.fillStyle = this.color;
      c.beginPath();
      c.arc(this.x, this.y, this.size, 0 * Math.PI, 2 * Math.PI);
      c.fill();
    };
    function animate() {
      requestAnimationFrame(animate);

      c.fillStyle = "#fff";
      c.fillRect(0, 0, canvas.width, canvas.height);
      if (Math.random() > particleNum) {
        new Particle();
      }
      for (var i in particles) {
        particles[i].draw();
      }
    }
    requestAnimationFrame(animate);
  }
  render() {
    return (
      <div>
        <canvas id="motion">Canvas is not supported in your browser.</canvas>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            bottom: 0,
            margin: "auto",
            textAlign: "center",
            // height: window.screen.height - 10
            height: 200,
            marginTop: -100
          }}
        >
          {/* <div style={{ display: "flex", alignContent: "center" }}> */}
          <h1>DxxLove</h1>
          <h1>热情，勇敢，奋斗</h1>
          <p>
            <a
              target="_blank"
              href="http://rondsjinhuajin.github.io/vuedemo"
              rel="noopener noreferrer"
            >
              vuedemo
            </a>
          </p>
          <p>
            <Router>
              <Link to="/jinhuajin">日记</Link>
            </Router>
          </p>
          {/* </div> */}
        </div>
      </div>
    );
  }
}
export default Home;
