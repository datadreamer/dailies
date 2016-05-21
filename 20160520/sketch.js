var rings = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  //fill(255,32);
  rings.push(new Ring(100, 20, color(255,0,0,64)));
  rings.push(new Ring(150, 30, color(255,128,0,64)));
  rings.push(new Ring(200, 40, color(255,255,0,64)));
  rings.push(new Ring(250, 50, color(128,255,0,64)));
  rings.push(new Ring(300, 60, color(0,255,128,64)));
  rings.push(new Ring(350, 70, color(0,255,255,64)));
}

function draw(){
  blendMode(NORMAL);
  background(0);
  blendMode(SCREEN);
  for(var i=0; i<rings.length; i++){
    rings[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}



function Ring(radius, numChunks, c){
  this.chunks = [];
  this.c = c;
  this.v1 = createVector(random(-1),random(-1));
  this.v2 = createVector(random(1),random(-1));
  this.v3 = createVector(random(1),random(1));
  this.v4 = createVector(random(-1),random(1));
  this.pv1 = this.v1.copy();
  this.pv2 = this.v2.copy();
  this.pv3 = this.v3.copy();
  this.pv4 = this.v4.copy();
  this.tv1 = createVector(random(-1),random(-1));
  this.tv2 = createVector(random(1),random(-1));
  this.tv3 = createVector(random(1),random(1));
  this.tv4 = createVector(random(-1),random(1));
  this.morphing = true;
  this.morphingStart = millis();
  this.morphingDuration = random(1000,2000);
  this.rotation = random(TWO_PI);
  this.rotationTarget = random(TWO_PI);
  this.rotationPast = this.rotation;
  this.rotating = true;
  this.rotatingStart = millis();
  this.rotatingDuration = random(10000,20000);
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
    this.handleMorphing();
    this.handleRotating();
    push();
    translate(windowWidth/2, windowHeight/2);
    rotate(this.rotation);
    fill(this.c);
    for(var i=0; i<this.chunks.length; i++){
      this.chunks[i].draw();
    }
    pop();
  },

  handleMorphing:function(){
    if(this.morphing){
      var p = (millis() - this.morphingStart) / this.morphingDuration;
      if(p >= 1){
        this.v1.x = this.tv1.x;
        this.v1.y = this.tv1.y;
        this.v2.x = this.tv2.x;
        this.v2.y = this.tv2.y;
        this.v3.x = this.tv3.x;
        this.v3.y = this.tv3.y;
        this.v4.x = this.tv4.x;
        this.v4.y = this.tv4.y;
        this.pv1.x = this.v1.x;
        this.pv1.y = this.v1.y;
        this.pv2.x = this.v2.x;
        this.pv2.y = this.v2.y;
        this.pv3.x = this.v3.x;
        this.pv3.y = this.v3.y;
        this.pv4.x = this.v4.x;
        this.pv4.y = this.v4.y;
        this.tv1.x = random(-1);
        this.tv1.y = random(-1);
        this.tv2.x = random(1);
        this.tv2.y = random(-1);
        this.tv3.x = random(1);
        this.tv3.y = random(1);
        this.tv4.x = random(-1);
        this.tv4.y = random(1);
        this.morphingDuration = random(1000,2000);
        this.morphingStart = millis();
      } else {
        this.v1.x = ((this.tv1.x - this.pv1.x) * this.sinProgress(p)) + this.pv1.x;
        this.v1.y = ((this.tv1.y - this.pv1.y) * this.sinProgress(p)) + this.pv1.y;
        this.v2.x = ((this.tv2.x - this.pv2.x) * this.sinProgress(p)) + this.pv2.x;
        this.v2.y = ((this.tv2.y - this.pv2.y) * this.sinProgress(p)) + this.pv2.y;
        this.v3.x = ((this.tv3.x - this.pv3.x) * this.sinProgress(p)) + this.pv3.x;
        this.v3.y = ((this.tv3.y - this.pv3.y) * this.sinProgress(p)) + this.pv3.y;
        this.v4.x = ((this.tv4.x - this.pv4.x) * this.sinProgress(p)) + this.pv4.x;
        this.v4.y = ((this.tv4.y - this.pv4.y) * this.sinProgress(p)) + this.pv4.y;
      }
    }
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotatingStart) / this.rotatingDuration;
      if(p >= 1){
        for(var i=0; i<this.chunks.length; i++){
          this.chunks[i].rotation = this.rotationTarget;
        }
        this.rotation = this.rotationTarget;
        this.rotationPast = this.rotation;
        this.rotationTarget = random(TWO_PI);
        this.rotatingDuration = random(10000,20000);
        this.rotatingStart = millis();
      } else {
        this.rotation = ((this.rotationTarget - this.rotationPast) * this.sinProgress(p)) + this.rotationPast;
        for(var i=0; i<this.chunks.length; i++){
          this.chunks[i].rotation = this.rotation;
        }
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}

function RingChunk(pos, a, v1, v2, v3, v4, size){
  this.pos = pos;
  this.a = a;
  this.rotation = 0;
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
    rotate(this.a + this.rotation);
    beginShape();
    vertex(this.v1.x * this.size, this.v1.y * this.size);
    vertex(this.v2.x * this.size, this.v2.y * this.size);
    vertex(this.v3.x * this.size, this.v3.y * this.size);
    vertex(this.v4.x * this.size, this.v4.y * this.size);
    endShape(CLOSE);
    pop();
  }
}
