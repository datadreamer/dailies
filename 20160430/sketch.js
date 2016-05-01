var marks = [];
var releaseRate = 30;
var lastRelease = 0;
var img;
var maxSize, minSize, size;
var sizeInc = 0.05;

function preload(){
  img = loadImage("flowers.jpg");
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  maxSize = 100;
  minSize = 20;
  size = maxSize;
  strokeWeight(3);
  background(0);
}

function draw(){
  //if(millis() - lastRelease > releaseRate){
    marks.push(new Mark());
  //  lastRelease = millis();
  //}
  if(size > minSize){
    size -= sizeInc;
  }
  for(var i=marks.length-1; i>=0; i--){
    marks[i].draw();
    if(marks[i].dead){
      marks.splice(i,1);
    }
  }

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}






function Mark(){
  this.x = random(windowWidth);
  this.y = random(windowHeight);
  this.w = size;
  //this.tw = size;
  // alpha should fade immediately
  this.a = 128;
  this.ta = 0;
  this.pa = this.a;
  // TODO: get color from image
  //this.c = color(0, random(150), random(255));
  var colorX = int((this.x / windowWidth) * img.width);
  var colorY = int((this.y / windowHeight) * img.height);
  this.c = img.get(colorX, colorY);
  // start rotating immediately
  this.angle = random(PI);
  this.targetAngle = PI + this.angle;
  this.pastAngle = this.angle;
  this.rotating = true;
  this.rotateStart = millis();
  this.rotateDuration = 1000;
  this.fading = true;
  this.fadeStart = millis();
  this.fadeDuration = this.rotateDuration;
  this.dead = false;
}

Mark.prototype = {
  constructor: Mark,

  draw:function(){
    this.handleFading();
    this.handleRotating();
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
    line(-this.w, 0, this.w, 0);
    pop();
  },

  handleFading:function(){
    if(this.fading){
      var p = (millis() - this.fadeStart) / this.fadeDuration;
      if(p >= 1){
        this.fading = false;
        this.a = this.ta;
        this.pa = this.a;
      } else {
        this.a = ((this.ta - this.pa) * p) + this.pa;
      }
    }
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >=1){
        this.rotating = false;
        this.dead = true;
        this.angle = this.targetAngle;
        this.pastAngle = this.angle;
      } else {
        this.angle = ((this.targetAngle - this.pastAngle) * p) + this.pastAngle;
      }
    }
  }
}
