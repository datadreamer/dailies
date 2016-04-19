var launchers = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  background(0);
  strokeWeight(5);
  colorMode(HSB, 255);
}

function draw(){
  var pos = createVector(windowWidth/2, windowHeight);
  var vec = createVector(0,0);
  var c = color(random(100,180),255,255);
  launchers.push(new Launcher(pos, vec, c));

  background(0);
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
  this.angle = 0;
  this.angleSpeed = random(-0.1, 0.1);
  this.sinWidth = random(0.01, 0.1);
  this.dead = false;
}

Launcher.prototype = {
  constructor:Launcher,

  draw:function(){
    this.lastpos = this.pos.copy();
    // add vector to position
    this.pos.add(this.vec);
    // add upward force and sin force to vector
    this.vec.add(createVector(sin(this.angle) * this.sinWidth, -0.2));
    this.angle += this.angleSpeed;
    // add noise to vector
    //this.vec.add(createVector(random(0-this.noiseForce, this.noiseForce), random(0-this.noiseForce, this.noiseForce)));
    // dampen vector to prevent madness
    this.vec.mult(this.damping);
    stroke(hue(this.c), saturation(this.c), brightness(this.c), this.a);
    line(this.pos.x, this.pos.y, this.lastpos.x, this.lastpos.y);
    this.a--;
    if(this.a <= 0){
      this.dead = true;
    }
  }
}
