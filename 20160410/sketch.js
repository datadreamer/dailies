var xCount = 10;
var spacing;
var yCount;
var pipes = [];
var specialPipeNum;
var starterPipe;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  spacing = windowWidth / xCount;
  yCount = floor(windowHeight / spacing);
  specialPipeNum = int(((yCount/2) * xCount) + (xCount/2));
  strokeWeight(spacing*0.2);
  strokeCap(SQUARE);
  stroke(255);
  rectMode(CENTER);
  noFill();
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*spacing + (spacing/2);
      var ypos = y*spacing + (spacing/2);
      var starter = false;
      var p;
      if(pipes.length == specialPipeNum-1){
        starter = true;
        starterPipe = new StarterPipe(xpos, ypos, x, y)
        p = starterPipe;
      } else {
        var r = floor(random(3.999));
        if(r == 0){
          p = new StraightPipe(xpos, ypos, x, y);
        } else if(r == 1){
          p = new CrossPipe(xpos, ypos, x, y);
        } else if(r == 2){
          p = new CurveLeftPipe(xpos, ypos, x, y);
        } else {
          p = new CurveRightPipe(xpos, ypos, x, y);
        }
      }
      pipes.push(p);
    }
  }
}

function draw(){
  background(0);
  strokeWeight(1);
  stroke(50);
  // draw grid
  for(var y=0; y<=yCount; y++){
    line(0,y*spacing,windowWidth,y*spacing);
  }
  for(var x=0; x<=xCount;x++){
    line(x*spacing,0,x*spacing,yCount*spacing);
  }
  // draw pipes
  strokeWeight(spacing*0.2);
  for(var i=0; i<pipes.length; i++){
    pipes[i].draw();
  }
}

function keyPressed(){
  starterPipe.fillPipe(-1, -1);
}

