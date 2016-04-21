var bouncers = [];
var bouncerCount = 100;
var maxForce = 5;
var bounceAddition = 50;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  for(var i=0; i<bouncerCount; i++){
    bouncers.push(new Bouncer());
  }
}

function draw(){
  blendMode(NORMAL);
  background(0,0,0,16);
  blendMode(SCREEN);
  for(var i=bouncers.length-1; i>=0; i--){
    bouncers[i].draw();
    if(bouncers[i].dead){
      bouncers.splice(i,1);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bouncer(){
  this.pos = createVector(random(windowWidth), random(windowHeight));
  this.vec = createVector(random(-maxForce,maxForce), random(-maxForce,maxForce));
  this.d = windowWidth * 0.1;
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 255;
  this.dead = false;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    this.pos.add(this.vec);
    if(this.pos.x+this.d/2 > windowWidth){  // right (red)
      this.pos.x = windowWidth - this.d/2;
      this.vec.x *= -1;
      this.r = 255;
      this.g = 0;
      this.b = 0;
    } else if(this.pos.x-this.d/2 < 0){     // left (green)
      this.pos.x = this.d/2;
      this.vec.x *= -1;
      this.r = 0;
      this.g = 255;
      this.b = 0;
    }
    if(this.pos.y-this.d/2 < 0){                    // top (blue)
      this.pos.y = this.d/2;
      this.vec.y *= -1;
      this.r = 0;
      this.g = 0;
      this.b = 255;
    } else if(this.pos.y+this.d/2 > windowHeight){  // bottom (alpha)
      this.pos.y = windowHeight - this.d/2;
      this.vec.y *= -1;
      this.a += bounceAddition;
      this.r = 255;
      this.g = 255;
      this.b = 255;
    }
    fill(this.r, this.g, this.b, this.a);
    ellipse(this.pos.x, this.pos.y, this.d, this.d);
  }
}
