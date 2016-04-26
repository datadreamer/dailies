var bouncers = [];
var lines = [];
var gravity = 0.1;
var releaseRate = 100;
var lastRelease = 0;
var startPos, finishPos;
var drawingLine = false;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  bouncers.push(new Bouncer(createVector(random(windowWidth), 0)));
  stroke(255);
}

function draw(){
  background(0);
  if(millis() - lastRelease > releaseRate){
    bouncers.push(new Bouncer(createVector(random(windowWidth), 0)));
    lastRelease = millis();
  }
  for(var i=bouncers.length-1; i>=0; i--){
    bouncers[i].checkCollisions();
    bouncers[i].draw();
    if(bouncers[i].dead){
      bouncers.splice(i,1);
    }
  }
  for(var i=lines.length-1; i>=0; i--){
    lines[i].draw();
    if(lines[i].dead){
      lines.splice(i,1);
    }
  }
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
  this.dead = false;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    push();
    translate(this.pos.x, this.pos.y);
    point(0, 0);
    pop();
  },

  checkCollisions:function(){
    this.pospast = this.pos.copy();
    this.pos.add(this.vec);
    this.vec.add(0,gravity);
    if(this.pos.y > height){
      this.dead = true;
    }

    for(var i=0; i<lines.length; i++){
      var hit = collideLineLine(this.pospast.x, this.pospast.y, this.pos.x, this.pos.y, lines[i].start.x, lines[i].start.y, lines[i].finish.x, lines[i].finish.y, true);
      if(hit.x){
        this.pos.x = hit.x;
        this.pos.y = hit.y;
        var ab = p5.Vector.angleBetween(this.vec, lines[i].vec);
        //console.log(ab);
        //console.log(lines[i].perpangle, ab);
        this.vec.rotate(lines[i].perpangle);
        //this.vec = createVector(0,0);
      }
    }
  }
}




function Line(start, finish){
  this.start = start;
  this.finish = finish;
  this.vec = p5.Vector.sub(start, finish);
  this.angle = this.vec.heading();
  this.perpangle = this.angle+HALF_PI;
  console.log(this.angle);
}

Line.prototype = {
  constructor:Line,

  draw:function(){
    stroke(255);
    line(this.start.x, this.start.y, this.finish.x, this.finish.y);
    // push();
    // translate(this.start.x, this.start.y);
    // stroke(255,0,0);
    // rotate(this.perpangle);
    // line(0,0,100,0);
    // pop();
  }
}
