var parallelograms = [];
var xCount = 20;
var yCount;
var spacing, halfSpacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  fill(255);
  noStroke();
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  halfSpacing = spacing/2;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = int(x*spacing);
      var ypos = int(y*spacing);
      parallelograms.push(new Parallelogram(xpos, ypos, halfSpacing));
    }
  }
}

function draw(){
  background(0);
  push();
  translate(halfSpacing, halfSpacing);
  for(var i=0; i<parallelograms.length; i++){
    parallelograms[i].draw();
  }
  pop();
}

function mousePressed(){
  for(var i=0; i<parallelograms.length; i++){
    if(!parallelograms[i].rotating){
      parallelograms[i].rotate(random(500,2000));
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Parallelogram(x, y, s){
  this.x = x;
  this.y = y;
  this.s = s;
  this.a = 0;
  this.rotating = false;
  this.rotateStart = millis();
  this.rotateDuration = 1000;
  this.flip = false;
  if(random() > 0.5){
    this.flip = true;
  }

  var r = random();
  if(r >= 0.25 && r < 0.5){
    this.a = HALF_PI;
  } else if(r >= 0.5 && r < 0.75){
    this.a = PI;
  } else if(r >= 0.75){
    this.a = PI + HALF_PI;
  }
  this.targeta = this.a;
  this.pasta = this.a;
}

Parallelogram.prototype = {
  constructor:Parallelogram,

  draw:function(){
    this.handleRotating();
    push();
    translate(this.x, this.y)
    if(this.flip){
      scale(-1,1);
    }
    rotate(this.a);
    beginShape();
    vertex(0, 0-this.s);
    vertex(this.s, 0-this.s);
    vertex(0, this.s);
    vertex(0-this.s, this.s);
    endShape(CLOSE);
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
    var r = random(0.6);
    var newangle = 0;
    if(r < 0.1){
      newangle = 0 - (PI+HALF_PI);
    } else if(r >= 0.1 && r < 0.2){
      newangle = 0 - PI;
    } else if(r >= 0.2 && r < 0.3){
      newangle = 0 - HALF_PI;
    } else if(r >= 0.3 && r < 0.4){
      newangle = HALF_PI;
    } else if(r >= 0.4 && r < 0.5){
      newangle = PI;
    } else {
      newangle = PI + HALF_PI;
    }
    this.rotateDuration = rotateDuration;
    this.targeta = this.targeta + newangle;
    this.pasta = this.a;
    this.rotating = true;
    this.rotateStart = millis();
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
