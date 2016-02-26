var points = [];
var xCount = 10;
var yCount = 10;
var xSpacing, ySpacing;
var xOffset, yOffset;
var pushRadius;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  fill(0);
  xSpacing = windowWidth / (xCount-2);
  ySpacing = windowHeight / (yCount-2);
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*xSpacing;
      var ypos = y*ySpacing;
      if(y % 2 != 0){
        xpos += xSpacing/2;
      }
      points.push(new Point(xpos, ypos));
    }
  }
  pushRadius = windowWidth/4;
  xOffset = 0 - xSpacing/2;
  yOffset = 0 - ySpacing/2;
}

function draw(){
  background(0);
  push();
  translate(xOffset, yOffset);
  for(var i=0; i<points.length; i++){
    points[i].move();
  }
  for(var i=0; i<points.length; i++){
    //points[i].draw();
    if(i % xCount < xCount-1){  // draw line right
      var xdiff = points[i].x - points[i+1].x;
      var ydiff = points[i+1].y - points[i].y;
      fill(0, ydiff, 0-xdiff);
      beginShape();
      vertex(points[i].x, points[i].y);
      //line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      vertex(points[i+1].x, points[i+1].y);
      if(i < points.length - xCount){ // draw line down
        //line(points[i].x, points[i].y, points[i+xCount+1].x, points[i+xCount+1].y);
        vertex(points[i+xCount+1].x, points[i+xCount+1].y);
        endShape();
        var xdiff = points[i+xCount+1].x - points[i+xCount].x;
        var ydiff = points[i+xCount+1].y - points[i+xCount].y;
        fill(0, 255-ydiff, xdiff);
        beginShape();
        vertex(points[i+xCount+1].x, points[i+xCount+1].y);
      }
    }
    if(i < points.length - xCount){ // draw line down
      //line(points[i].x, points[i].y, points[i+xCount].x, points[i+yCount].y);
      vertex(points[i+xCount].x, points[i+xCount].y);
      vertex(points[i].x, points[i].y);
    }
    endShape();
  }
  pop();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Point(x,y){
  this.x = x;
  this.y = y;
  this.xv = 0;
  this.yv = 0;
  this.startX = x;
  this.startY = y;
  this.damping = 0.97;
  this.springMult = 0.01;
  this.pushMult = 0.8;
  this.noiseForce = 0.5;
}

Point.prototype = {
  constructor:Point,

  draw:function(){
    ellipse(this.x, this.y, 3, 3);

  },

  move:function(){
    // wiggle this fucker around
    this.xv += random(-this.noiseForce, this.noiseForce);
    this.yv += random(-this.noiseForce, this.noiseForce);

    // measure distance from cursor
    var xdiff = (mouseX-xOffset) - this.x;
    var ydiff = (mouseY-yOffset) - this.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    var xdiffNorm = xdiff/dist;
    var ydiffNorm = ydiff/dist;

    // move away from cursor when within pushRadius
    if(dist < pushRadius){
      var force = (1 - dist/pushRadius) * this.pushMult;
      this.xv -= xdiffNorm * force;
      this.yv -= ydiffNorm * force;
    }

    // get the distance of the tether end from its start position
    var springXdiff = this.startX - this.x;
    var springYdiff = this.startY - this.y;
    var springDist = sqrt(springXdiff*springXdiff + springYdiff*springYdiff);
    if(springDist > 0){
      // get the normalized vectors of the spring tether
      var normSpringX = springXdiff / springDist;
      var normSpringY = springYdiff / springDist;
      //console.log(normSpringX +", "+ normSpringY +" = "+ springDist);
      this.xv += normSpringX * (springDist * this.springMult);
      this.yv += normSpringY * (springDist * this.springMult);
    }

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  }
}
