var bouncers = [];
var maxForce = 1;
var xCount = 10;
var spacing, yCount;
var angleForce = 0.01;
var damping = 0.97;
var releaseRate = 100;
var lastRelease = 0;
var mouseRadius;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  rectMode(CENTER);
  colorMode(HSB, 255);
}

function draw(){
  mouseRadius = windowWidth * 0.5;
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  if(millis() - lastRelease >= releaseRate){
    var xpos = floor(random(xCount)) * spacing + (spacing/2);
    var ypos = floor(random(yCount)) * spacing + (spacing/2);
    bouncers.push(new Bouncer(createVector(xpos, ypos)));
    lastRelease = millis();
  }
  blendMode(NORMAL);
  background(255,16);
  blendMode(MULTIPLY)
  for(var i=bouncers.length-1; i>=0; i--){
    bouncers[i].draw();
    if(bouncers[i].dead){
      bouncers.splice(i,1);
    }
  }
}

function mousePressed(){
  var xpos = floor(random(xCount)) * spacing + (spacing/2);
  var ypos = floor(random(yCount)) * spacing + (spacing/2);
  bouncers.push(new Bouncer(createVector(xpos, ypos)));
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bouncer(pos){
  this.pos = pos;
  this.vec = createVector(random(-maxForce,maxForce), random(-maxForce,maxForce));
  this.d = spacing;
  this.birth = millis();
  this.lifespan = random(5000,10000);
  this.angle = 0;
  this.anglevec = 0;
  var rando = floor(random(2.99));
  if(rando == 0){
    this.c = color(230,255,255);  // red
  } else if(rando == 1){
    this.c = color(40,255,255); // yellow
  } else {
    this.c = color(139,255,255,32); // cyan
  }
  this.dead = false;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    this.vec.mult(damping);                                               // dampen vector
    this.anglevec += random(-angleForce, angleForce);                     // add noise to angle vector
    this.angle += this.anglevec;                                          // add angle vector to angle
    this.anglevec *= damping;                                             // dampen vector
    if(millis() - this.birth > this.lifespan){
      this.dead = true;
    }
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    var xdiff = this.pos.x - mouseX;
    var ydiff = this.pos.y - mouseY;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    var a = (1 - (hypo / mouseRadius));
    fill(hue(this.c), 255, brightness(this.c), a * 64);
    rect(0, 0, this.d*2, this.d/2);
    pop();
  }
}
