var wedges = [];
var wedgeCount = 40;  // number of wedges wide the pattern will be
var wedgeWidth, wedgeHeight;
var colorRed, colorYellow, colorWhite, colorBlack, colorGreen, colors;
var colorIndexOffset = 0;
var colorSpeed = 0.01;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  colorRed = color(255,20,0);
  colorYellow = color(255,235,0);
  colorWhite = color(255,255,255);
  colorBlack = color(0,0,0);
  colorGreen = color(0,200,200);
  colors = [colorBlack, colorWhite, colorRed, colorBlack, colorWhite, colorYellow, colorRed, colorBlack, colorWhite, colorGreen, colorWhite, colorYellow, colorRed];

  wedgeWidth = windowWidth/wedgeCount;
  wedgeHeight = wedgeWidth * 2;
  var colorIndexStart = colorIndexOffset;
  var colorIndex = colorIndexStart;
  var xoffset = 0;
  var yoffset = 0-wedgeHeight*2;
  var yoffsetStart = yoffset;
  while(xoffset >= 0-windowWidth/2){
    while(yoffset < windowHeight+wedgeHeight){
      wedges.push(new Wedge(xoffset, yoffset, colorIndex));
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

}

function draw(){
  background(255);
  wedgeWidth = windowWidth/wedgeCount;
  wedgeHeight = wedgeWidth * 2;
  push();
  translate(windowWidth/2, windowHeight/2);
  for(var i=0; i<wedges.length; i++){
    wedges[i].draw();
  }
  pop();
}

function getColor(pos){
  // returns a value from the palette
  if(pos % 1 === 0){
    return colors[pos];
  }
  var bottom = floor(pos);
  var top = ceil(pos);
  if(top >= colors.length){
    top = 0;
  }
  var diff = pos - bottom;
  var newr = ((red(colors[top]) - red(colors[bottom])) * diff) + red(colors[bottom]);
  var newg = ((green(colors[top]) - green(colors[bottom])) * diff) + green(colors[bottom]);
  var newb = ((blue(colors[top]) - blue(colors[bottom])) * diff) + blue(colors[bottom]);
  //console.log(newr);
  //noLoop();
  //return lerpColor(colors[bottom], colors[top], diff);
  return color(newr, newg, newb);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Wedge(x, y, ci){
  this.x = x;
  this.y = y;
  this.ci = ci;
}

Wedge.prototype = {
  constructor:Wedge,

  draw:function(){
    this.drawWedge(this.x, this.y, false, false, colors[this.ci]);
    this.drawWedge(this.x, this.y, true, false, colors[this.ci]);
    this.drawWedge(this.x, this.y, false, true, colors[this.ci]);
    this.drawWedge(this.x, this.y, true, true, colors[this.ci]);
    this.ci += colorSpeed;
    if(this.ci >= colors.length){
      this.ci = 0;
    }
  },

  drawWedge:function(x, y, xmirror, ymirror, c){
    push();
    if(xmirror){
      scale(-1,1);
    }
    if(ymirror){
      scale(1,-1);
    }
    translate(int(x)+0.5, int(y)+0.5);
    //fill(c);
    fill(getColor(this.ci));
    beginShape();
    vertex(0, 0);                         // upper right
    vertex(0, wedgeHeight*2);             // lower right
    vertex(0-wedgeWidth, wedgeHeight*3);  // lower left
    vertex(0-wedgeWidth, wedgeHeight);    // upper left
    endShape(CLOSE);
    pop();
  }
}
