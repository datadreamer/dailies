var tethers = [];
var xCount = 10;
var yCount = 10;
var xSpacing, ySpacing;
var xOffset, yOffset;
var pushRadius;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  xSpacing = windowWidth / xCount;
  ySpacing = windowHeight / yCount;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*xSpacing;
      var ypos = y*ySpacing;
      tethers.push(new Tether(xpos, ypos));
    }
  }
  pushRadius = windowWidth/4;
  xOffset = xSpacing/2;
  yOffset = ySpacing/2;
}

function draw(){
  background(0,35,60);
  push();
  translate(xOffset, yOffset);
  // move everything
  for(var i=0; i<tethers.length; i++){
    tethers[i].move();
  }
  // draw lines inbetween as well as the tethers
  for(var i=0; i<tethers.length; i++){
    if(i < tethers.length-1){
      if(i % xCount < 9){
        stroke(255,128);
        line(tethers[i].x, tethers[i].y, tethers[i+1].x, tethers[i+1].y);
        stroke(255,32);
        line(tethers[i].startX, tethers[i].startY, tethers[i+1].startX, tethers[i+1].startY);
      }
      if(i < tethers.length - xCount){
        stroke(255,128);
        line(tethers[i].x, tethers[i].y, tethers[i+xCount].x, tethers[i+xCount].y);
        stroke(255,32);
        line(tethers[i].startX, tethers[i].startY, tethers[i+xCount].startX, tethers[i+xCount].startY);
      }
    }
    tethers[i].draw();
  }
  pop();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}







function Tether(x, y){
  this.x = x;
  this.y = y;
  this.xv = 0;
  this.yv = 0;
  this.startX = x;
  this.startY = y;
  this.damping = 0.97;
  this.springMult = 0.01;
  this.pushMult = 0.8;
  this.d = 3;
}

Tether.prototype = {
  constructor:Tether,

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

    // constantly spring back towards start position

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  }
}
