var segments = [];
var xCount = 15;
var yCount;
var boxSize;
var arcSize;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noFill();
  boxSize = windowWidth / xCount;
  arcSize = boxSize * 1.4;
  yCount = windowHeight / boxSize;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var type = floor(random(0,3.999));
      segments.push(new Segment(x*boxSize + boxSize/2, y*boxSize + boxSize/2, type));
    }
  }
}

function draw(){
  background(255);
  // draw grid
  strokeWeight(1);
  stroke(250);
  for(var y=0; y<yCount; y++){
    line(0, int(y*boxSize), windowWidth, int(y*boxSize));
  }
  for(var x=0; x<xCount; x++){
    line(int(x*boxSize), 0, int(x*boxSize), windowHeight);
  }
  // draw segments
  for(var i=0; i<segments.length; i++){
    segments[i].draw();
  }
}

function mousePressed(){
  for(var i=0; i<segments.length; i++){
    segments[i].rotate(random(500,2000));
  }
}

// function mouseDragged(){
//   for(var i=0; i<segments.length; i++){
//     segments[i].a = (mouseY / windowHeight) * TWO_PI;
//   }
// }

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Segment(x, y, type){
  this.x = x;
  this.y = y;
  this.type = type;
  this.a = 0;
  this.rotating = false;
  this.rotateStart = millis();
  this.rotateDuration = 1000;
  this.targeta = this.a;
  this.pasta = this.a;
}

Segment.prototype = {
  constructor:Segment,

  draw:function(){
    this.handleRotating();
    push();
    translate(this.x, this.y);
    rotate(this.a);
    if(this.type == 0){
      stroke(0);
      line(0, -boxSize/2, 0, boxSize/2);
    } else if(this.type == 1){
      stroke(255,245,0);
      line(-boxSize/2, 0, boxSize/2, 0);
    } else if(this.type == 2){
      stroke(0,0,255);
      line(-boxSize/2, -boxSize/2, boxSize/2, boxSize/2);
    } else {
      stroke(255,0,0);
      line(boxSize/2, -boxSize/2, -boxSize/2, boxSize/2);
    }
    pop();
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >= 1){
        this.rotating = false;
        this.a = this.targeta;
      } else {
        this.a = ((this.targeta - this.pasta) * this.sinProgress(p) ) + this.pasta;
      }
    }
  },

  rotate:function(rotateDuration){
    this.rotateDuration = rotateDuration;
    this.targeta = this.targeta + HALF_PI;
    this.pasta = this.a;
    this.rotating = true;
    this.rotateStart = millis();
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
