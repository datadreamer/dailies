var bouncers = [];
var bouncerCount = 100;
var maxForce = 5;
var bounceAddition = 50;
var gravity = 0.91;
var redimg, greenimg, blueimg;

function preload(){
  redimg = loadImage("red.png");
  greenimg = loadImage("green.png");
  blueimg = loadImage("blue.png");
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  imageMode(CENTER);
  for(var i=0; i<bouncerCount; i++){
    bouncers.push(new Bouncer(createVector(random(windowWidth), random(windowHeight))));
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

function mousePressed(){
  bouncers.push(new Bouncer(createVector(mouseX, mouseY)));
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bouncer(pos){
  this.pos = pos;
  this.vec = createVector(random(-maxForce,maxForce), random(-maxForce,maxForce));
  this.d = random(windowWidth * 0.1, windowWidth * 0.2);
  var rando = floor(random(2.99));
  if(rando == 0){
    this.img = redimg;
  } else if(rando == 1){
    this.img = greenimg;
  } else {
    this.img = blueimg
  }
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
    } else if(this.pos.x-this.d/2 < 0){     // left (green)
      this.pos.x = this.d/2;
      this.vec.x *= -1;
    }
    if(this.pos.y-this.d/2 < 0){                    // top (blue)
      this.pos.y = this.d/2;
      this.vec.y *= -1;
    } else if(this.pos.y+this.d/2 > windowHeight){  // bottom (alpha)
      this.pos.y = windowHeight - this.d/2;
      this.vec.y *= -0.97;
      if(abs(this.vec.y) < 0.4){
        this.dead = true;
      }
    }
    this.vec.add(createVector(0, gravity));
    image(this.img, this.pos.x, this.pos.y, this.d, this.d);
  }
}
