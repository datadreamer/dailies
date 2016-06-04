var pg;
var trails;
var robots = [];
var robotCount = 50;
var showPaths = false;
var showTrails = true;
var showRobots = true;
var maxSpeed = 10;
var maxColor = 15;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  ellipseMode(CENTER);
  rectMode(CENTER);
  pg = createGraphics(windowWidth, windowHeight);
  pg.background(0);
  pg.strokeWeight(windowWidth * 0.01);
  pg.fill(255);
  pg.textSize(windowHeight);
  pg.textFont("Times New Roman");
  pg.textAlign(CENTER);
  pg.text("A", windowWidth/2, windowHeight * 0.8);
  pg.loadPixels();
  trails = createGraphics(windowWidth, windowHeight);
  trails.blendMode(SCREEN);
  trails.colorMode(HSB, maxColor);
  trails.strokeWeight(windowWidth * 0.01);
  //trails.stroke(255,32);
  trails.noFill();
  for(var i=0; i<robotCount; i++){
    robots.push(new Robot());
  }
}

function draw(){
  pg.loadPixels();
  background(0);
  if(showPaths){
    image(pg,0,0,windowWidth,windowHeight);
  }
  if(showTrails){
    image(trails,0,0,windowWidth,windowHeight);
  }
  for(var i=0; i<robots.length; i++){
    robots[i].move();
    if(showRobots){
      robots[i].draw();
    }
  }
}

// function mouseDragged(){
//   pg.stroke(255);
//   pg.line(pmouseX, pmouseY, mouseX, mouseY);
// }

function mousePressed(){
  showPaths = true;
}

function mouseReleased(){
  showPaths = false;
}

function keyTyped(){
  // if(key == ' '){
  //   pg.background(0);
  // } else if(key == 't'){
  //   showTrails = !showTrails;
  // } else if(key == 'p'){
  //   showPaths = !showPaths;
  // } else if(key == 'r'){
  //   showRobots = !showRobots;
  // }
  trails.blendMode(NORMAL);
  trails.clear();
  trails.blendMode(SCREEN);
  pg.background(0);
  pg.text(key.toUpperCase(), windowWidth/2, windowHeight * 0.8);
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
  this.pastx;
  this.pasty;
  this.sensorA = new Sensor(this, -1);
  this.sensorB = new Sensor(this, 0);
  this.sensorC = new Sensor(this, 1);
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
    this.sensorA.draw();
    this.sensorB.draw();
    this.sensorC.draw();
  },

  move:function(){
    // keep robot on path using two sensors
    if(this.sensorA.isOnPath() && !this.sensorC.isOnPath()){
      this.vec.rotate(-0.1);
    } else if(!this.sensorA.isOnPath() && this.sensorC.isOnPath()){
      this.vec.rotate(0.1);
    } else if(!this.sensorA.isOnPath() && !this.sensorC.isOnPath()){
      this.vec.rotate(random(-0.1, 0.1));
    }
    // if center sensor is on path, speed up, otherwise slow down.
    if(this.sensorB.isOnPath()){
      if(this.vec.mag() < maxSpeed){
        this.vec.mult(1.05);
      }
    } else {
      if(this.vec.mag() > 1){
        this.vec.mult(0.97);
      }
    }


    // record last position and update current position
    this.pastx = this.pos.x;
    this.pasty = this.pos.y;
    this.pos.x += this.vec.x;
    this.pos.y += this.vec.y;

    // draw robot trail
    //trails.stroke(this.vec.heading()+PI, TWO_PI, TWO_PI, 0.5);
    trails.stroke(maxSpeed - this.vec.mag(), maxColor, maxColor, this.vec.mag() * 0.3);
    trails.line(this.pastx, this.pasty, this.pos.x, this.pos.y);

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
  var hypo = sqrt(this.parent.w*this.parent.w + this.parent.h*this.parent.h);
  this.x = this.parent.pos.x + (hypo/2 * cos(this.parent.vec.heading() + this.rot));
  this.y = this.parent.pos.y + (hypo/2 * sin(this.parent.vec.heading() + this.rot));
}

Sensor.prototype = {
  constructor:Sensor,

  draw:function(){
    //noStroke();
    ellipse(this.x, this.y, 5, 5);
  },

  getValue:function(){
    var hypo = sqrt(this.parent.w*this.parent.w + this.parent.h*this.parent.h);
    this.x = this.parent.pos.x + (hypo/2 * cos(this.parent.vec.heading() + this.rot));
    this.y = this.parent.pos.y + (hypo/2 * sin(this.parent.vec.heading() + this.rot));
    //ellipse(this.x, this.y, 5, 5);
    var i = ((int(this.y) * pg.width) + int(this.x)) * 4;
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
