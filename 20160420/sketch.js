var launchers = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  strokeWeight(5);
  newLauncher();
}

function draw(){
  newLauncher();
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

function newLauncher(){
  var pos;// = createVector(windowWidth/2, windowHeight);
  var vec = createVector(0,0);
  var c = color(random(100,180),255,255);
  var spacing = windowWidth / 10;
  var r = random();
  if(r < 0.2){
    pos = createVector(spacing, windowHeight);
    c = color(255,0,0);
  } else if(r >= 0.2 && r < 0.4){
    pos = createVector(spacing * 3, windowHeight);
    c = color(255,255,0);
  } else if(r >= 0.4 && r < 0.6){
    pos = createVector(spacing * 5, windowHeight);
    c = color(0,255,0);
  } else if(r >= 0.6 && r < 0.8){
    pos = createVector(spacing * 7, windowHeight);
    c = color(0,255,255);
  } else {
    pos = createVector(spacing * 9, windowHeight);
    c = color(0,0,255);
  }
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
  this.sw = 1;
  this.angle = 0;
  this.angleSpeed = windowHeight * random(0.00003,0.00005);//0.00005;
  this.sinWidth = windowWidth * 0.0005;
  this.dead = false;
}

Launcher.prototype = {
  constructor:Launcher,

  draw:function(){
    this.lastpos = this.pos.copy();
    // add vector to position
    this.pos.add(this.vec);
    // add upward force and sin force to vector
    this.vec.add(createVector(cos(this.angle) * this.sinWidth, -0.1));
    this.angle += this.angleSpeed;
    // add noise to vector
    //this.vec.add(createVector(random(0-this.noiseForce, this.noiseForce), random(0-this.noiseForce, this.noiseForce)));
    // dampen vector to prevent madness
    this.sw = sin(this.angle)
    strokeWeight((this.sw+2)*5)
    this.vec.mult(this.damping);
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
    line(this.pos.x, this.pos.y, this.lastpos.x, this.lastpos.y);
    this.a -= 0.5;
    if(this.a <= 0){
      this.dead = true;
    }
  }
}
