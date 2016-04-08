var wiggles = [];
var deadwiggles = [];
var releaseRate = 500;
var lastRelease = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noFill();
  strokeWeight(windowWidth * 0.05);
  colorMode(HSB, 360);
  // var start = createVector(random(windowWidth), windowHeight);
  // var end = createVector(random(windowWidth), windowHeight - random(100,200));
  // wiggles.push(new Wiggle(start, end));
}

function draw(){
  blendMode(NORMAL);
  background(0);
  blendMode(SCREEN);
  for(var i=0; i<wiggles.length; i++){
    wiggles[i].draw();
    if(wiggles[i].dead){
      deadwiggles.push(wiggles[i]);
    }
  }
  // release a new wiggle
  if(millis() - lastRelease > releaseRate){
    var start = createVector(random(windowWidth), windowHeight);
    var end = createVector(random(windowWidth), windowHeight - random(windowHeight*0.1, windowHeight*0.5));
    wiggles.push(new Wiggle(start, end));
    lastRelease = millis();
  }
  // remove dead balls
  for(var n=0; n<deadwiggles.length; n++){
    var index = wiggles.indexOf(deadwiggles[n]);
    if(index > -1){
      wiggles.splice(index, 1);
    }
  }
  deadwiggles = [];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Wiggle(start, end){
  this.start = start;
  this.end = end;
  this.c = color(360 - ((start.x / windowWidth) * 150), 360, 360);
  this.controlA = start.copy();
  this.controlB = end.copy();
  var ydiff = this.start.y - this.end.y;
  this.controlA.y -= ydiff/2;
  this.controlB.y += ydiff/2;
  this.expanding = true;
  this.expandingStart = millis();
  this.expandingDuration = random(500,2000);
  this.contracting = false;
  this.contractingStart = millis();
  this.contractingDuration = random(500,2000);
  this.points = [];
}

Wiggle.prototype = {
  constructor: Wiggle,

  draw:function(){
    this.handleExpanding();
    this.handleContracting();
    stroke(this.c)
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandingStart) / this.expandingDuration;
      if(p >= 1){
        if(this.end.y > 0){
          this.start.x = this.end.x;
          this.start.y = this.end.y;
          this.end.x = random(windowWidth);
          this.end.y -= random(windowHeight*0.1, windowHeight*0.5);
          this.controlA = this.start.copy();
          this.controlB = this.end.copy();
          var ydiff = this.start.y - this.end.y;
          this.controlA.y -= ydiff/2;
          this.controlB.y += ydiff/2;
          this.expandingStart = millis();
        } else {
          this.expanding = false;
          this.contracting = true;
          this.contractingStart = millis();
          this.contractingDuration = random(2000,5000);
        }
      } else {
        var currentx = bezierPoint(this.start.x, this.controlA.x, this.controlB.x, this.end.x, p);
        var currenty = bezierPoint(this.start.y, this.controlA.y, this.controlB.y, this.end.y, p);
        this.points.push(createVector(currentx, currenty));
      }
    }
  },

  handleContracting:function(){
    if(this.contracting){
      this.points.shift();
      if(this.points.length == 0){
        this.contracting = false;
        this.dead = true;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
