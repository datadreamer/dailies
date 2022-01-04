// Genuary 2022, January 3
// Space

var block;
var pg;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  block = new Block();
  rectMode(CENTER);
  pg = createGraphics(width, height);
  noStroke();
}

function draw(){
  background(0);
  image(pg, 0, 0);
  block.draw();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}



class Block{
  constructor(){
    this.pos = createVector(random()*width, random()*height);
    this.pastpos;
    this.vec = createVector();
    this.damping = 0.97;
    this.size = 50;
    this.halfSize = this.size/2;
    this.threshold = width/4;
  }

  draw(){
    this.pastpos = this.pos.copy();
    var mousePos = createVector(mouseX, mouseY);
    var dist = this.pos.dist(mousePos);
    if(dist < this.threshold){
      var force = this.threshold - dist;
      var xdiff = this.pos.x - mousePos.x;
      var ydiff = this.pos.y - mousePos.y;
      this.vec.x += xdiff * force * 0.0001;
      this.vec.y += ydiff * force * 0.0001;
    }
    this.pos.add(this.vec);
    this.vec.mult(this.damping);


    if(this.pos.x < this.halfSize){
      this.pos.x = this.halfSize;
    } else if(this.pos.x > width-this.halfSize){
      this.pos.x = width-this.halfSize;
    }

    if(this.pos.y < this.halfSize){
      this.pos.y = this.halfSize;
    } else if(this.pos.y > height-this.halfSize){
      this.pos.y = height-this.halfSize;
    }

    //console.log(this.vec.mag());
    pg.stroke(255, this.vec.mag() * 10);
    pg.line(this.pos.x, this.pos.y, this.pastpos.x, this.pastpos.y);

    square(this.pos.x, this.pos.y, this.size);
  }
}
