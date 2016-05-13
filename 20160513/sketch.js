var rings = [];
var lastRelease = 0;
var releaseRate = 500;
var minRadius, maxRadius;
var colorRange;
var lineWeight;
var xCount = 10;
var yCount, spacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  background(0);
  noFill();
  minRadius = windowWidth * 0.1;
  maxRadius = windowWidth * 0.8;
  colorRange = maxRadius - minRadius;
  lineWeight = windowWidth * 0.02;
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  for(var y=0; y<yCount; y++){
    var ypos = y*spacing + (spacing/2);
    for(var x=0; x<xCount; x++){
      var xpos = x*spacing + (spacing/2);
      this.rings.push(new Ring(xpos, ypos));
    }
  }
}

function draw(){
  colorMode(RGB, 255);
  strokeWeight(lineWeight);
  // reduce the opacity of the entire raster
  loadPixels();
  for(var i=0; i<pixels.length; i+=4){
    pixels[i] = constrain(pixels[i] - 1, 0, 255);
    pixels[i+1] = constrain(pixels[i+1] - 1, 0, 255);
    pixels[i+2] = constrain(pixels[i+2] - 1, 0, 255);
  }
  updatePixels();

  // blend to black
  blendMode(SCREEN);

  // draw and/or kill rings
  for(var i=this.rings.length-1; i>=0; i--){
    this.rings[i].draw();
    if(this.rings[i].dead){
      this.rings.splice(i,1);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}





function Ring(x, y){
  this.pos = createVector(x, y);
  this.reset();
}

Ring.prototype = {
  constructor:Ring,

  draw:function(){
    this.handleFading();
    this.handleRotation();
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotStart + this.rotation);
    arc(0, 0, this.r, this.r, 0, 0.1);
    pop();
  },

  handleFading:function(){
    var p = (millis() - this.fadeStart) / this.fadeDuration;
    if(p >= 1){
      this.a = this.ta;
      this.pa = this.a;
      this.fading = false;
      if(this.a == 0){
        this.reset();//this.dead = true;
      }
    } else {
      this.a = ((this.ta - this.pa) * p) + this.pa;
    }
  },

  handleRotation:function(){
    this.rotation += this.rotationSpeed;
    if(abs(this.rotation) > TWO_PI && !this.fading){
      this.fading = true;
      this.fadeStart = millis();
      this.ta = 0;
    }
  },

  reset:function(){
    this.rotStart = random(TWO_PI);
    this.rotation = 0;
    this.rotationSpeed = random(0.01, 0.02);
    if(random() > 0.5){
      this.rotationSpeed *= -1;
    }
    this.r = spacing*1.5;
    // var rando = random();
    // if(rando < 0.33){
    //   this.c = color(255,0,0);
    // } else if(rando >= 0.33 && rando < 0.66){
    //   this.c = color(0,255,0);
    // } else {
    //   this.c = color(0,0,255);
    // }
    this.c = color(255);
    this.a = 0;
    this.ta = 32;
    this.pa = this.a;
    this.fading = true;
    this.fadeStart = millis();
    this.fadeDuration = 2000;
    this.dead = false;
  }
}
