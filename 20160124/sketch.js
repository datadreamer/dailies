var rects = [];
var rectCount = 50;
var centerX, centerY, rectSize;
var targetRectSize, pastRectSize;
var rectSizing = false;
var rectSizingStart;
var angleDiff = 0;
var delayDuration = 500;
var fadeDuration = 3000;
var rectSizingDuration = 3000;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  var xpos = windowWidth/2;
  var ypos = windowHeight/2;
  angleDiff = (PI * 2) / rectCount;
  for(var i=0; i<rectCount; i++){
    var c = getColor((255 / rectCount) * i);
    var a = angleDiff * i;
    var d = i * delayDuration;
    rects.push(new Rectangle(c, a, d, fadeDuration));
  }
  // update values
  centerX = windowWidth/2;
  centerY = windowHeight/2;
  rectSize = windowWidth/2;
  if(windowHeight < windowWidth){
    rectSize = windowHeight/2;
  }
}

function draw(){
  handleSizing();

  background(0,30,50);
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

function handleSizing(){
  if(rectSizing){
    var progress = (millis() - rectSizingStart) / rectSizingDuration;
    var sp = (1 - (cos(PI * progress) / 2 - 0.5)) - 1;
    if(progress >= 1){
      rectSizing = false;
      rectSize = targetRectSize;
    } else {
      rectSize = ((targetRectSize - pastRectSize) * sp) + pastRectSize;
    }
  }
}

function mousePressed(){
  pastRectSize = rectSize;
  var xdiff = mouseX - centerX;
  var ydiff = mouseY - centerY;
  targetRectSize = sqrt(xdiff*xdiff + ydiff*ydiff);
  rectSizing = true;
  rectSizingStart = millis();
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





function Rectangle(c, a, d, f){
  this.c = c;
  this.angle = a - angleDiff;
  this.alpha = 0;

  this.delayDuration = d;
  this.fadeDuration = f;
  this.rotateDuration = f;

  this.delaying = true;
  this.fading = false;
  this.rotating = false;

  this.maxAlpha = 100;
  this.targetAlpha = this.maxAlpha;
  this.pastAlpha = this.alpha;
  this.targetAngle = a;
  this.pastAngle = this.angle;

  this.delayStart = millis();
  this.fadeStart = 0;
  this.rotateStart = 0;
}

Rectangle.prototype = {
  constructor:Rectangle,

  draw:function(){
    this.handleDelaying();
    this.handleFading();
    this.handleRotating();

    push();
    fill(red(this.c), green(this.c), blue(this.c), this.alpha);
    translate(centerX, centerY);
    rotate(this.angle);
    rect(0, 0, rectSize, rectSize);
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
        this.targetAngle += angleDiff;
        this.pastAngle = this.angle;
        this.rotateStart = millis();
      } else {
        this.angle = ((this.targetAngle - this.pastAngle) * sp) + this.pastAngle;
      }
    }
  }
}
