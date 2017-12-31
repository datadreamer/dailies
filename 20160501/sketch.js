var marks = [];
var capture;
var maxSize, minSize, size;
var sizeInc = 0.05;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  maxSize = 100;
  minSize = 20;
  size = maxSize;
  capture = createCapture(VIDEO);
  capture.size(320,240);
  noStroke();
  background(0);
}

function draw(){
  // make 10 new marks each frame
  capture.loadPixels();
  for(var i=0; i<10; i++){
    marks.push(new Mark());
  }

  // gradually reduce size of marks
  if(size > minSize){
    size -= sizeInc;
  }

  // draw marks
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
  this.w = 0;
  this.h = minSize;
  this.tw = size;
  this.pw = this.w;
  // alpha should fade immediately
  this.a = 64;
  this.ta = 0;
  this.pa = this.a;
  this.colorX = int((this.x / windowWidth) * capture.width);
  this.colorY = int((this.y / windowHeight) * capture.height);
  this.colorIndex = (this.colorY * (capture.width*4)) + (this.colorX * 4);
  //this.c = capture.get(this.colorX, this.colorY);
  this.r = capture.pixels[this.colorIndex];
  this.g = capture.pixels[this.colorIndex+1];
  this.b = capture.pixels[this.colorIndex+2];
  this.c = color(this.r, this.g, this.b);
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
  this.growing = true;
  this.growStart = millis();
  this.growDuration = this.rotateDuration;
  this.dead = false;
}

Mark.prototype = {
  constructor: Mark,

  draw:function(){
    this.handleFading();
    //this.handleRotating();
    this.handleGrowing();
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(red(this.c), green(this.c), blue(this.c), this.a);
    rect(0,0,this.w,this.h);
    // beginShape();
    // vertex(-this.w, 0);
    // vertex(0, -this.h);
    // vertex(this.w, 0);
    // vertex(0, this.h);
    // endShape(CLOSE);
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
        this.a = ((this.ta - this.pa) * this.sinProgress(p)) + this.pa;
      }
    }
  },

  handleGrowing:function(){
    if(this.growing){
      var p = (millis() - this.growStart) / this.growDuration;
      if(p >= 1){
        this.growing = false;
        this.dead = true;
        this.w = this.tw;
        this.pw = this.w;
      } else {
        this.w = ((this.tw - this.pw) * this.sinProgress(p)) + this.pw;
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
        this.angle = ((this.targetAngle - this.pastAngle) * this.sinProgress(p)) + this.pastAngle;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
