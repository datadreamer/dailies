var ribbons = [];
var colors;
var colorIndex = 0;
var releaseRate = 1000;
var lastRelease = 0;
var maxRibbons = 50;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colors = [color(255,255,255,8)];
  noStroke();
  background(0);
  rectMode(CENTER);
}

function draw(){
  // check to see if it's time to release a ribbon
  if(ribbons.length < maxRibbons){
    if(millis() - lastRelease > releaseRate){
      ribbons.push(new Ribbon(colors[colorIndex]));
      colorIndex++;
      if(colorIndex >= colors.length){
        colorIndex = 0;
      }
      lastRelease = millis();
    }
  }

  // draw the ribbons
  blendMode(ADD);
  for(var i=0; i<ribbons.length; i++){
    ribbons[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Ribbon(c){
  this.c = color(255, random(8));
  this.w = windowWidth * 0.01;
  this.maxH = this.w;
  this.minH = 1;
  this.h = random(this.minH, this.maxH);
  this.x = 0-this.w;
  this.y = random(windowHeight);
  this.xvec = 1;
  this.yvec = random(-0.1,0.1);
  this.damping = 0.97;
}

Ribbon.prototype = {
  constructor:Ribbon,

  draw:function(){
    // move the ribbon
    this.x += this.xvec;
    this.y += this.yvec;
    this.yvec *= this.damping;
    this.yvec += random(-0.1, 0.1);
    // resize the ribbon as it goes
    this.h += random(-1, 1);
    if(this.h > this.maxH){
      this.h = this.maxH;
    } else if(this.h < this.minH){
      this.h = this.minH;
    }
    // draw it
    fill(this.c);
    rect(this.x, this.y, this.w, this.h);
    // prevent from going too far up or down off screen
    if(this.y < -this.h){
      this.y = -this.h;
    } else if(this.y > windowHeight){
      this.y = windowHeight;
    }
    // reset if it goes off the edge
    if(this.x > windowWidth){
      this.x = 0-this.w;
      this.y = random(windowHeight);
    }
  }
}
