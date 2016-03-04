var clouds = [];
var deadclouds = [];
var breeze = 0;
var breezeDamping = 0.97;
var releaseRate = 5000;
var lastRelease = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  clouds.push(new Cloud(windowWidth/2, windowHeight/2));
  noStroke();
  breeze = random(-0.5,0.5);
}

function draw(){
  // change wind
  // breeze += random(-0.1,0.1);
  // breeze *= breezeDamping;
  // console.log(breeze);
  background(150, 220, 255);
  // release new clouds
  if(millis() - lastRelease > releaseRate){
    var xpos = random(-100, windowWidth + 100);
    var ypos = random(windowHeight);
    clouds.push(new Cloud(xpos, ypos));
    lastRelease = millis();
  }
  // draw all the clouds
  for(var i=0; i<clouds.length; i++){
    clouds[i].move();
    clouds[i].draw();
    if(clouds[i].dead){
      deadclouds.push(clouds[i]);
    }
  }
  // remove the dead clouds
  for(var n=0; n<deadclouds.length; n++){
    var index = clouds.indexOf(deadclouds[n]);
    if(index > -1){
      clouds.splice(index, 1);
    }
  }
  deadclouds = [];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Cloud(x, y){
  this.x = x;
  this.y = y;
  this.xv = 0;
  this.yv = 0;
  this.lifespan = random(10000,15000);
  this.birth = millis();
  this.dead = false;
  this.c = color(255);
  this.fluffbits = [];
  var fluffcount = random(50,100);
  var xoffset = random(windowWidth/4);
  var yoffset = random(windowWidth/8);
  for(var i=0; i<fluffcount; i++){
    var xpos = random(0-xoffset, xoffset);
    var ypos = random(0-yoffset, yoffset);
    var fluff = new Fluff(xpos, ypos, this.c);
    this.fluffbits.push(fluff);
  }
}

Cloud.prototype = {
  constructor: Cloud,

  draw:function(){
    push();
    translate(this.x, this.y);
    for(var i=0; i<this.fluffbits.length; i++){
      this.fluffbits[i].move();
      this.fluffbits[i].draw();
    }
    pop();
  },

  move:function(){
    this.x += breeze;
    if(millis() - this.birth > this.lifespan){
      // tell all the fluff to fade out.
      var alldead = true;
      for(var i=0; i<this.fluffbits.length; i++){
        if(!this.fluffbits[i].fadingOut && !this.fluffbits[i].dead){
          this.fluffbits[i].pasta = this.fluffbits[i].a;
          this.fluffbits[i].targeta = 0;
          this.fluffbits[i].fadeStart = millis();
          this.fluffbits[i].fadingOut = true;
        }
        if(!this.fluffbits[i].dead){
          alldead = false;
        }
      }
      // if all the fluff has faded out, kill the cloud.
      if(alldead){
        this.dead = true;
      }
    }
  }
}






function Fluff(x, y, c){
  this.x = x;
  this.y = y;
  this.startX = x;
  this.startY = y;
  this.xv = 0;
  this.yv = 0;
  this.noiseForce = 0.05;
  this.springMult = 0.01;
  this.damping = 0.97;
  this.fadingIn = true;
  this.fadingOut = false;
  this.fadeStart = millis();
  this.fadeDuration = random(3000,5000);
  this.dead = false;
  //this.c = color(red(c), green(c), blue(c), random(8,32));
  this.c = c;
  this.a = 0;
  this.pasta = this.a;
  this.targeta = random(8,16);
  this.w = random(windowWidth/8, windowWidth/4);
  this.h = random(windowWidth/16, windowWidth/8);
}

Fluff.prototype = {
  constructor: Fluff,

  draw:function(){
    this.handleFading();
    fill(red(this.c), green(this.c), blue(this.c), this.a);
    ellipse(this.x, this.y, this.w, this.h);
  },

  handleFading:function(){
    if(this.fadingIn){
      var p = (millis() - this.fadeStart) / this.fadeDuration;
      if(p >= 1){
        this.fadingIn = false;
      } else {
        this.a = (p * (this.targeta - this.pasta)) + this.pasta;
      }
    } else if(this.fadingOut){
      var p = (millis() - this.fadeStart) / this.fadeDuration;
      if(p >= 1){
        this.fadingOut = false;
        this.dead = true;
      } else {
        this.a = (p * (this.targeta - this.pasta)) + this.pasta;
      }
    }
  },

  move:function(){
    // add noise
    this.xv += random(0-this.noiseForce, this.noiseForce);
    this.yv += random(0-this.noiseForce, this.noiseForce);
    // spring back towards start position
    var springXdiff = this.startX - this.x;
    var springYdiff = this.startY - this.y;
    var springDist = sqrt(springXdiff*springXdiff + springYdiff*springYdiff);
    if(springDist > 0){
      // get the normalized vectors of the spring tether
      var normSpringX = springXdiff / springDist;
      var normSpringY = springYdiff / springDist;
      this.xv += normSpringX * (springDist * this.springMult);
      this.yv += normSpringY * (springDist * this.springMult);
    }
    // dampen the vectors
    this.xv *= this.damping;
    this.yv *= this.damping;
    // change the position
    this.x += this.xv;
    this.y += this.yv;
  }
}
