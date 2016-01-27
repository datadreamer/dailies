var rects = [];
var rectCount = 30;
var centerX, centerY, rectSize;
var targetRectSize, pastRectSize;
var rectSizing = false;
var rectSizingStart;
var angleDiff = 0;
var delayDuration = 150;
var fadeDuration = 3000;
var spinDuration = 6000;
var rectSizingDuration = 1000;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  //stroke(0);
  //rectMode(CENTER);

  // update values
  centerX = windowWidth/2;
  centerY = windowHeight/2;
  rectSize = windowHeight/2;

  angleDiff = 0.5;
  for(var i=0; i<rectCount; i++){
    var c = getColor((255 / rectCount) * i);
    var a = angleDiff * i;
    var d = i * delayDuration;
    var r = new Rectangle(i, c, a, d, fadeDuration);
    //r.resize(windowHeight, 500 * i);
    r.resize(random(windowHeight), 500 * i);
    rects.push(r);
  }
}

function draw(){
  blendMode(NORMAL);
  background(255);
  blendMode(MULTIPLY);
  for(var i=0; i<rects.length; i++){
    rects[i].draw();
  }
}

function getColor(pos){
  // returns a value from the CMY spectrum
  var cyan = color(0, 174, 239);
  var magenta = color(236, 0, 140);
  var yellow = color(255, 242, 0);
  if(pos >= 0 && pos < 85){ // C to M
    return lerpColor(cyan, magenta, (pos / 85));
  } else if(pos >= 85 && pos < 170){  // M to Y
    return lerpColor(magenta, yellow, ((pos-85) / 85));
  } else {  // Y to C
    return lerpColor(yellow, cyan, ((pos-170) / 85));
  }
}

function mousePressed(){
  pastRectSize = rectSize;
  var xdiff = mouseX - centerX;
  var ydiff = mouseY - centerY;
  targetRectSize = sqrt(xdiff*xdiff + ydiff*ydiff);
  for(var i=0; i<rects.length; i++){
    rects[i].resize(targetRectSize, 500 * i);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  // update values
  centerX = windowWidth/2;
  centerY = windowHeight/2;
  rectSize = windowWidth/2;
  if(windowHeight < windowWidth){
    rectSize = windowHeight/2;
  }
}





function Rectangle(id, c, a, d, f){
  this.id = id;
  this.c = c;
  //this.angle = a - angleDiff;
  this.alpha = 0;
  this.rectsize = rectSize;
  this.rectwidth = this.rectsize/5;
  this.angleAdd = (PI - ((this.rectsize / (windowWidth/2)) * PI)) + 0.1;
  this.angle = a - this.angleAdd;

  // this.x = centerX;
  // this.y = (windowHeight/rectCount) * this.id;
  this.x = (windowWidth/rectCount) * this.id;
  this.y = windowHeight;

  this.delayDuration = d;
  this.fadeDuration = f;
  this.rotateDuration = spinDuration;
  this.sizingDuration = f;

  this.delaying = true;
  this.fading = false;
  this.rotating = false;
  this.sizing = false;
  this.noisy = true;
  this.delaySizing = false;
  this.delaySizingStart = 0;
  this.delaySizingDuration = 0;

  this.maxAlpha = 100;
  this.targetAlpha = this.maxAlpha;
  this.pastAlpha = this.alpha;
  this.targetAngle = a;
  this.pastAngle = this.angle;
  this.targetSize = rectSize;
  this.pastSize = 0;

  this.delayStart = millis();
  this.fadeStart = 0;
  this.rotateStart = 0;
  this.sizingStart = 0;
}

Rectangle.prototype = {
  constructor:Rectangle,

  draw:function(){
    this.handleDelaying();
    this.handleFading();
    this.handleRotating();
    this.handleSizing();

    // this.x = centerX;
    // this.y = (windowHeight/rectCount) * this.id;
    this.x = (windowWidth/rectCount) * this.id;
    this.y = windowHeight;
    this.rectwidth = this.rectsize/5;

    push();
    fill(red(this.c), green(this.c), blue(this.c), this.alpha);
    //translate(centerX, (windowHeight/rects.length) * this.id);
    translate(this.x, this.y);
    //rotate(this.angle);
    //rect(0-(this.rectwidth/2), 0-this.rectsize, this.rectwidth, this.rectsize);
    beginShape(CLOSE);
    vertex(0 - this.rectwidth, 0);
    vertex(0, 0-this.rectsize);
    vertex(this.rectwidth, 0);
    endShape();
    pop();
  },

  fadeOut:function(){
    this.fading = true;
    this.targetAlpha = 0;
    this.pastAlpha = this.alpha;
  },

  handleDelaying:function(){
    if(this.delaying){
      var progress = (millis() - this.delayStart) / this.delayDuration;
      if(progress >= 1){
        this.delaying = false;
        this.fading = true;
        this.fadeStart = millis();
        this.rotating = true;
        this.rotateStart = millis();
      } else {
        // don't do shit; just wait.
      }
    }
  },

  handleFading:function(){
    if(this.fading){
      var progress = (millis() - this.fadeStart) / this.fadeDuration;
      if(progress >= 1){
        //this.fading = false;
        //this.alpha = this.targetAlpha;
        this.targetAlpha = this.maxAlpha - this.targetAlpha;
        this.pastAlpha = this.alpha;
        this.fadeStart = millis();
      } else {
        this.alpha = ((this.targetAlpha - this.pastAlpha) * progress) + this.pastAlpha;
      }
    }
  },

  handleRotating:function(){
    if(this.rotating){
      var progress = (millis() - this.rotateStart) / this.rotateDuration;
      var sp = (1 - (cos(PI * progress) / 2 - 0.5)) - 1;
      if(progress >= 1){
        //this.rotating = false;
        //this.angle = this.targetAngle;
        this.angleAdd = (PI - ((this.rectsize / (windowWidth/2)) * PI)) + 0.1;
        this.targetAngle += this.angleAdd;//angleDiff;
        this.pastAngle = this.angle;
        this.rotateStart = millis();
      } else {
        this.angle = ((this.targetAngle - this.pastAngle) * sp) + this.pastAngle;
      }
    }
  },

  handleSizing:function(){
    if(this.delaySizing){
      var progress = (millis() - this.delaySizingStart) / this.delaySizingDuration;
      if(progress >= 1){
        this.delaySizing = false;
        this.sizing = true;
        this.sizingStart = millis();
      }
    } else if(this.sizing){
      var progress = (millis() - this.sizingStart) / this.sizingDuration;
      var sp = (1 - (cos(PI * progress) / 2 - 0.5)) - 1;
      if(progress >= 1){
        this.sizing = false;
        // this.rectsize = this.targetSize;
        // resize to something random
        this.resize(random(windowHeight), 0);
      } else {
        this.rectsize = ((this.targetSize - this.pastSize) * sp) + this.pastSize;
      }
    }
  },

  resize:function(newsize, delay){
    this.targetSize = newsize;
    this.pastSize = this.rectsize;
    this.sizing = false;
    this.delaySizingDuration = delay;
    this.delaySizingStart = millis();
    this.delaySizing = true;
  }
}
