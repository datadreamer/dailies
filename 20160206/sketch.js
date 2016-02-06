var particles = [];
var deadparticles = [];
var lastRelease = 0;
var releaseRate = 100;
var minLife = 3000;
var maxLife = 6000;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noFill();
}

function draw(){
  if(millis() - lastRelease > releaseRate){
    particles.push(new Particle(random(windowWidth), random(windowHeight)));
    lastRelease = millis();
  }
  background(0);
  stroke(255);
  for(var i=0; i<particles.length; i++){
    particles[i].move();
    particles[i].draw();
    if(particles[i].dead){
      deadparticles.push(particles[i]);
    }
  }
  // remove the dead wiggles from render list
  for(var n=0; n<deadparticles.length; n++){
    var index = particles.indexOf(deadparticles[n]);
    if(index > -1){
      particles.splice(index, 1);
    }
  }
  deadparticles = [];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Particle(x, y){
  this.x = x;
  this.y = y;
  this.pastx = [];
  this.pasty = [];
  this.xv = 0;
  this.yv = 0;
  this.alpha = 255;
  this.damping = 0.97;
  this.taillength = 20;
  this.alphastep = 255 / this.taillength;
  this.birth = millis();
  this.lifespan = random(minLife,maxLife);
  this.fading = false;
  this.fadeStart = 0;
  this.fadeDuration = 2000;
}

Particle.prototype = {
  constructor:Particle,

  draw:function(){
    for(var i=0; i<this.pastx.length-1; i++){
      stroke(255, ((this.alphastep*i)/255)*this.alpha);
      line(this.pastx[i], this.pasty[i], this.pastx[i+1], this.pasty[i+1]);
    }
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
          this.alpha = 255 - (p * 255);
        }
      }
    }
    this.pastx.push(this.x);
    this.pasty.push(this.y);
    if(this.pastx.length > this.taillength){
      this.pastx.shift();
      this.pasty.shift();
    }
    this.xv += random(-1,1);
    this.yv += random(-1,1);
    this.x += this.xv;
    this.y += this.yv;
    this.xv *= this.damping;
    this.yv *= this.damping;
  }
}
