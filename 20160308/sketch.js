var lines = [];
var masterLine;
var currentLine;
var recording = false;
var yspacing = 10;
var ynoise = 1;
var xnoise = 1;
var colorNum = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(2);
  noFill();
  masterLine = new MasterLine();
  background(255);
}

function draw(){
  background(255);
  masterLine.draw();
  for(var n=0; n<lines.length; n++){
    lines[n].draw();
  }
  if(currentLine != null && !currentLine.animating){
    var c = color(0);
    if(colorNum == 0){
      c = color(255,0,0);
    } else if(colorNum == 1){
      c = color(255,245,0);
    } else {
      c = color(0,0,255);
    }
    colorNum++;
    if(colorNum > 2){
      colorNum = 0;
    }
    console.log("new line");
    var newLine = new CopyLine(currentLine, c);
    lines.push(newLine);
    currentLine = newLine;
  }
}

function mouseDragged(){
  // record line points from cursor
  if(recording){
    masterLine.points.push(createVector(mouseX, mouseY));
  }
}

function mousePressed(){
  // start recording the master line
  masterLine = new MasterLine();
  lines = [];
  recording = true;
}

function mouseReleased(){
  // stop recording the master line
  recording = false;
  masterLine.points.push(createVector(mouseX, mouseY));
  currentLine = new CopyLine(masterLine, color(255,0,0));
  lines.push(currentLine);
  colorNum++;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function MasterLine(){
  this.points = [];
  this.c = color(0);
}

MasterLine.prototype = {
  constructor:MasterLine,

  draw:function(){
    stroke(this.c);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
  }
}




function CopyLine(parentLine, c){
  this.parentLine = parentLine;
  this.c = c;
  this.points = [];
  this.animating = true;
}

CopyLine.prototype = {
  constructor:CopyLine,

  draw:function(){
    // draw the line
    stroke(this.c);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
    // animate the line
    if(this.animating){
      // create a new point
      // TODO: try to grab a perpindicular vector from parent line angle
      var newx = this.parentLine.points[this.points.length].x + random(0-xnoise,xnoise);
      var newy = this.parentLine.points[this.points.length].y + yspacing + random(0-ynoise,ynoise);
      this.points.push(createVector(newx, newy));
      if(this.points.length == this.parentLine.points.length){
        this.animating = false;
      }
    }
  }
}
