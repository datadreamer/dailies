var blobs = [];
var pushRadius;
var blobCount = 1;
var centerX, centerY;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  centerX = windowWidth/2;
  centerY = windowHeight/2;
  for(var i=0; i<blobCount; i++){
    blobs.push(new Blob(centerX, centerY, windowWidth/3, color(0,255,255)));
    blobs.push(new Blob(centerX, centerY, windowWidth/3, color(255,0,255)));
    blobs.push(new Blob(centerX, centerY, windowWidth/3, color(255,255,0)));
  }
  noStroke();
  fill(0);
  rectMode(CENTER);
  pushRadius = windowWidth/4;
}

function draw(){
  blendMode(NORMAL);
  background(255);
  blendMode(MULTIPLY);
  for(var i=0; i<blobs.length; i++){
    blobs[i].draw();
  }
}

function mousePressed(){
  for(var i=0; i<blobs.length; i++){
    if(blobs[i].isOver()){
      blobs[i].dragging = true;
    }
    // for(var n=0; n<blobs[i].points.length; n++){
    //   if(blobs[i].points[n].isOver()){
    //     blobs[i].points[n].dragging = true;
    //   }
    // }
  }
}

function mouseReleased(){
  for(var i=0; i<blobs.length; i++){
    blobs[i].dragging = false;
    // for(var n=0; n<blobs[i].points.length; n++){
    //   blobs[i].points[n].dragging = false;
    // }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Blob(x, y, r, c){
  this.x = x;
  this.y = y;
  this.r = r;
  this.c = c;
  this.numPoints = 50;
  this.points = [];
  this.grabDiameter = this.r;
  this.grabRadius = this.grabDiameter/2;
  this.dragging = false;
  this.segmentLength = (TWO_PI * this.r) / this.numPoints;
  var angle = TWO_PI / this.numPoints;
  var a = 0;
  for(var i=0; i<this.numPoints; i++){
    a += angle;
    var xpos = this.x + (this.r * cos(a));
    var ypos = this.y + (this.r * sin(a));
    var bp = new BlobPoint(this, xpos, ypos);
    this.points.push(bp);
  }
  for(var i=0; i<this.points.length; i++){
    if(i == 0){
      // first point uses last point as neighborA
      this.points[i].neighborA = this.points[this.points.length-1];
      this.points[i].neighborB = this.points[i+1];
    } else if(i == this.points.length-1){
      // last point uses first point as neighborB
      this.points[i].neighborA = this.points[i-1];
      this.points[i].neighborB = this.points[0];
    } else {
      this.points[i].neighborA = this.points[i-1];
      this.points[i].neighborB = this.points[i+1];
    }
  }
}

Blob.prototype = {
  constructor:Blob,

  draw:function(){
    if(this.dragging){
      this.x = mouseX;
      this.y = mouseY;
    }
    fill(this.c);
    noStroke();
    // draw the blob
    beginShape();
    for(var i=0; i<this.points.length; i++){
      this.points[i].move();
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape(CLOSE);
    // draw the blob points
    // for(var i=0; i<this.points.length; i++){
    //   this.points[i].draw();
    // }
    // draw the blob center
    // stroke(0);
    // fill(255);
    // ellipse(this.x, this.y, this.grabDiameter, this.grabDiameter);
  },

  isOver:function(){
    if(mouseX >= this.x - this.grabRadius && mouseX <= this.x + this.grabRadius){
      if(mouseY >= this.y - this.grabRadius && mouseY <= this.y + this.grabRadius){
        return true;
      }
    }
    return false;
  }
}






function BlobPoint(parent, x, y){
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
  this.d = 0;
  this.dragging = false;
  this.neighborA;
  this.neighborB;
}

BlobPoint.prototype = {
  constructor:BlobPoint,

  draw:function(){
    stroke(0,255,255,128);
    fill(255);
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
    // var xdiff = (mouseX - centerX) - this.x;
    // var ydiff = (mouseY - centerY) - this.y;
    // var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    // var xdiffNorm = xdiff/dist;
    // var ydiffNorm = ydiff/dist;

    // move away from cursor when within pushRadius
    // if(dist < pushRadius){
    //   var force = (1 - dist/pushRadius) * this.pushMult;
    //   this.xv -= xdiffNorm * force;
    //   this.yv -= ydiffNorm * force;
    // }

    // 1. blobpoint attracted to blob center.
    var xdiff = this.parent.x - this.x;
    var ydiff = this.parent.y - this.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(dist > this.parent.r){
      var force = (1 - dist/this.parent.r);
      var xdiffNorm = xdiff/dist;
      var ydiffNorm = ydiff/dist;
      this.xv -= xdiffNorm * force;
      this.yv -= ydiffNorm * force;
    }

    // 2. blobpoint repelled from blob center.
    if(dist < this.parent.r){
      var force = (1 - this.parent.r/dist);
      var xdiffNorm = xdiff/dist;
      var ydiffNorm = ydiff/dist;
      this.xv += xdiffNorm * force;
      this.yv += ydiffNorm * force;
    }

    // 3. blobpoint attracted to neighborA.
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

    // 4. blobpoint attracted to neighborB.
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
