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
  yCount = windowHeight / xSpacing;
  ySpacing = windowHeight / (yCount-2);
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*xSpacing;
      var ypos = y*ySpacing;
      points.push(new Point(xpos, ypos));
    }
  }
  pushRadius = windowWidth/4;
  xOffset = 0 - xSpacing/2;
  yOffset = 0 - ySpacing/2;
  colorMode(HSB, 360);
  background(0);
}

function draw(){
  //background(0);
  push();
  translate(xOffset, yOffset);
  for(var i=0; i<points.length; i++){
    points[i].move();
  }

  for(var i=0; i<points.length; i++){
    if(i % xCount < xCount-1){            // can connect to a point directly to the right.
      if(i < points.length - xCount){     // can connect to a point directly down.
        drawTriangle(points[i], points[i+1], points[i+xCount]);
        drawTriangle(points[i+xCount+1], points[i+1], points[i+xCount]);
      }
    }
  }

  pop();
}

function drawTriangle(p1, p2, p3){
  var v1 = createVector(p1.x - p2.x, p1.y - p2.y);
  var v2 = createVector(p1.x - p3.x, p1.y - p3.y);
  var angle = p5.Vector.angleBetween(v1, v2);
  var brightness = degrees(angle*2);
  //stroke(0, 0, brightness);
  fill(0, 0, brightness);
  beginShape();
  vertex(int(p1.x)+0.5, int(p1.y)+0.5);
  vertex(int(p2.x)+0.5, int(p2.y)+0.5);
  vertex(int(p3.x)+0.5, int(p3.y)+0.5);
  endShape(CLOSE);
}

function mouseDragged(){
  var yf = mouseY - pmouseY;
  var xf = mouseX - pmouseX;
  for(var i=0; i<points.length; i++){
    var ydiff = 1 - abs((mouseY - points[i].y) / windowHeight);
    var xdiff = 1 - abs((mouseX - points[i].x) / windowWidth);
    points[i].shove(xf * xdiff * 0.01, yf * ydiff * 0.01);
  }
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
      this.xv += normSpringX * (springDist * this.springMult);
      this.yv += normSpringY * (springDist * this.springMult);
    }

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  },

  shove:function(xf, yf){
    this.xv += xf;
    this.yv += yf;
  }
}
