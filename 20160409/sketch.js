var xCount = 10;
var spacing;
var yCount;
var pipes = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  spacing = windowWidth / xCount;
  yCount = windowHeight / spacing;
  strokeWeight(spacing*0.2);
  strokeCap(SQUARE);
  stroke(255);
  rectMode(CENTER);
  noFill();
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*spacing + (spacing/2);
      var ypos = y*spacing + (spacing/2);
      pipes.push(new Pipe(xpos, ypos));
    }
  }
}

function draw(){
  background(0);
  for(var i=0; i<pipes.length; i++){
    pipes[i].draw();
  }
}

function mouseMoved(){
  for(var i=0; i<pipes.length; i++){
    if(pipes[i].isOver() && !pipes[i].rotating){
      pipes[i].rotate();
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Pipe(x, y){
  this.x = x;
  this.y = y;
  this.a = floor(random(3.999)) * HALF_PI;
  this.type = floor(random(3.999));
  this.rotating = false;
  this.rotateStart = millis();
  this.rotateDuration = 500;
  this.targeta = this.a;
  this.pasta = this.a;
}

Pipe.prototype = {
  constructor:Pipe,

  draw:function(){
    this.handleRotating();
    push();
    translate(this.x, this.y);
    strokeWeight(0.5);
    stroke(100);
    rect(0,0,spacing,spacing);
    rotate(this.a);
    stroke(255);
    strokeWeight(spacing*0.2);
    if(this.type == 0){
      this.drawStraight();
    } else if(this.type == 1){
      this.drawCross();
    } else if(this.type == 2){
      this.drawCurveLeft();
    } else if(this.type == 3){
      this.drawCurveRight();
    }
    pop();
  },

  drawStraight:function(){
    line(0-spacing/2, 0, spacing/2, 0);
  },

  drawCross:function(){
    line(0-spacing/2, 0, spacing/2, 0);
    line(0, 0-spacing/2, 0, spacing/2);
  },

  drawCurveLeft:function(){
    arc(spacing/2, spacing/2, spacing, spacing, PI, PI+HALF_PI);
  },

  drawCurveRight:function(){
    arc(0-spacing/2, spacing/2, spacing, spacing, PI+HALF_PI, TWO_PI);
  },

  isOver:function(){
    if(mouseX > this.x - spacing/2 && mouseX < this.x + spacing/2 && mouseY > this.y - spacing/2 && mouseY < this.y + spacing/2){
      return true;
    }
    return false;
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >= 1){
        this.rotating = false;
      } else {
        this.a = ((this.targeta - this.pasta) * this.sinProgress(p)) + this.pasta;
      }
    }
  },

  rotate:function(){
    this.rotating = true;
    this.rotateStart = millis();
    this.pasta = this.a;
    this.targeta += HALF_PI;
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
