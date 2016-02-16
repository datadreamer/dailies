var wedgeCount = 40;  // number of wedges wide the pattern will be
var wedgeWidth, wedgeHeight;
var colorRed, colorYellow, colorWhite, colorBlack, colorGreen, colors;
var colorIndexOffset = 0;

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
  var colorIndexStart = colorIndexOffset;
  var colorIndex = colorIndexStart;
  // start at the center of the screen
  // move horizontally in both directions
  // AND move vertically in both directions.
  push();
  var xoffset = 0;
  var yoffset = 0-wedgeHeight*2;
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
      if(colorIndex >= colors.length){
        colorIndex = 0;
      }
    }
    // move outward from the middle
    xoffset -= wedgeWidth;
    // adjust the color index
    colorIndexStart++;
    if(colorIndexStart >= colors.length){
      colorIndexStart = 0;
    }
    colorIndex = colorIndexStart;
    // adjust yoffset to get wedges to line up in 3:1 ratio.
    yoffsetStart += wedgeHeight;
    yoffset = yoffsetStart;
    // reset yoffset to prevent drawing off screen
    if(yoffsetStart >= 0){
      yoffset = 0-wedgeHeight*2;
      yoffsetStart = yoffset;
      colorIndexStart--;
      colorIndex = colorIndexStart;
    }
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
  translate(int(x)+0.5, int(y)+0.5);
  fill(c);
  beginShape();
  vertex(0, 0);                         // upper right
  vertex(0, wedgeHeight*2);             // lower right
  vertex(0-wedgeWidth, wedgeHeight*3);  // lower left
  vertex(0-wedgeWidth, wedgeHeight);    // upper left
  endShape(CLOSE);
  pop();
}

// function mousePressed(){
//   colorIndexOffset++;
// }

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
