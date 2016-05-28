var waves = [];
var pushRadius;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  for(var i=0; i<5; i++){
    var ypos = (windowHeight * (0.2 * i)) + windowHeight * 0.1;
    waves.push(new Wave(ypos, windowHeight * 0.1, color(255,0,0)));
    waves.push(new Wave(ypos, windowHeight * 0.1, color(0,255,0)));
    waves.push(new Wave(ypos, windowHeight * 0.1, color(0,0,255)));
  }
  noStroke();
  fill(0);
  rectMode(CENTER);
  pushRadius = windowWidth/4;
}

function draw(){
  blendMode(NORMAL);
  background(0);
  blendMode(SCREEN);
  for(var i=0; i<waves.length; i++){
    waves[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Wave(y, h, c){
  this.y = y;
  this.h = h;
  this.c = c;
  this.topPoints = [];
  this.bottomPoints = [];
  this.detail = 30;
  // top row (left to right)
  for(var i=0; i<=this.detail; i++){
    var xpos = windowWidth * (i/this.detail);
    var ypos = y - (h/2);
    this.topPoints.push(new WavePoint(xpos, ypos));
  }
  // bottom row (right to left)
  for(var i=this.detail; i>=0; i--){
    var xpos = windowWidth * (i/this.detail);
    var ypos = y + (h/2);
    this.bottomPoints.push(new WavePoint(xpos, ypos));
  }
}

Wave.prototype= {
  constructor:Wave,

  draw:function(){
    fill(this.c);
    beginShape();
    for(var i=0; i<this.topPoints.length; i++){
      this.topPoints[i].move();
      vertex(this.topPoints[i].x, this.topPoints[i].y);
    }
    vertex(windowWidth, this.y - (this.h/2));
    vertex(windowWidth, this.y + (this.h/2));
    for(var i=0; i<this.bottomPoints.length; i++){
      this.bottomPoints[i].move();
      vertex(this.bottomPoints[i].x, this.bottomPoints[i].y);
    }
    vertex(0, this.y + (this.h/2));
    vertex(0, this.y - (this.h/2));
    endShape(CLOSE);
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
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
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
