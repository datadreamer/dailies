var rings = [];
var lastRelease = 0;
var releaseRate = 500;
var minRadius, maxRadius;
var colorRange;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  background(0);
  strokeWeight(10);
  noFill();
  minRadius = windowWidth * 0.1;
  maxRadius = windowWidth * 0.8;
  colorRange = maxRadius - minRadius;
}

function draw(){
  colorMode(HSB, 360);
  // reduce the opacity of the entire raster
  loadPixels();
  for(var i=0; i<pixels.length; i+=4){
    pixels[i] = constrain(pixels[i] - 1, 0, 255);
    pixels[i+1] = constrain(pixels[i+1] - 1, 0, 255);
    pixels[i+2] = constrain(pixels[i+2] - 1, 0, 255);
  }
  updatePixels();

  // release a new walker when ready
  if(millis() - lastRelease > releaseRate){
    this.rings.push(new Ring());
    lastRelease = millis();
  }

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





function Ring(){
  this.pos = createVector(windowWidth/2, windowHeight/2);
  this.rotStart = random(TWO_PI);
  this.rotation = 0;
  this.rotationSpeed = random(-0.02, 0.02);
  this.r = random(minRadius, maxRadius);
  var h = ((this.r - minRadius) / colorRange) * 200;
  this.c = color(h, 360, 360);
  // TODO: get color based on radius
  this.a = 0;
  this.ta = 32;
  this.pa = this.a;
  this.fading = true;
  this.fadeStart = millis();
  this.fadeDuration = 2000;
  this.dead = false;
}

Ring.prototype = {
  constructor:Ring,

  draw:function(){
    this.handleFading();
    this.handleRotation();
    stroke(hue(this.c), saturation(this.c), brightness(this.c), this.a);
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
        this.dead = true;
      }
    } else {
      this.a = ((this.ta - this.pa) * p) + this.pa;
    }
  },

  handleRotation:function(){
    this.rotation += this.rotationSpeed;
    if(this.rotation > TWO_PI && !this.fading){
      this.fading = true;
      this.fadeStart = millis();
      this.ta = 0;
    }
  }
}
