var launchers = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colorMode(HSB, 255);
}

function draw(){
  background(0,0,0,16);
  for(var i=launchers.length-1; i>=0; i--){
    launchers[i].draw();
    if(launchers[i].dead){
      launchers.splice(i,1);
    }
  }
}

function mouseDragged(){
  mouseMoved();
}

function mouseMoved(){
  if(random() > 0.5){
    var pos = createVector(mouseX, windowHeight);
    var vec = createVector(0, random(0-windowHeight/40));
    launchers.push(new Launcher(pos, vec));
  } else {
    var pos = createVector(mouseX, 0);
    var vec = createVector(0, random(windowHeight/40));
    launchers.push(new Launcher(pos, vec));
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Launcher(pos, vec){
  this.pos = pos;
  this.lastpos = pos;
  this.vec = vec;
  this.damping = 0.97;
  this.noiseForce = 0.3;
  this.a = 255;
  this.h = (millis() * 0.01) % 255;
  this.dead = false;
}

Launcher.prototype = {
  constructor:Launcher,

  draw:function(){
    this.lastpos = this.pos.copy();
    this.pos.add(this.vec);
    this.vec.add(createVector(random(0-this.noiseForce, this.noiseForce), 0));
    this.vec.mult(this.damping);
    stroke(this.h, 255, 255, this.a);
    line(this.pos.x, this.pos.y, this.lastpos.x, this.lastpos.y);
    this.a--;
    if(this.a <= 0){
      this.dead = true;
    }
  }
}
