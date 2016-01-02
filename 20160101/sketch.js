var lineCount = 20;
var pixelcount = 0;
var touchpower = 5;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  pixelcount = windowWidth * windowHeight * 4; // RGBA
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  fill(0);
  drawBars();
}

function draw(){

}

function drawBars(){
  background(255);
  var lineWidth = windowHeight / (lineCount * 2);
  for(var i=0; i<lineCount; i++){
    var ypos = i * lineWidth*2;
    rect(0, ypos, windowWidth, lineWidth);
  }
}

function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function mouseDragged(){
  loadPixels();
  var offset = (mouseY - pmouseY) * 4 * windowWidth * touchpower;
  for(var y=0; y < windowHeight; y++){
    var index = (y * windowWidth * 4) + (mouseX * 4);
    var newindex = index+offset;
    if(newindex > pixelcount){
      newindex = newindex - pixelcount;
    }
    pixels[newindex] = pixels[index];      // r
    pixels[newindex+1] = pixels[index+1];  // g
    pixels[newindex+2] = pixels[index+2];  // b
    pixels[newindex+3] = pixels[index+3];  // a
  }
  updatePixels();
}

function touchMoved(){
  mouseDragged();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  drawBars();
}
