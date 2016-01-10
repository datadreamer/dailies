var bars = [];
var numBars = 20;
var numPoints = 200;
var thickness = 0;
var wiggleroom = 0.1;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  thickness = windowHeight / (numBars*2);
  strokeWeight(thickness);
  for(var i=0; i<numBars; i++){
    var ypos = i * thickness * 2;
    bars.push(new Bar(ypos, thickness));
  }
  background(255);
  blendMode(MULTIPLY);
}

function draw(){
  // add noise to points
  for(var i=0; i<bars.length; i++){
    var p = Math.round(mouseX / (windowWidth / numPoints));
    for(var n=0; n<bars[i].points.length/2; n++){
      var m = (numPoints - n - 1) + numPoints;
      var wiggle = random(0-wiggleroom, wiggleroom);
      bars[i].points[n].y += wiggle;
      bars[i].points[m].y += wiggle;
    }
  }
  //background(255);
  var c = getColor((millis() * 0.01) % 255);
  fill(red(c), green(c), blue(c), 1);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}

function getColor(pos){
  // returns a value from the CMY spectrum
  var cyan = color(0, 174, 239);
  var magenta = color(236, 0, 140);
  var yellow = color(255, 242, 0);
  if(pos >= 0 && pos < 85){ // C to M
    return lerpColor(cyan, magenta, (pos / 85));
  } else if(pos >= 85 && pos < 170){  // M to Y
    return lerpColor(magenta, yellow, ((pos-85) / 85));
  } else {  // Y to C
    return lerpColor(yellow, cyan, ((pos-170) / 85));
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
    var index = mouseX / (windowWidth / numPoints);
    var index2 = (numPoints - index - 1) + numPoints;
    var p = Math.round(index);
    var q = Math.round(index2);
    bars[i].points[p].y += ypush;
    bars[i].points[q].y += ypush;
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
  for(i=numPoints-1; i>=0; i--){
    var xpos = i * spacing;
    this.points.push(new Point(xpos, thickness));
  }
}

Bar.prototype = {
  constructor:Bar,

  draw:function(){
    push();
    translate(this.x, this.y);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape(CLOSE);
    pop();
  }
}

function Point(x, y){
  this.x = x;
  this.y = y;
}
