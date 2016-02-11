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
  background(255);
  push();
  translate(xOffset, yOffset);
  for(var i=0; i<tethers.length; i++){
    tethers[i].move();
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
}

Tether.prototype = {
  constructor:Tether,

  draw:function(){
    push();
    stroke(0,150,255,64);
    line(this.x, this.y, this.startX, this.startY);
    fill(0);
    ellipse(this.x,this.y,5,5);
    pop();
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

    // constantly move away from cursor
    if(dist < pushRadius){
      var force = (1 - dist/pushRadius) * 0.1;
      this.xv -= xdiffNorm * force;
      this.yv -= ydiffNorm * force;
    }

    // constantly move back towards start position
    // TODO: this spring action is FUCKED
    xdiff = this.x - this.startX;
    ydiff = this.y - this.startY;
    dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    // this.xv += (xdiff / dist) * 0.01;
    // this.yv += (ydiff / dist) * 0.01;

    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  }
}
