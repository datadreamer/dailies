var frameRecordCount = 180;
var lineLength = 0;
var a = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  background(0);
  lineLength = sqrt(windowWidth*windowWidth + windowHeight*windowHeight);
}

function draw(){
  blendMode(ADD);
  stroke(255, 255, 255, 16);
  push();
  translate(mouseX, mouseY);
  rotate(a);
  line(0-lineLength, 0, lineLength, 0);
  pop();
  a += 0.005;
  if(a > TWO_PI){
    a = 0;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
