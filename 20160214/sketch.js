var chevrons = [];
var chevronCount = 10;
var chevronHeight, chevronWidth;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  rectMode(CENTER);
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(32);
}

function draw(){
  background(255);
  fill(0);
  chevronHeight = (windowHeight*2) / (chevronCount*2)
  chevronWidth = windowWidth / 2;
  push();
  translate(0, 0-windowHeight);
  for(var i=0; i<chevronCount; i++){
    drawChevron(windowWidth/2, i*(chevronHeight*2));
  }
  pop();
  var bgw = textWidth("NO WALLS");
  fill(255);
  rect(chevronWidth, windowHeight-25, bgw + 40, 50);
  fill(0);
  text("NO WALLS", chevronWidth, windowHeight-10);
}

function drawChevron(x, y){
  push();
  translate(x, y);
  beginShape();
  vertex(0,0);  // top corner
  vertex(chevronWidth, chevronWidth);
  vertex(chevronWidth, chevronWidth+chevronHeight);
  vertex(0,chevronHeight); // bottom bend
  vertex(0-chevronWidth, chevronWidth+chevronHeight);
  vertex(0-chevronWidth, chevronWidth);
  endShape(CLOSE);
  pop();
}

function mouseDragged(){
  chevronCount += (mouseY-pmouseY) * 0.1;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}