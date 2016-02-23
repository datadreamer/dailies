var c;
var shapes = [];
var deadshapes = [];
var colors;
var mainColor, bgColor;
var colorIndex = 0;
var animationDuration = 2000;
var minReleaseRate = 100;
var maxReleaseRate = 500;
var releaseRate = minReleaseRate;
var lastRelease = 0;
var words = ["CREATE", "DESIGN", "MAKE", "HACK", "PIVOT", "SHAPE", "FORM", "EDIT", "DECONSTRUCT", "DISRUPT", "SHIFT"];

var xCount = 10;
var yCount = 10;
var boxWidth, boxHeight;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  colorMode(HSB,255);
  mainColor = color(random(255),255,255);
  colorMode(RGB,255);
  bgColor = color(255);
  //colors = [color(0), color(255), mainColor];
  colors = [color(0,255,255), color(255,0,255), color(255,255,0)];
  rectMode(CENTER);
  ellipseMode(CENTER);
  strokeWeight(windowWidth/100);
  textSize(windowWidth/20);
  textAlign(CENTER);
  textFont("Arial");
  textStyle(BOLD);
  boxWidth = windowWidth / xCount;
  boxHeight = windowHeight / yCount;
  var delay = 0;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x * boxWidth + boxWidth/2;
      var ypos = y * boxHeight + boxHeight/2;
      s = new Shape(xpos, ypos, colors[colorIndex]);
      switch(floor(random(4))){
        case 0:
          // move left to right
          s.w = 0;
          s.h = boxHeight-5;
          s.x -= boxWidth/2;
        case 1:
          // move right to left
          s.w = 0;
          s.h = boxHeight-5;
          s.x += boxWidth/2;
        case 2:
          // move top to bottom
          s.w = boxWidth-5;
          s.h = 0;
          s.y -= boxHeight/2;
        default:
          // move bottom to top
          s.w = boxWidth-5;
          s.h = 0;
          s.y += boxHeight/2;
      }
      s.moveTo(xpos, ypos, animationDuration);
      s.sizeTo(boxWidth-5, boxHeight-5, animationDuration);
      //s.rotateTo(PI, animationDuration);
      shapes.push(s);
      colorIndex++;
      if(colorIndex == colors.length){
        colorIndex = 0;
      }
    }
  }
}

function draw(){
  blendMode(NORMAL);
  background(bgColor);
  blendMode(MULTIPLY);
  for(var i=0; i<shapes.length; i++){
    shapes[i].update();
    shapes[i].draw();
  }
}

function keyPressed(){

}

function mouseMoved(){
  for(var i=0; i<shapes.length; i++){
    if(shapes[i].isOver(mouseX, mouseY)){
      if(!shapes[i].rotating){
        shapes[i].rotateTo(shapes[i].angle + PI, animationDuration);
      }
    }
  }
}

function mousePressed(){
  for(var i=0; i<shapes.length; i++){
    if(shapes[i].isOver(mouseX, mouseY)){
      if(!shapes[i].sizing){
        shapes[i].w = boxWidth*2;
        shapes[i].h = boxHeight*2;
        shapes[i].sizeTo(boxWidth-5, boxHeight-5, animationDuration);
      }
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Shape(x, y, c){
  this.x = x;
  this.y = y;
  this.tx = x;
  this.ty = y;
  this.px = x;
  this.py = y;
  this.w = 20;
  this.h = 20;
  this.tw = this.w;
  this.th = this.h;
  this.pw = this.w;
  this.ph = this.h;
  this.angle = 0;
  this.targetAngle = 0;
  this.pastAngle = 0;
  this.birth = millis();
  this.lifespan = animationDuration;
  this.dead = false;
  this.moving = false;
  this.sizing = false;
  this.fading = false;
  this.rotating = false;
  this.moveStart;
  this.sizeStart;
  this.fadeStart;
  this.rotateStart;
  this.moveDuration = 2000;
  this.sizeDuration = 2000;
  this.fadeDuration = 2000;
  this.rotateDuration = 2000;
  this.c = c;
  this.a = 255;
  this.ta;
  this.pa;
}

Shape.prototype = {
  constructor:Shape,

  draw:function(){
    noFill();
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    rect(0, 0, this.w, this.h);
    pop();
  },

  handleFading:function(){
    if(this.fading){
      var p = (millis() - this.fadeStart) / this.fadeDuration;
      if(p >= 1){
        this.a = this.ta;
        this.fading = false;
      } else {
        var sp = this.sinProgress(p);
        this.a = ((this.ta - this.pa) * sp) + this.pa;
      }
    }
  },

  handleLife:function(){
    if(millis() - this.birth > this.lifespan){
      this.dead = true;
      //bgColor = this.c;
    }
  },

  handleMoving:function(){
    if(this.moving){
      var p = (millis() - this.moveStart) / this.moveDuration;
      if(p >= 1){
        this.x = this.tx;
        this.y = this.ty;
        this.moving = false;
      } else {
        var sp = this.sinProgress(p);
        this.x = ((this.tx - this.px) * sp) + this.px;
        this.y = ((this.ty - this.py) * sp) + this.py;
      }
    }
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >= 1){
        this.angle = this.targetAngle;
        this.rotating = false;
      } else {
        var sp = this.sinProgress(p);
        this.angle = ((this.targetAngle - this.pastAngle) * sp) + this.pastAngle;
      }
    }
  },

  handleSizing:function(){
    if(this.sizing){
      var p = (millis() - this.sizeStart) / this.sizeDuration;
      if(p >= 1){
        this.w = this.tw;
        this.h = this.th;
        this.sizing = false;
      } else {
        var sp = this.sinProgress(p);
        this.w = ((this.tw - this.pw) * sp) + this.pw;
        this.h = ((this.th - this.ph) * sp) + this.ph;
      }
    }
  },

  isOver(mx, my){
    if(mx > this.x - this.w/2 && mx < this.x + this.w/2 && my > this.y - this.h/2 && my < this.y + this.h/2){
      return true;
    }
    return false;
  },

  fadeTo:function(ta, dur){
    this.ta = ta;
    this.pa = this.a;
    this.fadeDuration = dur;
    this.fading = true;
    this.fadeStart = millis();
  },

  moveTo:function(tx, ty, dur){
    this.tx = tx;
    this.ty = ty;
    this.px = this.x;
    this.py = this.y;
    this.moveDuration = dur;
    this.moving = true;
    this.moveStart = millis();
  },

  rotateTo:function(targetAngle, dur){
    this.targetAngle = targetAngle;
    this.pastAngle = this.angle;
    this.rotateDuration = dur;
    this.rotating = true;
    this.rotateStart = millis();
  },

  sizeTo:function(tw, th, dur){
    this.tw = tw;
    this.th = th;
    this.pw = this.w;
    this.ph = this.h;
    this.sizeDuration = dur;
    this.sizing = true;
    this.sizeStart = millis();
  },

  update:function(){
    this.handleLife();
    this.handleFading();
    this.handleMoving();
    this.handleRotating();
    this.handleSizing();
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
