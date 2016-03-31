var pieces = [];
var deadpieces = [];
var xCount = 20;
var yCount;
var spacing, halfSpacing;
var colors;
var gravity = 0.91;
var lastRelease = 0;
var releaseRate = 200;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  colors = [color(30,157,255), color(53,232,101), color(255,247,71), color(232,143,53), color(255,47,65)];
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  halfSpacing = spacing/2;
}

function draw(){
  if(millis() - lastRelease > releaseRate){
    var xpos = random(windowWidth);
    var ypos = 0-spacing;
    var c = floor(random(colors.length));
    var p = new Confetti(xpos, ypos, spacing, c);
    p.rotate(random(500,2000));
    pieces.push(p);
    lastRelease = millis();
  }

  blendMode(NORMAL);
  background(0);
  blendMode(SCREEN);
  for(var i=0; i<pieces.length; i++){
    pieces[i].draw();
    if(pieces[i].dead){
      deadpieces.push(pieces[i]);
    }
  }
  // remove dead balls
  for(var n=0; n<deadpieces.length; n++){
    var index = pieces.indexOf(deadpieces[n]);
    if(index > -1){
      pieces.splice(index, 1);
    }
  }
  deadpieces = [];
}

function mousePressed(){
  for(var i=0; i<10; i++){
    var xpos = random(windowWidth);
    var ypos = 0-spacing;
    var c = floor(random(colors.length));
    var p = new Confetti(xpos, ypos, halfSpacing, c);
    p.rotate(random(500,2000));
    pieces.push(p);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Confetti(x, y, s, c){
  this.x = x;
  this.y = y;
  this.xv = 0;
  this.yv = 0;
  this.damping = random(0.7, 0.95);
  this.s = s;
  this.targets = random(halfSpacing, spacing);
  this.pasts = s;
  this.c = c;
  this.a = 0;
  this.rotating = false;
  this.rotateStart = millis();
  this.rotateDuration = 1000;
  this.sizing = true;
  this.sizingStart = millis();
  this.sizingDuration = random(500,2000);
  this.dead = false;
  this.flipping = true;
  this.flipX = 1;
  this.flipY = 1;
  this.flipPastX = this.flipX;
  this.flipTargetX = random(-1,1);
  this.flipPastY = this.flipY;
  this.flipTargetY = random(-1,1);
  this.flipStart = millis();
  this.flipDuration = random(500,2000);

  this.vertices = [
    createVector(random(-1), random(-1)),
    createVector(random(1), random(-1)),
    createVector(random(1), random(1)),
    createVector(random(-1), random(1))
  ];

  var r = random();
  if(r >= 0.25 && r < 0.5){
    this.a = HALF_PI;
  } else if(r >= 0.5 && r < 0.75){
    this.a = PI;
  } else if(r >= 0.75){
    this.a = PI + HALF_PI;
  }
  this.targeta = this.a;
  this.pasta = this.a;
}

Confetti.prototype = {
  constructor:Confetti,

  draw:function(){
    this.handleFlipping();
    this.handleRotating();
    //this.handleSizing();

    this.yv += gravity;
    this.xv += random(-1,1);
    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;

    if(this.y > windowHeight+spacing){
      this.dead = true;
    }

    push();
    translate(this.x, this.y)
    scale(this.flipX,this.flipY);
    rotate(this.a);
    fill(colors[this.c]);
    beginShape();
    for(var i=0; i<this.vertices.length; i++){
      vertex(this.vertices[i].x * this.s, this.vertices[i].y * this.s);
    }
    endShape(CLOSE);
    pop();
  },

  handleFlipping(){
    if(this.flipping){
      var p = (millis() - this.flipStart) / this.flipDuration;
      if(p >= 1){
        this.flipX = this.flipTargetX;
        this.flipY = this.flipTargetY;
        this.flipPastX = this.flipX;
        this.flipPastY = this.flipY;
        this.flipTargetX = random(-1,1);
        this.flipTargetY = random(-1,1);
        this.flipStart = millis();
        this.flipDuration = random(200,1000);
      } else {
        this.flipX = ((this.flipTargetX - this.flipPastX) * this.sinProgress(p)) + this.flipPastX;
        this.flipY = ((this.flipTargetY - this.flipPastY) * this.sinProgress(p)) + this.flipPastY;
      }
    }
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >= 1){
        this.rotating = false;
        this.a = this.targeta;
        this.rotate(random(500,2000));
      } else {
        this.a = ((this.targeta - this.pasta) * this.sinProgress(p) ) + this.pasta;
      }
    }
  },

  handleSizing:function(){
    if(this.sizing){
      var p = (millis() - this.sizingStart) / this.sizingDuration;
      if(p >= 1){
        this.s = this.targets;
        this.pasts = this.s;
        this.targets = random(halfSpacing, spacing);
        this.sizingStart = millis();
      } else {
        this.s = ((this.targets - this.pasts) * this.sinProgress(p)) + this.pasts;
      }
    }
  },

  rotate:function(rotateDuration){
    var r = random(0.6);
    var newangle = 0;
    if(r < 0.1){
      newangle = 0 - (PI+HALF_PI);
    } else if(r >= 0.1 && r < 0.2){
      newangle = 0 - PI;
    } else if(r >= 0.2 && r < 0.3){
      newangle = 0 - HALF_PI;
    } else if(r >= 0.3 && r < 0.4){
      newangle = HALF_PI;
    } else if(r >= 0.4 && r < 0.5){
      newangle = PI;
    } else {
      newangle = PI + HALF_PI;
    }
    this.rotateDuration = rotateDuration;
    this.targeta = this.targeta + newangle;
    this.pasta = this.a;
    this.rotating = true;
    this.rotateStart = millis();
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
