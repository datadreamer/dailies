var chevrons = [];
var xCount = 20;
var yCount, spacing;
var chevronWidth, chevronHeight, skewValue;
var delaySpacing = 50;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  fill(0);
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
  background(255);
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
    this.sizingDuration = 1000;
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
  },

  draw:function(){
    this.handleDelaying();
    this.handleSizing();
    push();
    translate(this.x, this.y);
    beginShape();
    vertex(this.topLeft.x, this.topLeft.y);
    vertex(this.topRight.x, this.topRight.y);
    vertex(this.bottomRight.x, this.bottomRight.y);
    vertex(this.bottomLeft.x, this.bottomLeft.y);
    endShape(CLOSE);
    pop();
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayingStart) / this.delayingDuration;
      if(p >= 1){
        this.delaying = false;
        this.sizing = true;
        this.sizingStart = millis();
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
        this.delaying = true;
        this.delayingStart = millis();
        if(this.topLeft.y == 0){
          this.topLeftTarget = this.bottomLeft.copy();
          this.topRightTarget = this.bottomRight.copy();
        } else {
          //console.log("died");
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
