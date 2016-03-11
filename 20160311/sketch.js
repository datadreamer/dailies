var circleSpacing;
var lineweight = 1;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noFill();
  stroke(0);
  ellipseMode(CENTER);
  circleSpacing = windowHeight / 40;
}

function draw(){
  background(255);
  strokeWeight(lineweight);
  var diameter = circleSpacing;

  // top
  push();
  translate(windowWidth/2, 0);
  while(diameter < windowHeight*2){
    stroke(diameter/(windowHeight*2) * 255, 0, 0);
    ellipse(0, 0, diameter, diameter);
    diameter += circleSpacing;
  }
  pop();

  // bottom
  diameter = circleSpacing;
  push();
  translate(windowWidth/2, windowHeight);
  while(diameter < windowHeight*2){
    stroke(0, 0, diameter/(windowHeight*2) * 255);
    ellipse(0, 0, diameter, diameter);
    diameter += circleSpacing;
  }
  pop();

}


function mouseDragged(){
  lineweight += (mouseX - pmouseX) * 0.01;
  if(lineweight < 0.25){
    lineweight = 0.25;
  }
  circleSpacing += (mouseY - pmouseY) * 0.1;
  if(circleSpacing < 2){
    circleSpacing = 2;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
