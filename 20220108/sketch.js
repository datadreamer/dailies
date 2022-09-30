// Genuary 2022, January 8
// A Single Curve

var lineWeight = 40;
var xspacing = lineWeight * 4;
var yspacing = lineWeight * 2;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  background(255);
  strokeWeight(lineWeight);
  noLoop();
}

function draw(){
  beginShape();
  var xpos = xspacing;
  var ypos = -200;
  var left = true;
  curveVertex(xpos, -100);
  curveVertex(xpos, ypos);
  ypos += yspacing;
  while(ypos < height+yspacing){
    curveVertex(xpos, ypos);
    xpos = width - xspacing;
    curveVertex(xpos, ypos);
    ypos += yspacing;
    curveVertex(xpos, ypos);
    xpos = xspacing;
    curveVertex(xpos, ypos);
    ypos += yspacing;
  }
  endShape();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
