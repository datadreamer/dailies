var bouncers = [];
var lines = [];
var gravity = 0.1;
var releaseRate = 500;
var lastRelease = 0;
var startPos, finishPos;
var drawingLine = false;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  bouncers.push(new Bouncer(createVector(random(windowWidth), 0)));
  colorMode(HSB, 360);
  strokeWeight(5);
  noFill();
}

function draw(){
  background(0);
  stroke(360);
  if(millis() - lastRelease > releaseRate){
    bouncers.push(new Bouncer(createVector(random(windowWidth), 0)));
    lastRelease = millis();
  }
  //strokeWeight(1);
  for(var i=bouncers.length-1; i>=0; i--){
    bouncers[i].checkCollisions();
    bouncers[i].draw();
    if(bouncers[i].dead){
      bouncers.splice(i,1);
    }
  }
  stroke(100);
  for(var i=lines.length-1; i>=0; i--){
    lines[i].draw();
    if(lines[i].dead){
      lines.splice(i,1);
    }
  }
  stroke(0,360,360);
  if(drawingLine){
    line(startPos.x, startPos.y, finishPos.x, finishPos.y);
  }
}

function mousePressed(){
  startPos = createVector(mouseX, mouseY);  // start line
  finishPos = createVector(mouseX, mouseY);
  drawingLine = true;
}

function mouseDragged(){
  finishPos = createVector(mouseX, mouseY);
}

function mouseReleased(){
  lines.push(new Line(startPos, finishPos));  // finish line
  drawingLine = false;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bouncer(pos){
  this.pos = pos;
  this.pospast = pos;
  this.vec = createVector(0,0);
  this.birth = millis();
  this.dead = false;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    stroke(200 - (millis() - this.birth)*0.01, 360, 360);
    line(this.pos.x, this.pos.y, this.pospast.x, this.pospast.y);
  },

  checkCollisions:function(){
    this.pospast = this.pos.copy();
    this.pos.add(this.vec);
    this.vec.add(0,gravity);
    if(this.pos.y > height){
      this.dead = true;
    }
    if(this.pos.x < 0){
      this.pos.x = 0;
      this.vec.x *= -1;
    } else if(this.pos.x > width){
      this.pos.x = width;
      this.vec.x *= -1;
    }

    for(var i=0; i<lines.length; i++){
      var hit = collideLineLine(this.pospast.x, this.pospast.y, this.pos.x, this.pos.y, lines[i].start.x, lines[i].start.y, lines[i].finish.x, lines[i].finish.y, true);
      if(hit.x){
        var incidence = p5.Vector.mult(this.vec, -1);
        var dot = incidence.dot(lines[i].normal);
        this.vec.set(2*lines[i].normal.x*dot - incidence.x, 2*lines[i].normal.y*dot - incidence.y, 0);
        this.pos.add(this.vec);
      }
    }
  }
}




function Line(start, finish){
  this.start = start;
  this.finish = finish;
  this.baseDelta = p5.Vector.sub(finish, start).normalize();
  this.normal = createVector(-this.baseDelta.y, this.baseDelta.x);
}

Line.prototype = {
  constructor:Line,

  draw:function(){
    line(this.start.x, this.start.y, this.finish.x, this.finish.y);
  }
}
