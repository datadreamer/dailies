var segments = [];
var lastSegment;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(3);
  stroke(0);
  noFill();
  lastSegment = new Segment(createVector(windowWidth/2, windowHeight/2));
  segments.push(lastSegment);
}

function draw(){
  background(255);
  for(var i=0; i<segments.length; i++){
    segments[i].draw();
  }
  if(!lastSegment.moving){
    lastSegment = new Segment(lastSegment.getMidPoint());
    segments.push(lastSegment);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Segment(start){
  this.start = start;
  this.end = start.copy();
  this.vec = createVector(0,1);
  this.vec.rotate(random(TWO_PI));
  this.maxlen = windowWidth/5;
  this.moveDuration = 1000;
  this.moveStart = millis();
  this.moving = true;
}

Segment.prototype = {
  constructor: Segment,

  draw:function(){
    this.move();
    line(this.start.x, this.start.y, this.end.x, this.end.y);
  },

  move:function(){
    if(this.moving){
      var p = (millis() - this.moveStart) / this.moveDuration;
      if(p >= 1){
        this.moving = false;
      } else {
        var sp = this.sinProgress(p);
        this.end.x = (sp * this.vec.x * this.maxlen) + this.start.x;
        this.end.y = (sp * this.vec.y * this.maxlen) + this.start.y;
      }
    }
  },

  getMidPoint:function(){
    var midx = ((this.end.x - this.start.x) / 2) + this.start.x;
    var midy = ((this.end.y - this.start.y) / 2) + this.start.y;
    return createVector(midx, midy);
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
