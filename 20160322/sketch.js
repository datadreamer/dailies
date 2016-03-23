var tiles = [];
var tileSize;

var tethers = [];
var xCount = 22;
var yCount;
var tileXcount, tileYcount;
var xSpacing, ySpacing;
var xOffset, yOffset;
var pushRadius;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  xSpacing = windowWidth / xCount;
  yCount = windowHeight / xSpacing;
  ySpacing = windowHeight / yCount;
  // create tethers
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*xSpacing;
      var ypos = y*ySpacing;
      tethers.push(new Tether(xpos, ypos));
    }
  }
  // create tiles
  var lastc = 0;
  var c, xoffset;
  for(var y=2; y<yCount; y+=2){
    if(lastc == 0){
      lastc = 255;
      xoffset = 0;
      c = color(lastc);
    } else {
      lastc = 0;
      xoffset = 2;
      c = color(lastc);
    }
    for(var x=2; x+4+xoffset<=xCount; x+=4){
      tiles.push(new Houndstooth(x+xoffset, y, c));
    }
  }
  pushRadius = windowWidth/4;
  xOffset = xSpacing;
  yOffset = ySpacing;
}

function draw(){
  background(0,180,255);
  push();
  translate(xOffset, yOffset);
  // move everything
  for(var i=0; i<tethers.length; i++){
    tethers[i].move();
  }
  // draw grid
  // for(var i=0; i<tethers.length; i++){
  //   tethers[i].draw();
  // }
  // draw houndstooth tiles
  for(var i=0; i<tiles.length; i++){
    tiles[i].draw();
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





function Houndstooth(x, y, c){
  this.x = x; // grid pos, not pixel
  this.y = y;
  this.c = c;
  this.a = 0;
  var i = y*xCount + x;
  this.points = [
    tethers[i - (xCount + 1)],
    tethers[i - (xCount*2 + 1)],
    tethers[i - xCount],
    tethers[i - (xCount - 1)],
    tethers[i + xCount + 3],
    tethers[i + xCount + 2],
    tethers[i + 1],
    tethers[i + xCount + 1],
    tethers[i + xCount],
    tethers[i + xCount*2 + 1],
    tethers[i + xCount*3 + 1],
    tethers[i + (xCount - 1)],
    tethers[i - 1],
    tethers[i - (xCount + 2)]
  ];

}

Houndstooth.prototype = {
  constructor:Houndstooth,

  draw:function(){
    fill(this.c);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      if(this.points[i] != null){
        vertex(this.points[i].x, this.points[i].y);
      }
    }
    endShape(CLOSE);
  }

}
