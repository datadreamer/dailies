var wedgeCount = 20;  // number of wedges wide the pattern will be
var wedgeWidth, wedgeHeight;
var colorRed, colorYellow, colorWhite, colorBlack, colorGreen, colors;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  colorRed = color(255,20,0);
  colorYellow = color(255,235,0);
  colorWhite = color(255);
  colorBlack = color(0);
  colorGreen = color(0,200,200);
  colors = [colorBlack, colorWhite, colorRed, colorBlack, colorWhite, colorYellow, colorRed, colorBlack, colorWhite, colorGreen, colorWhite, colorYellow, colorRed];
}

function draw(){
  background(255);
  fill(0);
  wedgeWidth = windowWidth/wedgeCount;
  wedgeHeight = wedgeWidth * 2;
  var colorIndex = 0;
  var colorIndexStart = 0;
  // start at the center of the screen
  // move horizontally in both directions
  // AND move vertically in both directions.
  push();
  var xoffset = 0;
  var yoffset = 0-wedgeHeight*8;//0-wedgeHeight*2;
  var yoffsetStart = yoffset;
  translate(windowWidth/2, windowHeight/2);
  while(xoffset >= 0-windowWidth/2){
    while(yoffset < windowHeight+wedgeHeight){
      drawWedge(xoffset, yoffset, false, false, colors[colorIndex]);
      drawWedge(xoffset, yoffset, true, false, colors[colorIndex]);
      drawWedge(xoffset, yoffset, false, true, colors[colorIndex]);
      drawWedge(xoffset, yoffset, true, true, colors[colorIndex]);
      yoffset += wedgeHeight*2;
      colorIndex++;
      if(colorIndex == colors.length){
        colorIndex = 0;
        colorIndexStart = 0;
      }
    }
    yoffsetStart += wedgeHeight;
    yoffset = yoffsetStart;
    xoffset -= wedgeWidth;
    colorIndexStart++;
    colorIndex = colorIndexStart;
  }
  pop();
}

function drawWedge(x, y, xmirror, ymirror, c){
  push();
  if(xmirror){
    scale(-1,1);
  }
  if(ymirror){
    scale(1,-1);
  }
  translate(x, y);
  fill(c);
  beginShape();
  vertex(0, 0);                         // upper right
  vertex(0, wedgeHeight*2);             // lower right
  vertex(0-wedgeWidth, wedgeHeight*3);  // lower left
  vertex(0-wedgeWidth, wedgeHeight);    // upper left
  endShape(CLOSE);
  pop();
}

function mouseDragged(){
  wedgeCount += (mouseY-pmouseY) * 0.1;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
