var balls = [];
var deadballs = [];
var lastRelease = 0;
var releaseRate;
var gravityX = 0;
var gravityY = 0.3;
var bounceFriction = 0.95;
var alpha = 1;
var beta = 90;
var gamma = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  colorMode(HSB, 360);
  angleMode(DEGREES);
  releaseRate = random(1000,3000);
  balls.push(new Ball(windowWidth/2, windowHeight/2));
  if(window.DeviceOrientationEvent){
    window.addEventListener('deviceorientation', onOrientationChange);
  }
}

function draw(){
  // release a new ball
  if(millis() - lastRelease > releaseRate){
    balls.push(new Ball(windowWidth/2, windowHeight/2));
    lastRelease = millis();
    releaseRate = random(1000,3000);
  }

  background(0,32);
  for(var i=0; i<balls.length; i++){
    balls[i].move();
    balls[i].draw();
    if(balls[i].dead){
      deadballs.push(balls[i]);
    }
  }

  push();
  fill(255);
  translate(windowWidth/2, windowHeight/2);
  if(alpha != null && beta != null && gamma != null){
    gravityY = (beta / 90) * 0.3;
    // TODO: this breaks everything
    // TODO: figure out how to lock device orientation
    //gravityX = (alpha / 90) * 0.3;
    // text("horizontal: " + alpha, 0, 0);
    // text("vertical: " + beta, 0, 20);
    // text("gravityY: " + gravityY, 0, 40);
  }
  pop();

  // remove dead balls
  for(var n=0; n<deadballs.length; n++){
    var index = balls.indexOf(deadballs[n]);
    if(index > -1){
      balls.splice(index, 1);
    }
  }
  deadballs = [];
}

function mousePressed(){
  balls.push(new Ball(mouseX, mouseY));
  lastRelease = millis();
  releaseRate = random(1000,3000);
}

function onOrientationChange(e){
  if(e.alpha != null){
    alpha = e.alpha;
  }
  if(e.beta != null){
    beta = e.beta;
  }
  if(e.gamma != null){
    gamma = e.gamma;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Ball(x, y){
  this.x = x;
  this.y = y;
  this.xv = random(-1,1);
  this.yv = random(-1,1);
  this.d = random(3,10);
  this.c = color(millis() * 0.01, 360, 360);
  this.lifespan = random(10000,20000);
  this.birth = millis();
  this.dead = false;
}

Ball.prototype = {
  constructor: Ball,

  draw:function(){
    fill(this.c);
    ellipse(this.x, this.y, this.d, this.d);
  },

  move(){
    this.xv += gravityX;
    this.yv += gravityY;
    this.x += this.xv;
    this.y += this.yv;
    // bounce off floor and ceiling
    if(this.y+this.d/2 > windowHeight){
      this.y = windowHeight - this.d/2;
      this.yv *= -1 * bounceFriction;
    } else if(this.y-this.d/2 < 0){
      this.y = this.d/2;
      this.yv *= -1 * bounceFriction;
    }
    // bounce off walls
    if(this.x-this.d/2 < 0){
      this.x = this.d/2;
      this.xv *= -1 * bounceFriction;
    } else if(this.x+this.d/2 > windowWidth){
      this.x = windowWidth - this.d/2;
      this.xv *= -1 * bounceFriction;
    }
    // check if dead
    if(millis() - this.birth > this.lifespan){
      this.dead = true;
    }
  }
}
