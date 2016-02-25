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

var xCount = 10;
var yCount = 20;
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
  boxWidth = windowWidth / (xCount-1);
  boxHeight = windowHeight / (yCount/2-1);
  var delay = 0;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x * boxWidth - boxWidth/2;
      if(y % 2 != 0){
        xpos += boxWidth/2;
      }
      var ypos = y * (boxHeight/2);
      var c = color(x*(255/xCount) + random(-50,50), 0, y*(255/yCount) + random(-50,50));
      s = new Shape(xpos, ypos, c);
      s.moveTo(xpos, ypos, animationDuration);
      s.sizeTo(boxWidth*0.75, boxHeight*0.75, animationDuration);
      s.rotateTo(random(PI*2), random(animationDuration, animationDuration/2));
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
  background(255);
  blendMode(MULTIPLY);
  for(var i=0; i<shapes.length; i++){
    shapes[i].update();
    shapes[i].draw();
  }
}

function mouseMoved(){
  // for(var i=0; i<shapes.length; i++){
  //   var xdiff = mouseX - shapes[i].x;
  //   var ydiff = mouseY - shapes[i].y;
  //   var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
  //   if(dist < windowWidth/2){
  //     var normdist = dist/(windowWidth/2);
  //     // shapes[i].w = 20 + (normdist * ((boxWidth*0.75)-20));
  //     // shapes[i].h = 20 + (normdist * ((boxHeight*0.75)-20));
  //     shapes[i].angle = normdist * PI;
  //   } else {
  //     // shapes[i].w = boxWidth*0.75;
  //     // shapes[i].h = boxHeight*0.75;
  //     shapes[i].angle = 0;
  //   }
  // }
}

function mouseDragged(){
  mouseMoved();
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
  this.toggleFill = true;
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
    if(this.toggleFill){
      noStroke();
      fill(red(this.c), green(this.c), blue(this.c), this.a);
    } else {
      noFill();
      stroke(red(this.c), green(this.c), blue(this.c), this.a);
    }
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
        //this.rotating = false;
        // rotate to somewhere random
        this.rotateTo(random(PI*2), random(animationDuration, animationDuration/2));
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





function Hexagon(x, y, c){
  Shape.call(this, x, y, c);
}

Hexagon.prototype = Object.create(Shape.prototype);
Hexagon.prototype.constructor = Shape;
Hexagon.prototype.draw = function(){
  if(this.toggleFill){
    noStroke();
    fill(red(this.c), green(this.c), blue(this.c), this.a);
  } else {
    noFill();
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
  }
  push();
  translate(this.x, this.y);
  rotate(this.angle);
  beginShape();
  vertex(0, 0-this.h/2);          // top
  vertex(this.w/2, 0-this.h/4);   // top right
  vertex(this.w/2, this.h/4);     // bottom right
  vertex(0, this.h/2);            // bottom
  vertex(0-this.w/2, this.h/4);   // bottom left
  vertex(0-this.w/2, 0-this.h/4); // top left
  endShape(CLOSE);
  pop();
}






function Ring(x, y, c){
  Shape.call(this, x, y, c);
}
Ring.prototype = Object.create(Shape.prototype);
Ring.prototype.constructor = Shape;
Ring.prototype.draw = function(){
  push();
  noFill();
  stroke(0);
  translate(this.x, this.y);
  rotate(this.angle);
  ellipse(0, 0, this.w, this.h);
  pop();
}
