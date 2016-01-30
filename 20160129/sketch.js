var bloops = [];
var deadbloops = [];
var releaseRate = 500;
var lastRelease = 0;
var minSize = 30;
var maxSize = 100;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noFill();
  strokeWeight(3);
}

function draw(){
  background(0,20);
  // release some new shit
  if(millis() - lastRelease > releaseRate){
    bloops.push(new Bloop(random(windowWidth), random(windowHeight), random(minSize, maxSize)));
    lastRelease = millis();
  }

  // draw them bloops
  for(var i=0; i<bloops.length; i++){
    bloops[i].draw();
    // check for dead bloops
    if(bloops[i].dead){
      deadbloops.push(bloops[i]);
    }
  }

  // remove the dead points from render list
  for(var n=0; n<deadbloops.length; n++){
    var index = bloops.indexOf(deadbloops[n]);
    if(index > -1){
      bloops.splice(index, 1);
    }
  }
  deadbloops = [];
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function Bloop(x, y, ts){
  this.x = x;
  this.y = y;
  this.ts = ts;   // target size
  this.s = 0;     // size
  this.sv = 0;    // size vector
  this.alpha = 255;
  this.pastalpha = this.alpha;
  this.damping = 0.98;
  this.vecpower = 0.01;
  this.birth = millis();
  this.lifespan = random(3000,6000);
  this.fadeDuration = 2000;
  this.fadeStart = 0;
  this.fading = false;
  this.dead = false;
  this.r = 255 - ((this.x / windowWidth) * 255);
  this.b = ((this.y / windowHeight) * 255);
}

Bloop.prototype = {
  constructor:Bloop,

  draw:function(){
    this.handleFading();
    this.handleSizing();
    stroke(this.r, 0, this.b, this.alpha);
    ellipse(this.x, this.y, this.s, this.s);
  },

  handleFading:function(){
    if(this.fading){
      var p = (millis() - this.fadeStart) / this.fadeDuration;
      if(p >= 1){
        //this.fading = false;
        this.dead = true;
      } else {
        this.alpha = (1 - p) * this.pastalpha;
      }
    }
  },

  handleSizing:function(){
    var diff = this.ts - this.s;
    this.sv += diff * this.vecpower;
    this.sv *= this.damping;
    this.s += this.sv;
    if(!this.dead && !this.fading){
      if(millis() - this.birth > this.lifespan){
        this.fading = true;
        this.fadeStart = millis();
      }
    }
  }
}
