var launchers = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  background(0);
  strokeWeight(3);
}

function draw(){
  blendMode(NORMAL);
  background(0,0,0,16);
  blendMode(SCREEN);
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
  var pos = createVector(0, windowHeight);
  var vec = createVector((mouseX-pos.x)*0.03, (mouseY-pos.y)*0.03);
  var c = color(255,0,0);
  launchers.push(new Launcher(pos, vec, c));
  pos = createVector(windowWidth, windowHeight);
  vec = createVector((mouseX-pos.x)*0.03, (mouseY-pos.y)*0.03);
  c = color(0,255,0);
  launchers.push(new Launcher(pos, vec, c));
  pos = createVector(windowWidth/2, 0);
  vec = createVector((mouseX-pos.x)*0.03, (mouseY-pos.y)*0.03);
  c = color(0,0,255);
  launchers.push(new Launcher(pos, vec, c));
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Launcher(pos, vec, c){
  this.pos = pos;
  this.lastpos = pos;
  this.vec = vec;
  this.damping = 0.97;
  this.noiseForce = 0.3;
  this.a = 255;
  this.h = (millis() * 0.01) % 255;
  this.c = c;
  this.dead = false;
}

Launcher.prototype = {
  constructor:Launcher,

  draw:function(){
    this.lastpos = this.pos.copy();
    this.pos.add(this.vec);
    this.vec.add(createVector(random(0-this.noiseForce, this.noiseForce), random(0-this.noiseForce, this.noiseForce)));
    this.vec.mult(this.damping);
    stroke(this.c);
    line(this.pos.x, this.pos.y, this.lastpos.x, this.lastpos.y);
    this.a--;
    if(this.a <= 0){
      this.dead = true;
    }
  }
}
