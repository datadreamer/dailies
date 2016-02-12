var particles = [];
var deadparticles = [];
var lastRelease = 0;
var releaseRate = 250;
var radiusLimit = 0;
var minLife = 5000;
var maxLife = 20000;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  ellipseMode(CENTER);
}

function draw(){
  // update global values
  radiusLimit = windowWidth/4;
  if(windowHeight < windowWidth){
    radiusLimit = windowHeight/4;
  }

  // create new particles occasionally
  if(millis() - lastRelease > releaseRate){
    particles.push(new Particle(createVector(0,1)));
    lastRelease = millis();
  }

  // draw particles
  push();
  translate(windowWidth/2, windowHeight/2);
  background(0,16);
  blendMode(SCREEN);
  for(var i=0; i<particles.length; i++){
    particles[i].move();
    particles[i].draw();
    if(particles[i].dead){
      deadparticles.push(particles[i]);
    }
  }
  pop();

  // remove the dead particles
  for(var n=0; n<deadparticles.length; n++){
    var index = particles.indexOf(deadparticles[n]);
    if(index > -1){
      particles.splice(index, 1);
    }
  }
  deadparticles = [];
}

function getColor(pos){
  // returns a value from the rainbow spectrum
  var w = color(255);
  var b = color(0,0,255);
  var g = color(0,255,0);
  var y = color(255,255,0);
  var r = color(255,0,0);
  if(pos >= 0 && pos < 0.25){
    return lerpColor(w, b, pos);
  } else if(pos >= 0.25 && pos < 0.5){
    return lerpColor(b, g, pos);
  } else if(pos >= 0.5 && pos < 0.75){
    return lerpColor(g, y, pos);
  } else {
    return lerpColor(y, r, pos);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Particle(pos){
  this.pos = pos;
  this.vec = createVector(random(-1,1),random(-1,1));
  this.damping = 0.97;
  this.gravity = createVector(0,random(0.1,0.25));
  this.birth = millis();
  this.lifespan = random(minLife,maxLife);
  this.dead = false;
  this.c = color(255);
  this.d = random(5,20);
}

Particle.prototype = {
  constructor: Particle,

  draw:function(){
    fill(this.c);
    ellipse(this.pos.x, this.pos.y, this.d, this.d);
  },

  move:function(){
    // push particles in clockwise direction the closer they are to the radiusLimit
    var perpx = 0 - this.pos.y * 0.001;
    var perpy = this.pos.x * 0.001;
    this.vec.add(perpx, perpy);
    // iterate vector and position values
    this.vec.add(this.gravity);
    this.vec.mult(this.damping);
    this.pos.add(this.vec);
    // check if particle has moved outside radiusLimit
    if(this.pos.mag() > radiusLimit){
      this.pos.limit(radiusLimit);
      // TODO: figure out how to bounce without reducing spin significantly
      // maybe add spin force when bounce occurs, like a real dryer?
      //this.vec.rotate(PI);
    }
    this.c = getColor(this.vec.mag() * 0.1);
    // check if the particle is dead
    if(millis() - this.birth > this.lifespan){
      this.dead = true;
    }
  }
}
