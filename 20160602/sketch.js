var pg;
var robots = [];
var robotCount = 20;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  ellipseMode(CENTER);
  rectMode(CENTER);
  pg = createGraphics(windowWidth, windowHeight);
  pg.background(0);
  pg.strokeWeight(windowWidth * 0.01);
  pg.loadPixels();
  for(var i=0; i<robotCount; i++){
    robots.push(new Robot());
  }
}

function draw(){
  pg.loadPixels();
  background(0);
  image(pg,0,0,windowWidth,windowHeight);
  strokeWeight(1);
  for(var i=0; i<robots.length; i++){
    robots[i].move();
    robots[i].draw();
  }
}

function mouseDragged(){
  pg.stroke(255);
  pg.line(pmouseX, pmouseY, mouseX, mouseY);
}

function keyPressed(){
  if(key == ' '){
    pg.background(0);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  pg = createGraphics(windowWidth, windowHeight);
  pg.background(0);
}




function Robot(){
  this.pos = createVector(random(windowWidth), random(windowHeight));
  this.vec = p5.Vector.fromAngle(random(TWO_PI));
  this.w = 40;
  this.h = 20;
  //this.sensorA = new Sensor(this, 0, 0);
  this.sensorA = new Sensor(this, -0.4);
  //this.sensorB = new Sensor(this, this.w/2, 0);
  this.sensorC = new Sensor(this, 0.4);
}

Robot.prototype = {
  constructor:Robot,

  draw:function(){
    stroke(255,0,0);
    noFill();
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vec.heading());
    rect(0, 0, this.w, this.h);
    pop();
  },

  move:function(){
    if(this.sensorA.isOnPath() && !this.sensorC.isOnPath()){
      this.vec.rotate(-0.1);
    } else if(!this.sensorA.isOnPath() && this.sensorC.isOnPath()){
      this.vec.rotate(0.1);
    }

    this.pos.x += this.vec.x;
    this.pos.y += this.vec.y;

    // keep robots on screen
    if(this.pos.x < 0){
      this.pos.x = 0;
      this.vec.x *= -1;
    } else if(this.pos.x > windowWidth){
      this.pos.x = windowWidth;
      this.vec.x *= -1;
    }
    if(this.pos.y < 0){
      this.pos.y = 0;
      this.vec.y *= -1;
    } else if(this.pos.y > windowHeight){
      this.pos.y = windowHeight;
      this.vec.y *= -1;
    }
  }
}

function Sensor(parent, rot){
  this.parent = parent;
  this.rot = rot;
}

Sensor.prototype = {
  constructor:Sensor,

  draw:function(){
    //noStroke();
    //ellipse(this.x, this.y, 5, 5);
  },

  getValue:function(){
    var xpos = this.parent.pos.x + (this.parent.w/2 * cos(this.parent.vec.heading() + this.rot));
    var ypos = this.parent.pos.y + (this.parent.w/2 * sin(this.parent.vec.heading() + this.rot));
    ellipse(xpos, ypos, 5, 5);
    var i = ((int(ypos) * pg.width) + int(xpos)) * 4;
    var c = color(pg.pixels[i], pg.pixels[i+1], pg.pixels[i+2], pg.pixels[i+3]);
    return brightness(c);
  },

  isOnPath:function(){
    if(this.getValue() > 0){
      return true;
    }
    return false;
  }
}
