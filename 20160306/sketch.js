var lineSpacing;
var divisionWidth;
var lineCount = 5;
var combos = [
  [true,false,false,false],
  [false,true,false,false],
  [false,false,true,false],
  [false,false,false,true],
  [true,true,false,false],
  [true,false,true,false],
  [true,false,false,true],
  [false,true,true,false],
  [false,true,false,true],
  [false,false,true,true],
  [true,true,true,false],
  [true,true,false,true],
  [true,false,true,true],
  [false,true,true,true],
  [true,true,true,true]
];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(2);
}

function draw(){
  divisionWidth = windowWidth/combos.length;
  lineSpacing = divisionWidth/lineCount;
  background(255);
  for(var i=0; i<combos.length; i++){
    push();
    translate(divisionWidth * i,0);
    if(combos[i][0]){
      drawOne();
    }
    if(combos[i][1]){
      drawTwo();
    }
    if(combos[i][2]){
      drawThree();
    }
    if(combos[i][3]){
      drawFour();
    }
    pop();
  }
}

function drawOne(){
  // draw vertical black lines
  var xpos = 0;
  stroke(0);
  while(xpos < divisionWidth){
    line(xpos,0,xpos,windowHeight);
    xpos += lineSpacing;
  }
}

function drawTwo(){
  // draw horizontal yellow lines
  var ypos = 0;
  stroke(255,245,0);
  while(ypos < windowHeight){
    line(0,ypos,divisionWidth,ypos);
    ypos += lineSpacing;
  }
}

function drawThree(){
  // draw diagonal (upper right to lower left) red lines
  var ypos = 0-divisionWidth;
  stroke(255,0,0);
  while(ypos < windowHeight + divisionWidth){
    line(0,ypos+divisionWidth,divisionWidth,ypos);
    ypos += lineSpacing;
  }
}

function drawFour(){
  // draw diagonal (upper left to lower right) blue lines
  var ypos = 0-divisionWidth;
  stroke(0,0,255);
  while(ypos < windowHeight + divisionWidth){
    line(0,ypos,divisionWidth,ypos+divisionWidth);
    ypos += lineSpacing;
  }
}

function mouseDragged(){
  lineCount += (mouseY - pmouseY) * 0.01;
  if(lineCount < 2){
    lineCount = 2;
  } else if(lineCount > 20){
    lineCount = 20;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
