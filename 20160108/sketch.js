var bars = [];
var numBars = 20;
var numPoints = 50;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  var thickness = windowHeight / (numBars*2);
  strokeWeight(thickness);
  for(var i=0; i<numBars; i++){
    var ypos = i * thickness * 2;
    bars.push(new Bar(ypos, thickness));
  }
}

function draw(){
  // add noise to points
  for(var i=0; i<bars.length; i++){
    var p = Math.round(mouseX / (windowWidth / numPoints));
    for(var n=0; n<bars[i].points.length; n++){
      bars[i].points[n].y += random(-0.5, 0.5);
    }
  }
  background(255);
  fill(0);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}


function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function mouseDragged(){
  var ypush = (mouseY - pmouseY) * 0.1;
  for(var i=0; i<bars.length; i++){
    var p = Math.round(mouseX / (windowWidth / numPoints));
    bars[i].points[p].y += ypush;
    // for(var n=0; n<bars[i].points.length; n++){
    //   bars[i].points[n].y += ypush;
    // }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Bar(y, thickness){
  this.x = 0;
  this.y = y;
  this.points = [];
  var spacing = (windowWidth+20) / numPoints;
  for(var i=0; i<numPoints; i++){
    var xpos = i * spacing;
    this.points.push(new Point(xpos, 0));
  }
}

Bar.prototype = {
  constructor:Bar,

  draw:function(){
    push();
    translate(this.x, this.y);
    stroke(0);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
    pop();
  }
}

function Point(x, y){
  this.x = x;
  this.y = y;
}
