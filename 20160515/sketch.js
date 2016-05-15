var chevrons = [];
var xCount = 20;
var yCount, spacing;
var chevronWidth, chevronHeight, skewValue;
var delaySpacing = 10;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  spacing = int(windowWidth / xCount);
  yCount = windowHeight / spacing;
  chevronWidth = spacing/2;
  chevronHeight = spacing;
  skewValue = chevronWidth/2;
  var delay = 0;
  for(var y=0; y<yCount; y++){
    var ypos = y * spacing;
    skewValue *= -1;
    for(var x=0; x<xCount; x++){
      var xpos = (x * spacing) + (spacing/4);
      chevrons.push(new Chevron(xpos, ypos, chevronWidth, chevronHeight, skewValue, delay));
      delay += delaySpacing;
    }
  }
}

function draw(){
  background(0);
  var alldead = true;
  for(var i=0; i<chevrons.length; i++){
    chevrons[i].draw();
    if(!chevrons[i].dead){
      alldead = false;
    }
  }
  if(alldead){
    for(var i=0; i<chevrons.length; i++){
      chevrons[i].init();
    }
  }
}

function mouseMoved(){
  for(var i=0; i<chevrons.length; i++){
    var c = chevrons[i];
    if(!c.sizing && !c.delaying){
      var xdiff = mouseX - c.x + c.centerPos.x;
      var ydiff = mouseY - c.y + c.centerPos.y;
      var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
      if(hypo < windowWidth * 0.2){
        c.sizing = true;
        c.sizingStart = millis();
        c.coloring = true;
        c.coloringStart = millis();
      }
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Chevron(x, y, w, h, skew, delay){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.skew = skew;
  this.delayingDuration = delay;
  this.init();
}

Chevron.prototype = {
  constructor: Chevron,

  init:function(){
    this.delaying = true;
    this.delayingStart = millis();
    this.sizing = false;
    this.sizingStart = millis();
    this.sizingDuration = random(50,1000);
    this.coloring = false;
    this.coloringStart = millis();
    this.coloringDuration = this.sizingDuration;
    this.tc = color(255,255,255);
    var r = random();
    if(r < 0.33){
      this.c = color(255,0,0);
    } else if(r >= 0.33 & r < 0.66){
      this.c = color(0,255,0);
    } else {
      this.c = color(0,0,255);
    }
    this.pc = color(red(this.c), green(this.c), blue(this.c));
    // vectors for vertices
    this.topLeft = createVector(0-this.skew, 0);
    this.topLeftTarget = this.topLeft.copy();
    this.topLeftPast = this.topLeft.copy();
    this.topRight = createVector(this.w - this.skew, 0);
    this.topRightTarget = this.topRight.copy();
    this.topRightPast = this.topRight.copy();
    this.bottomRight = this.topRight.copy();
    this.bottomRightTarget = createVector(this.w + this.skew, this.h);
    this.bottomRightPast = this.topRight.copy();
    this.bottomLeft = this.topLeft.copy();
    this.bottomLeftTarget = createVector(this.skew, this.h);
    this.bottomLeftPast = this.topLeft.copy();
    this.dead = false;
    // calculate center pos
    var xdiff = this.bottomLeftTarget.x - this.topLeft.x;
    var ydiff = this.bottomLeftTarget.y - this.topLeft.y;
    this.centerPos = createVector(abs(xdiff/2), ydiff/2);
  },

  draw:function(){
    this.handleColoring();
    this.handleDelaying();
    this.handleSizing();
    push();
    translate(this.x, this.y);
    fill(this.c);
    beginShape();
    vertex(this.topLeft.x, this.topLeft.y);
    vertex(this.topRight.x, this.topRight.y);
    vertex(this.bottomRight.x, this.bottomRight.y);
    vertex(this.bottomLeft.x, this.bottomLeft.y);
    endShape(CLOSE);
    pop();
  },

  handleColoring:function(){
    if(this.coloring){
      var p = (millis() - this.coloringStart) / this.coloringDuration;
      if(p >= 1){
        this.c = this.tc;
        this.pc = color(255,255,255);//this.c;
        this.coloring = false;
        var r = random();
        if(r < 0.33){
          this.tc = color(255,0,0);
        } else if(r >= 0.33 & r < 0.66){
          this.tc = color(0,255,0);
        } else {
          this.tc = color(0,0,255);
        }
      } else {
        this.c = lerpColor(this.pc, this.tc, p);
      }
    }
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayingStart) / this.delayingDuration;
      if(p >= 1){
        this.delaying = false;
        this.sizing = true;
        this.sizingStart = millis();
        this.coloring = true;
        this.coloringStart = millis();
      }
    }
  },

  handleSizing:function(){
    if(this.sizing){
      var p = (millis() - this.sizingStart) / this.sizingDuration;
      if(p >= 1){
        this.sizing = false;
        this.topLeft = this.topLeftTarget.copy();
        this.topLeftPast = this.topLeft.copy();
        this.topRight = this.topRightTarget.copy();
        this.topRightPast = this.topRight.copy();
        this.bottomLeft = this.bottomLeftTarget.copy();
        this.bottomLeftPast = this.bottomLeft.copy();
        this.bottomRight = this.bottomRightTarget.copy();
        this.bottomRightPast = this.bottomRight.copy();
        // delay some more before animating again
        // this.delaying = true;
        // this.delayingStart = millis();
        if(this.topLeft.y == 0){
          this.topLeftTarget = this.bottomLeft.copy();
          this.topRightTarget = this.bottomRight.copy();
        } else {
          //console.log("died");
          this.delaying = false;
          this.dead = true;
        }
      } else {
        this.topLeft.x = ((this.topLeftTarget.x - this.topLeftPast.x) * this.sinProgress(p)) + this.topLeftPast.x;
        this.topLeft.y = ((this.topLeftTarget.y - this.topLeftPast.y) * this.sinProgress(p)) + this.topLeftPast.y;
        this.topRight.x = ((this.topRightTarget.x - this.topRightPast.x) * this.sinProgress(p)) + this.topRightPast.x;
        this.topRight.y = ((this.topRightTarget.y - this.topRightPast.y) * this.sinProgress(p)) + this.topRightPast.y;
        this.bottomLeft.x = ((this.bottomLeftTarget.x - this.bottomLeftPast.x) * this.sinProgress(p)) + this.bottomLeftPast.x;
        this.bottomLeft.y = ((this.bottomLeftTarget.y - this.bottomLeftPast.y) * this.sinProgress(p)) + this.bottomLeftPast.y;
        this.bottomRight.x = ((this.bottomRightTarget.x - this.bottomRightPast.x) * this.sinProgress(p)) + this.bottomRightPast.x;
        this.bottomRight.y = ((this.bottomRightTarget.y - this.bottomRightPast.y) * this.sinProgress(p)) + this.bottomRightPast.y;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
