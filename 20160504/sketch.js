var marks = [];
var capture;
var xCount = 50;
var yCount;
var spacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  capture = createCapture(VIDEO);
  capture.size(640,480);
  noStroke();
  spacing = windowWidth / (xCount-0.999);
  yCount = windowHeight / spacing;
  for(var y=0; y<yCount; y++){
    var offset = 0;
    if(y % 2 == 1){
      offset = spacing/2;
    }
    for(var x=0; x<xCount; x++){
      var xpos = x*spacing + offset;
      var ypos = y*spacing;
      marks.push(new Mark(xpos, ypos));
    }
  }
  console.log(marks.length);
}

function draw(){
  //background(0);
  capture.loadPixels();
  for(var i=0; i<marks.length; i++){
    marks[i].draw();
  }
  //console.log(frameRate());
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}






function Mark(x, y){
  this.x = x;
  this.y = y;
  this.w = spacing/2;
  this.h = spacing;
  this.colorX = int((x / windowWidth) * capture.width);
  this.colorY = int((y / windowHeight) * capture.height);
  this.colorIndex = (this.colorY * (capture.width*4)) + (this.colorX * 4);
  //this.c = capture.get(this.colorX, this.colorY);
  this.r = capture.pixels[this.colorIndex];
  this.g = capture.pixels[this.colorIndex+1];
  this.b = capture.pixels[this.colorIndex+2];
}

Mark.prototype = {
  constructor: Mark,

  draw:function(){
    //this.c = capture.get(this.colorX, this.colorY);
    // this.r = capture.pixels[this.colorIndex];
    // this.g = capture.pixels[this.colorIndex+1];
    // this.b = capture.pixels[this.colorIndex+2];
    // var newr = capture.pixels[this.colorIndex];
    // var newg = capture.pixels[this.colorIndex+1];
    // var newb = capture.pixels[this.colorIndex+2];
    if(!isNaN(this.r) && !isNaN(this.g) && !isNaN(this.b)){
      this.r += ((capture.pixels[this.colorIndex] - this.r) * 0.1);
      this.g += ((capture.pixels[this.colorIndex+1] - this.g) * 0.1);
      this.b += ((capture.pixels[this.colorIndex+2] - this.b) * 0.1);
    } else {
      this.r = capture.pixels[this.colorIndex];
      this.g = capture.pixels[this.colorIndex+1];
      this.b = capture.pixels[this.colorIndex+2];
    }
    push();
    translate(this.x, this.y);
    fill(this.r, this.g, this.b);
    beginShape();
    vertex(0, -this.h);
    vertex(this.w, 0);
    vertex(0, this.h);
    vertex(-this.w, 0);
    endShape(CLOSE);
    pop();
  }
}