function mousePressed(){
  for(var i=0; i<pipes.length; i++){
    if(pipes[i].isOver()){
      pipes[i].rotate();
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Pipe(x, y, xnum, ynum){
  this.x = x;
  this.y = y;
  this.xnum = xnum;
  this.ynum = ynum;
  this.starter = false;
  this.a = floor(random(3.999)) * HALF_PI;
  this.type = floor(random(3.999));
  this.rotating = false;
  this.rotateStart = millis();
  this.rotateDuration = 500;
  this.filling = false;
  this.fillStart = millis();
  this.fillDuration = 500;
  this.filled = false;
  this.fillStartPos = 0;
  this.fillEndPos = 0;
  this.fillCurrentEndPos = 0;
  this.fillProgress = 0;
  this.targeta = this.a;
  this.pasta = this.a;
}

Pipe.prototype = {
  constructor:Pipe,

  draw:function(){
    this.handleRotating();
    this.handleFilling();
  },

  isOver:function(){
    if(mouseX > this.x - spacing/2 && mouseX < this.x + spacing/2 && mouseY > this.y - spacing/2 && mouseY < this.y + spacing/2){
      return true;
    }
    return false;
  },

  handleFilling:function(){
    if(this.filling){
      var p = (millis() - this.fillStart) / this.fillDuration;
      if(p >= 1){
        this.filling = false;
        this.filled = true;
        this.nextPipe();
      } else {
        // animate the fill
      }
    }
  },

  handleRotating:function(){
    if(this.rotating){
      var p = (millis() - this.rotateStart) / this.rotateDuration;
      if(p >= 1){
        if(this.targeta >= TWO_PI){
          this.targeta = this.targeta % TWO_PI;
        }
        this.a = this.targeta;
        this.rotating = false;
      } else {
        this.a = ((this.targeta - this.pasta) * this.sinProgress(p)) + this.pasta;
      }
    }
  },

  nextPipe:function(){
    var nextx, nexty;
    if(this.a == 0){              // to the right
      nextx = this.xnum + 1;
      nexty = this.ynum;
    } else if(this.a >= QUARTER_PI && this.a < HALF_PI+QUARTER_PI){ // to the bottom
      nextx = this.xnum;
      nexty = this.ynum + 1;
    } else if(this.a >= HALF_PI+QUARTER_PI && this.a < PI+QUARTER_PI){      // to the left
      nextx = this.xnum - 1;
      nexty = this.ynum;
    } else {                      // to the top
      nextx = this.xnum;
      nexty = this.ynum - 1;
    }
    var i = nexty * xCount + nextx;
    pipes[i].fillPipe(this.xnum, this.ynum);
  },

  fillPipe:function(neighborXnum, neighborYnum){
    this.fillStart = millis();
    this.filling = true;
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









function StarterPipe(x, y, xnum, ynum){
  Pipe.call(this, x, y, xnum, ynum);
  this.fillStartPos = 0;
  this.fillEndPos = spacing/2;
}

StarterPipe.prototype = Object.create(Pipe.prototype);
StarterPipe.prototype.constructor = Pipe;
StarterPipe.prototype.draw = function(){
  this.handleRotating();
  this.handleFilling();
  push();
  translate(this.x, this.y);
  rotate(this.a);
  stroke(255);
  fill(255);
  line(0, 0, spacing/2, 0);
  ellipse(0, 0, spacing/4, spacing/4);
  if(this.filling || this.filled){
    stroke(255,0,0);
    //fill(255,0,0);
    line(0, 0, this.fillProgress * this.fillEndPos, 0);
  }
  pop();
}
StarterPipe.prototype.handleFilling = function(){
  if(this.filling){
    this.fillProgress = (millis() - this.fillStart) / this.fillDuration;
    if(this.fillProgress >= 1){
      this.filling = false;
      this.filled = true;
      this.fillProgress = 1;
      this.nextPipe();
    }
  }
}




function StraightPipe(x, y, xnum, ynum){
  Pipe.call(this, x, y, xnum, ynum);
  // TODO: check direction
  this.fillStartPos = 0-spacing/2;
  this.fillEndPos = spacing/2;
}

StraightPipe.prototype = Object.create(Pipe.prototype);
StraightPipe.prototype.constructor = Pipe;
StraightPipe.prototype.draw = function(){
  this.handleRotating();
  this.handleFilling();
  push();
  translate(this.x, this.y);
  rotate(this.a);
  stroke(255);
  line(0-spacing/2, 0, spacing/2, 0);
  if(this.filling || this.filled){
    stroke(255,0,0);
    line(this.fillStartPos, 0, this.fillCurrentEndPos, 0);
  }
  pop();
}
StraightPipe.prototype.handleFilling = function(){
  if(this.filling){
    this.fillProgress = (millis() - this.fillStart) / this.fillDuration;
    if(this.fillProgress >= 1){
      this.filling = false;
      this.filled = true;
      this.fillProgress = 1;
      this.fillCurrentEndPos = this.fillEndPos;
      this.nextPipe();
    } else {
      this.fillCurrentEndPos = ((this.fillEndPos - this.fillStartPos) * this.fillProgress) + this.fillStartPos
    }
  }
}






function CrossPipe(x, y, xnum, ynum){
  Pipe.call(this, x, y, xnum, ynum);
  // TODO: somehow check for two fucking possible fills
  this.fillStartPos = 0-spacing/2;
  this.fillEndPos = spacing/2;
}

CrossPipe.prototype = Object.create(Pipe.prototype);
CrossPipe.prototype.constructor = Pipe;
CrossPipe.prototype.draw = function(){
  this.handleRotating();
  this.handleFilling();
  push();
  translate(this.x, this.y);
  rotate(this.a);
  stroke(255);
  line(0-spacing/2, 0, spacing/2, 0);
  line(0, 0-spacing/2, 0, spacing/2);
  if(this.filling || this.filled){
    // TODO: somehow check for two fucking possible fills
    stroke(255,0,0);
    line(this.fillStartPos, 0, this.fillCurrentEndPos, 0);
  }
  pop();
}
CrossPipe.prototype.handleFilling = function(){
  if(this.filling){
    this.fillProgress = (millis() - this.fillStart) / this.fillDuration;
    if(this.fillProgress >= 1){
      this.filling = false;
      this.filled = true;
      this.fillProgress = 1;
      this.fillCurrentEndPos = this.fillEndPos;
      this.nextPipe();
    } else {
      this.fillCurrentEndPos = ((this.fillEndPos - this.fillStartPos) * this.fillProgress) + this.fillStartPos
    }
  }
}





function CurveLeftPipe(x, y, xnum, ynum){
  Pipe.call(this, x, y, xnum, ynum);
  this.fillStartPos = PI;
  this.fillEndPos = PI+HALF_PI;
}

CurveLeftPipe.prototype = Object.create(Pipe.prototype);
CurveLeftPipe.prototype.constructor = Pipe;
CurveLeftPipe.prototype.draw = function(){
  this.handleRotating();
  this.handleFilling();
  push();
  translate(this.x, this.y);
  rotate(this.a);
  stroke(255);
  arc(spacing/2, spacing/2, spacing, spacing, PI, PI+HALF_PI);
  if(this.filling || this.filled){
    stroke(255,0,0);
    arc(spacing/2, spacing/2, spacing, spacing, this.fillStartPos, this.fillCurrentEndPos);
  }
  pop();
}
CurveLeftPipe.prototype.handleFilling = function(){
  if(this.filling){
    this.fillProgress = (millis() - this.fillStart) / this.fillDuration;
    if(this.fillProgress >= 1){
      this.filling = false;
      this.filled = true;
      this.fillProgress = 1;
      this.fillCurrentEndPos = this.fillEndPos;
      this.nextPipe();
    } else {
      this.fillCurrentEndPos = ((this.fillEndPos - this.fillStartPos) * this.fillProgress) + this.fillStartPos
    }
  }
}





function CurveRightPipe(x, y, xnum, ynum){
  Pipe.call(this, x, y, xnum, ynum);
  this.fillStartPos = PI+HALF_PI;
  this.fillEndPos = TWO_PI;
}

CurveRightPipe.prototype = Object.create(Pipe.prototype);
CurveRightPipe.prototype.constructor = Pipe;
CurveRightPipe.prototype.draw = function(){
  this.handleRotating();
  this.handleFilling();
  push();
  translate(this.x, this.y);
  rotate(this.a);
  stroke(255);
  arc(0-spacing/2, spacing/2, spacing, spacing, PI+HALF_PI, TWO_PI);
  if(this.filling || this.filled){
    stroke(255,0,0);
    arc(0-spacing/2, spacing/2, spacing, spacing, this.fillStartPos, this.fillCurrentEndPos);
  }
  pop();
}
CurveRightPipe.prototype.handleFilling = function(){
  if(this.filling){
    this.fillProgress = (millis() - this.fillStart) / this.fillDuration;
    if(this.fillProgress >= 1){
      this.filling = false;
      this.filled = true;
      this.fillProgress = 1;
      this.fillCurrentEndPos = this.fillEndPos;
      this.nextPipe();
    } else {
      this.fillCurrentEndPos = ((this.fillEndPos - this.fillStartPos) * this.fillProgress) + this.fillStartPos
    }
  }
}
