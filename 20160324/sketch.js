var pointers = [];
var forceField;
var xCount = 20;
var yCount;
var spacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  stroke(255);
  strokeWeight(2);
  noFill();
  ellipseMode(CENTER);
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var pos = createVector(x*spacing, y*spacing);
      pointers.push(new Pointer(pos, spacing));
    }
  }
  forceField = new ForceField(createVector(windowWidth/2, windowHeight/2), windowWidth/4);
}

function draw(){
  background(0);
  push();
  translate(spacing/2, spacing/2);
  forceField.move();
  for(var i=0; i<pointers.length; i++){
    pointers[i].draw();
  }
  pop();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Pointer(pos, d){
  this.pos = pos;
  this.d = d;
  this.r = this.d/2;
  this.a = 0;
}

Pointer.prototype = {
  constructor:Pointer,

  draw:function(){
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.a);
    line(0-this.r, 0, this.r, 0);
    pop();
  }
}





function ForceField(pos, d){
  this.pos = pos;
  this.vec = createVector(random(-5,5), random(-5,5));
  this.d = d;
}

ForceField.prototype = {
  constructor:ForceField,

  move:function(){
    this.pos.add(this.vec);
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
    // rotate the pointers
    for(var i=0; i<pointers.length; i++){
      var xdiff = this.pos.x - pointers[i].pos.x;
      var ydiff = this.pos.y - pointers[i].pos.y;
      var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
      // stroke(255);
      // ellipse(this.pos.x, this.pos.y, this.d*2, this.d*2);
      // ellipse(this.pos.x, this.pos.y, 2, 2);
      if(hypo < this.d){
        var norm = 1 - (hypo / this.d);
        // get current angle of pointer
        // get angle from pointer to forceField
        //var angle = p5.Vector.angleBetween(pointers[i].pos, this.pos);
        var angle = 0 - atan2(this.pos.x - pointers[i].pos.x, this.pos.y - pointers[i].pos.y) + HALF_PI;
        // move pointer angle to difference * inverse norm value;
        pointers[i].a += (angle - pointers[i].a) * norm * 0.01;
      }
    }
  }
}
