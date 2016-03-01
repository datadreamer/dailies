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

  var a = 0;
  var maxRadius = windowWidth/2;
  var tightness = 20;
  var pointCount = windowWidth;
  if(pointCount > 1000){
    pointCount = 1000;
  }
  for(var i=0; i<pointCount; i++){
    var r = maxRadius - (maxRadius * (i/pointCount));
    a += (PI*tightness) / (1 + i);
    var xpos = windowWidth/2 + (r * cos(a));
    var ypos = windowHeight/2 + (r * sin(a));
    points.push(new Point(xpos, ypos));
  }

  pushRadius = windowWidth/4;
  xOffset = 0;
  yOffset = 0;
  colorMode(HSB, 360);
}

function draw(){
  background(0);
  push();
  translate(xOffset, yOffset);
  for(var i=0; i<points.length; i++){
    points[i].move();
    points[i].draw();
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
  this.noiseForce = 0.2;
  this.d = 5;
}

Point.prototype = {
  constructor:Point,

  draw:function(){
    fill(220 - (this.d * 25), 360, 360);
    ellipse(this.x, this.y, this.d, this.d);
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

    // measure distance from center
    var xcent = this.x - windowWidth/2;
    var ycent = this.y - windowHeight/2;
    var normdist = sqrt(xcent*xcent + ycent*ycent) / (windowWidth/2);
    this.d = 10 * (1 - normdist);

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
