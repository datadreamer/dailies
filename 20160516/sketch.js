var ribbons = [];
var colors;
var colorIndex = 0;
var releaseRate = 1000;
var lastRelease = 0;
var maxRibbons = 12;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colors = [color(0,255,255), color(255,0,255), color(255,255,0)];
  noStroke();
  background(255);
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

  // push all pixels gradually towards white
  loadPixels();
  for(var i=0; i<pixels.length; i+=4){
    pixels[i] = constrain(pixels[i] + 1, 0, 255);
    pixels[i+1] = constrain(pixels[i+1] + 1, 0, 255);
    pixels[i+2] = constrain(pixels[i+2] + 1, 0, 255);
  }
  updatePixels();

  // draw the ribbons
  blendMode(MULTIPLY);
  for(var i=0; i<ribbons.length; i++){
    ribbons[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Ribbon(c){
  this.c = c;
  this.w = windowWidth * 0.01;
  this.h = windowHeight * 0.1;
  this.x = 0-this.w;
  this.y = random(windowHeight);
  this.xvec = 1;
  this.yvec = random(-1,1);
  this.damping = 0.97;
}

Ribbon.prototype = {
  constructor:Ribbon,

  draw:function(){
    this.x += this.xvec;
    this.y += this.yvec;
    this.yvec *= this.damping;
    this.yvec += random(-1,1);
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
    }
  }
}
