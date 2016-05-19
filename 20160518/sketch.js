var ribbons = [];
var colors;
var colorIndex = 0;
var releaseRate = 1000;
var lastRelease = 0;
var maxRibbons = 50;
var maxSize = 300;
var minSize = 1;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colors = [color(255,255,255,64), color(0,0,0,64)];
  noStroke();
  background(196);
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
  blendMode(OVERLAY);
  for(var i=0; i<ribbons.length; i++){
    ribbons[i].draw();
  }

  // reduce max size gradually over time
  if(maxSize > 10){
    maxSize -= 0.1;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Ribbon(c){
  this.c = color(255, random(16));
  if(random() > 0.5){
    this.c = color(0, random(16));
  }
  this.w = windowWidth * 0.01;
  this.maxH = maxSize;
  this.minH = 1;
  this.h = this.maxH;//random(this.minH, this.maxH);
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
      this.maxH = maxSize;
      this.h = maxSize;
    }
  }
}
