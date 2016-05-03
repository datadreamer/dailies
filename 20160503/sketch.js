var marks = [];
var capture;
var maxSize, minSize, size;
var sizeInc = 0.2;
var distance;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  maxSize = 200;
  minSize = 20;
  distance = windowWidth / 5;
  size = maxSize;
  capture = createCapture(VIDEO);
  capture.size(320,240);
  rectMode(CENTER);
  noStroke();
  background(0);
}

function draw(){
  marks.push(new Mark());
  
  // gradually reduce size of marks
  if(size > minSize){
    size -= sizeInc;
  }

  // draw marks
  for(var i=0; i<marks.length; i++){
    marks[i].draw();
  }

  // remove marks
  for(var i=marks.length-1; i>=0; i--){
    if(marks[i].dead){
      marks.splice(i,1);
    }
  }

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}






function Mark(){
  this.angle = random(TWO_PI);
  this.x = random(windowWidth);
  this.y = random(windowHeight);
  this.vx = 0;
  this.vy = 0;
  this.tx = this.x + (distance * cos(this.angle));
  this.ty = this.y + (distance * sin(this.angle));
  this.px = this.x;
  this.py = this.y;
  this.w = 0;
  this.h = 0;
  this.tw = size;
  this.pw = this.w;
  this.noiseForce = 5;
  // alpha should fade immediately
  this.a = 128;
  this.ta = 0;
  this.pa = this.a;
  var colorX = int((this.x / windowWidth) * capture.width);
  var colorY = int((this.y / windowHeight) * capture.height);
  this.c = capture.get(colorX, colorY);
  // start rotating immediately
  //this.angle = random(TWO_PI);
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
    this.handleRotating();
    this.handleMoving();
    this.handleGrowing();
    // update color while moving
    var colorX = int((this.x / windowWidth) * capture.width);
    var colorY = int((this.y / windowHeight) * capture.height);
    if(colorX < capture.width && colorX >= 0 && colorY < capture.height && colorY >= 0){
      this.c = capture.get(colorX, colorY);
    }
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(red(this.c), green(this.c), blue(this.c), this.a);
    ellipse(0,0,this.w,this.w);
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

  handleMoving:function(){
    this.x += this.vx;
    this.y += this.vy;
    this.vx += random(-this.noiseForce, this.noiseForce);
    this.vy += random(-this.noiseForce, this.noiseForce);
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
