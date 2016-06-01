var waves = [];
var pushRadius;
var waveCount = 1;
var centerX, centerY;
var gravity = 0.05;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  centerX = windowWidth/2;
  centerY = windowHeight/2;
  for(var i=0; i<waveCount; i++){
    waves.push(new Wave(0, windowHeight * 0.5, color(0,255,255)));
    waves.push(new Wave(0, windowHeight * 0.5, color(255,0,255)));
    waves.push(new Wave(0, windowHeight * 0.5, color(255,255,0)));
  }
  noFill();
  rectMode(CENTER);
  strokeWeight(windowWidth * 0.03);
  pushRadius = windowWidth/4;
}

function draw(){
  blendMode(NORMAL);
  background(255);
  blendMode(MULTIPLY);
  for(var i=0; i<waves.length; i++){
    waves[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Wave(x, y, c){
  this.x = x;
  this.y = y;
  this.c = c;
  this.numPoints = 50;
  this.points = [];
  this.dragging = false;
  this.segmentLength = windowWidth / this.numPoints;
  for(var i=0; i<this.numPoints; i++){
    var xpos = i * this.segmentLength;
    var ypos = this.y;
    var bp = new WavePoint(this, xpos, ypos);
    this.points.push(bp);
  }
  for(var i=0; i<this.points.length; i++){
    if(i == 0){
      // first point is pinned to left side of screen
      this.points[i].neighborA = {x:0, y:this.y};
      this.points[i].neighborB = this.points[i+1];
    } else if(i == this.points.length-1){
      // last point is pinned to right side of screen
      this.points[i].neighborA = this.points[i-1];
      this.points[i].neighborB = {x:windowWidth, y:this.y};
    } else {
      this.points[i].neighborA = this.points[i-1];
      this.points[i].neighborB = this.points[i+1];
    }
  }
}

Wave.prototype = {
  constructor:Wave,

  draw:function(){
    stroke(this.c);
    // draw the wave
    beginShape();
    vertex(0, this.y);
    for(var i=0; i<this.points.length; i++){
      this.points[i].move();
      vertex(this.points[i].x, this.points[i].y);
    }
    vertex(windowWidth, this.y);
    endShape();
    // draw the blob points
    // for(var i=0; i<this.points.length; i++){
    //   this.points[i].draw();
    // }

  }
}






function WavePoint(parent, x, y){
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.xv = 0;
  this.yv = 0;
  this.startX = x;
  this.startY = y;
  this.damping = random(0.95,0.98);
  this.springMult = random(0.008, 0.012);
  this.pushMult = 0.8;
  this.d = 10;
  this.dragging = false;
  this.neighborA;
  this.neighborB;
}

WavePoint.prototype = {
  constructor:WavePoint,

  draw:function(){
    stroke(0);
    noFill();
    ellipse(this.x,this.y,this.d,this.d);
  },

  isOver:function(){
    if(mouseX - centerX >= this.x - this.d/2 && mouseX - centerX <= this.x + this.d/2){
      if(mouseY - centerY >= this.y - this.d/2 && mouseY - centerY <= this.y + this.d/2){
        return true;
      }
    }
    return false;
  },

  move:function(){
    // measure distance from cursor
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);

    // move away from cursor when within pushRadius
    if(dist < pushRadius){
      var xdiffNorm = xdiff/dist;
      var ydiffNorm = ydiff/dist;
      var force = (1 - dist/pushRadius) * this.pushMult;
      if(mouseIsPressed){
        this.xv += xdiffNorm * force;
        this.yv += ydiffNorm * force;
      } else {
        this.xv -= xdiffNorm * force;
        this.yv -= ydiffNorm * force;
      }
    }

    // 1. wavepoint attracted to neighborA.
    var xdiff = this.x - this.neighborA.x;
    var ydiff = this.y - this.neighborA.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(dist > this.parent.segmentLength){
      var force = (1 - this.parent.segmentLength/dist);
      var xdiffNorm = xdiff/dist;
      var ydiffNorm = ydiff/dist;
      this.xv -= xdiffNorm * force;
      this.yv -= ydiffNorm * force;
    }

    // 2. wavepoint attracted to neighborB.
    var xdiff = this.x - this.neighborB.x;
    var ydiff = this.y - this.neighborB.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(dist > this.parent.segmentLength){
      var force = (1 - this.parent.segmentLength/dist);
      var xdiffNorm = xdiff/dist;
      var ydiffNorm = ydiff/dist;
      this.xv -= xdiffNorm * force;
      this.yv -= ydiffNorm * force;
    }

    // 3. wavepoint is attracted to its start position.
    var springXdiff = this.startX - this.x;
    var springYdiff = this.startY - this.y;
    var springDist = sqrt(springXdiff*springXdiff + springYdiff*springYdiff);
    if(springDist > 0){
      // get the normalized vectors of the spring tether
      var normSpringX = springXdiff / springDist;
      var normSpringY = springYdiff / springDist;
      this.xv += normSpringX * (springDist * this.springMult);
      this.yv += normSpringY * (springDist * this.springMult);
    }

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;

    // keep points on screen
    if(this.x+this.d/2 > windowWidth){
      this.x = windowWidth - this.d/2;
    } else if(this.x-this.d/2 < 0){
      this.x = this.d/2;
    }
    if(this.y+this.d/2 > windowHeight){
      this.y = windowHeight - this.d/2;
    } else if(this.y-this.d/2 < 0){
      this.y = this.d/2;
    }

  }
}
