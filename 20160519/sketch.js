var rings = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  fill(255,32);
  rings.push(new Ring(100, 20));
  rings.push(new Ring(150, 30));
  rings.push(new Ring(200, 40));
  rings.push(new Ring(250, 50));
  rings.push(new Ring(300, 60));
  rings.push(new Ring(350, 70));
}

function draw(){
  background(0);
  for(var i=0; i<rings.length; i++){
    push();
    translate(windowWidth/2, windowHeight/2);
    rings[i].draw();
    pop();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}



function Ring(radius, numChunks){
  this.chunks = [];
  this.v1 = createVector(random(-1,0),random(-1,0));
  this.v2 = createVector(random(0,1),random(-1,0));
  this.v3 = createVector(random(0,1),random(0,1));
  this.v4 = createVector(random(-1,0),random(0,1));
  var angle = TWO_PI / numChunks;
  var a = 0;
  var size = 50;
  for(var i=0; i<numChunks; i++){
    a += angle;
    var xpos = (radius * cos(a));
    var ypos = (radius * sin(a));
    var pos = createVector(xpos, ypos);
    var chunk = new RingChunk(pos, a, this.v1, this.v2, this.v3, this.v4, size);
    this.chunks.push(chunk);
  }
}

Ring.prototype = {
  constructor:Ring,

  draw:function(){
    for(var i=0; i<this.chunks.length; i++){
      this.chunks[i].draw();
    }
  }
}

function RingChunk(pos, a, v1, v2, v3, v4, size){
  this.pos = pos;
  this.a = a;
  this.v1 = v1;
  this.v2 = v2;
  this.v3 = v3;
  this.v4 = v4;
  this.size = size;
}

RingChunk.prototype = {
  constructor:RingChunk,

  draw:function(){
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.a);
    beginShape();
    vertex(this.v1.x * this.size, this.v1.y * this.size);
    vertex(this.v2.x * this.size, this.v2.y * this.size);
    vertex(this.v3.x * this.size, this.v3.y * this.size);
    vertex(this.v4.x * this.size, this.v4.y * this.size);
    endShape(CLOSE);
    pop();
  }
}
