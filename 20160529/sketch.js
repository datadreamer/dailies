var blobs = [];
var pushRadius;
var blobCount = 1;
var centerX, centerY;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  for(var i=0; i<blobCount; i++){
    blobs.push(new Blob(windowWidth/3, color(0,255,255)));
    blobs.push(new Blob(windowWidth/3, color(255,0,255)));
    blobs.push(new Blob(windowWidth/3, color(255,255,0)));
  }
  noStroke();
  fill(0);
  rectMode(CENTER);
  pushRadius = windowWidth/4;
  centerX = windowWidth/2;
  centerY = windowHeight/2;
}

function draw(){
  blendMode(NORMAL);
  background(255);
  blendMode(MULTIPLY);
  for(var i=0; i<blobs.length; i++){
    blobs[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Blob(r, c){
  this.r = r;
  this.c = c;
  this.numPoints = 50;
  var angle = TWO_PI / this.numPoints;
  var a = 0;
  this.points = [];
  for(var i=0; i<this.numPoints; i++){
    a += angle;
    var xpos = (this.r * cos(a));
    var ypos = (this.r * sin(a));
    this.points.push(new WavePoint(xpos, ypos));
  }
}

Blob.prototype = {
  constructor:Blob,

  draw:function(){
    fill(this.c);
    push();
    translate(centerX, centerY);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      this.points[i].move();
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
    pop();
  }
}






function WavePoint(x, y){
  this.x = x;
  this.y = y;
  this.xv = 0;
  this.yv = 0;
  this.startX = x;
  this.startY = y;
  this.damping = random(0.95,0.98);
  this.springMult = random(0.008, 0.012);
  this.pushMult = 0.8;
  this.d = 3;
}

WavePoint.prototype = {
  constructor:WavePoint,

  draw:function(){
    stroke(0,255,255,128);
    line(this.x, this.y, this.startX, this.startY);
    fill(255);
    noStroke();
    ellipse(this.x,this.y,this.d,this.d);
  },

  move:function(){
    if(millis() - this.birth > this.lifespan){
      if(!this.fading){
          this.fading = true;
          this.fadeStart = millis();
      } else {
        var p = (millis() - this.fadeStart) / this.fadeDuration;
        if(p >= 1){
          this.alpha = 0;
          this.dead = true;
        } else {
          this.alpha = this.maxalpha - (p * this.maxalpha);
        }
      }
    }

    // measure distance from cursor
    var xdiff = (mouseX - centerX) - this.x;
    var ydiff = (mouseY - centerY) - this.y;
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

    // constantly spring back towards start position

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  }
}
