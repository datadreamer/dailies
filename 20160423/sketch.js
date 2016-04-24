var bouncers = [];
var maxForce = 1;
var angleForce = 0.01;
var damping = 0.97;
var releaseRate = 300;
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
  if(millis() - lastRelease >= releaseRate){
    bouncers.push(new Bouncer(createVector(random(windowWidth), random(windowHeight))));
    lastRelease = millis();
  }
  blendMode(NORMAL);
  background(0,0,0,16);
  blendMode(SCREEN)
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
  this.d = random(windowWidth * 0.2, windowWidth * 0.5);
  this.birth = millis();
  this.lifespan = random(5000,10000);
  this.angle = 0;
  this.anglevec = 0;
  var rando = floor(random(2.99));
  if(rando == 0){
    this.c = color(0,255,255);  // red
  } else if(rando == 1){
    this.c = color(85,255,255); // green
  } else {
    this.c = color(170,255,255,32); // blue
  }
  this.dead = false;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    this.vec.add(random(-maxForce,maxForce), random(-maxForce,maxForce)); // add noise to vector
    this.pos.add(this.vec);                                               // add vector to position
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
    //fill(this.c);
    var xdiff = this.pos.x - mouseX;
    var ydiff = this.pos.y - mouseY;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    var a = (1 - (hypo / mouseRadius));
    fill(hue(this.c), a * 255, brightness(this.c), a * 64);
    rect(0, 0, this.d, this.d);
    pop();
  }
}
