var pointers = [];
var forceField;
var xCount = 20;
var yCount;
var spacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  strokeWeight(2);
  noFill();
  ellipseMode(CENTER);
  colorMode(HSB, 360);
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var pos = createVector(x*spacing + spacing/2, y*spacing + spacing/2);
      pointers.push(new Pointer(pos, spacing/2));
    }
  }
  forceField = new ForceField(createVector(windowWidth/2, windowHeight/2), windowWidth/2);
}

function draw(){
  background(0);
  forceField.move();
  for(var i=0; i<pointers.length; i++){
    pointers[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Pointer(pos, r){
  this.pos = pos;
  this.r = r;
  this.a = 0;
  this.c = color(255, 0);
}

Pointer.prototype = {
  constructor:Pointer,

  draw:function(){
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.a);
    stroke(this.c);
    line(0, 0, this.r, 0);
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
    this.pos.x = mouseX;
    this.pos.y = mouseY;
    // rotate the pointers
    for(var i=0; i<pointers.length; i++){
      var xdiff = this.pos.x - pointers[i].pos.x;
      var ydiff = this.pos.y - pointers[i].pos.y;
      var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
      if(hypo < this.d){
        var norm = 1 - (hypo / this.d);
        var angle = 0;
        if(mouseIsPressed){
          angle = 0-atan2(xdiff, ydiff) + PI+HALF_PI;
        } else {
          angle = 0-atan2(xdiff, ydiff) + HALF_PI;
        }
        var angleDiff = angle - pointers[i].a;
        // TODO: figure out how the fuck to rotate past TWO_PI
        var angleChange = angleDiff * norm * 0.1;
        pointers[i].a += angleChange;
        pointers[i].c = color(220-(abs(angleDiff)*50), (norm*360), 360);
        pointers[i].r = norm * (spacing/2);
      } else {
        pointers[i].c = color(0, 0, 105);
        pointers[i].a *= 0.97;
        pointers[i].r = 1;
      }
    }
  }
}
