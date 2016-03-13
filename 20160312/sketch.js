var xCount = 10;
var yCount;
var boxSize;
var boxes = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noFill();
  stroke(0);
  boxSize = windowWidth/xCount;
  yCount = windowHeight / boxSize;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x*boxSize;
      var ypos = y*boxSize;
      boxes.push(new Box(xpos, ypos));
    }
  }
}

function draw(){
  background(255);
  // draw grid
  for(var y=1; y<yCount; y++){
    line(0, int(y*boxSize), windowWidth, int(y*boxSize));
  }
  for(var x=1; x<xCount; x++){
    line(int(x*boxSize), 0, int(x*boxSize), windowHeight);
  }
  // draw boxes w/ wiggles
  for(var i=0; i<boxes.length; i++){
    boxes[i].draw();
  }
}

function mousePressed(){
  for(var i=0; i<boxes.length; i++){
    boxes[i].reset();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Box(x, y){
  this.x = x;
  this.y = y;
  this.wiggles = [];
  this.canvas = createGraphics(boxSize, boxSize);
  this.canvas.stroke(0);
  this.canvas.noFill();
  var wiggleCount = random(1, 8);
  var yspacing = boxSize/wiggleCount;
  for(var i=0; i<wiggleCount; i++){
    var ypos = (i*yspacing) + (yspacing/2);
    this.wiggles.push(new Wiggle(this.canvas, 0, ypos));
  }
}

Box.prototype = {
  constructor: Box,

  draw:function(){
    push();
    translate(this.x, this.y);
    for(var i=0; i<this.wiggles.length; i++){
      this.wiggles[i].draw();
    }
    image(this.canvas, 0, 0);
    pop();
  },

  reset:function(){
    this.canvas = createGraphics(boxSize, boxSize);
    this.canvas.stroke(0);
    this.canvas.noFill();
    var wiggleCount = random(1, 10);
    var yspacing = boxSize/wiggleCount;
    for(var i=0; i<wiggleCount; i++){
      var ypos = (i*yspacing) + (yspacing/2);
      this.wiggles.push(new Wiggle(this.canvas, 0, ypos));
    }
  }
}





function Wiggle(canvas, x, y){
  this.canvas = canvas;
  this.x = x;
  this.y = y;
  this.px = x;
  this.py = y;
  this.moveStart = millis();
  this.moveDuration = random(2000,5000);
  this.noiseForce = 0.5;
}

Wiggle.prototype = {
  constructor: Wiggle,

  draw:function(){
    this.handleMoving();
    // if(this.x < boxSize){
    //   this.x += 1;
    //   this.y += random(-1, 1);
    //   this.canvas.line(this.px, this.py, this.x, this.y);
    //   this.px = this.x;
    //   this.py = this.y;
    // }
  },

  handleMoving:function(){
    var p = (millis() - this.moveStart) / this.moveDuration;
    if(p <= 1){
      this.x = p * boxSize;
      this.y += random(-this.noiseForce, this.noiseForce);
      this.canvas.line(this.px, this.py, this.x, this.y);
      this.px = this.x;
      this.py = this.y;
    }
  }
}
