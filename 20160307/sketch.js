var curves = [];
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
      var r = random();
      var c = color(0);
      var a = 0;
      if(r < 0.25){
        c = color(255,254,0);
        a = HALF_PI;
      } else if(r > 0.25 && r < 0.5){
        c = color(255,0,0);
        a = PI;
      } else if(r > 0.5 && r < 0.75){
        c = color(0,0,255);
        a = PI + HALF_PI;
      } else {
        c = color(0);
        a = 0;
      }
      curves.push(new Curve(x*boxSize + boxSize/2, y*boxSize + boxSize/2, c, a));
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
  // draw curves
  for(var i=0; i<curves.length; i++){
    curves[i].draw();
  }
}

function mousePressed(){
  for(var i=0; i<curves.length; i++){
    if(!curves[i].rotating){
      curves[i].rotate(1000);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Curve(x, y, c, a){
  this.x = x;
  this.y = y;
  this.c = c;
  this.a = a;
  this.rotating = false;
  this.rotateStart = millis();
  this.rotateDuration = 1000;
  this.targeta;
  this.pasta;
}

Curve.prototype = {
  constructor:Curve,

  draw:function(){
    this.handleRotating();
    stroke(0);
    push();
    translate(this.x, this.y);
    rotate(this.a);
    translate(0,0-boxSize/2);
    rotate(0-QUARTER_PI);
    stroke(this.c);
    translate(0-arcSize/2,0);
    arc(0, 0, arcSize, arcSize, 0, HALF_PI);
    pop();
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >= 1){
        this.rotating = false;
      } else {
        this.a = ((this.targeta - this.pasta) * this.sinProgress(p) ) + this.pasta;
      }
    }
  },

  rotate:function(rotateDuration){
    this.rotateDuration = rotateDuration;
    this.targeta = this.a + HALF_PI;
    this.pasta = this.a;
    this.rotating = true;
    this.rotateStart = millis();
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
