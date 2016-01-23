var lines = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(3);
  // create diagonal lines
  var xpos = windowWidth;
  var ypos = windowHeight;
  var count = 1;
  while(ypos > 0-windowHeight){
    //ypos -= random(windowWidth/20, windowWidth/10);
    if(count % 3){
      ypos -= windowWidth/10;
    } else {
      ypos -= windowWidth/30;
    }
    var start = createVector(xpos, ypos);
    var end = createVector(0, ypos + windowHeight/2);
    lines.push(new Line(start, end));
    count++;
  }
  // create horizontal lines
  var xpos = 0;
  while(xpos < windowWidth){
    xpos += random(windowWidth/40, windowWidth/20);
    var starty = 0;
    var endy = windowHeight;
    if(xpos < windowWidth / 2){
      starty = windowHeight;
      endy = 0;
    }
    var start = createVector(xpos, starty);
    var end = createVector(xpos, endy);
    lines.push(new Line(start, end));
  }
}

function draw(){
  background(0,119,53);
  stroke(37,76,109);
  for(var i=0; i<lines.length; i++){
    lines[i].draw();
  }
}

function Line(start, end){
  this.head = start.copy();
  this.headpast = start.copy();
  this.tail = start.copy();
  this.tailpast = start.copy();
  this.end = end;
  this.moveDuration = 6000;
  this.delayDuration = random(2000,6000);
  this.moveStart = millis();
  this.delayStart = millis();
  this.expanding = false;
  this.contracting = false;
  this.delaying = true;
}

Line.prototype = {
  constructor: Line,

  draw:function(){
    this.handleMoving();
    line(this.head.x, this.head.y, this.tail.x, this.tail.y);
  },

  handleMoving:function(){
    if(this.delaying){
      // WAIT TO REVEAL LINE
      var progress = (millis() - this.delayStart) / this.delayDuration;
      if(progress >= 1){
        this.delaying = false;
        this.expanding = true;
        this.moveStart = millis();
      } else {
        // don't do shit
      }
    } else if(this.expanding){
      // EXPAND LINE TO REVEAL IT
      var progress = (millis() - this.moveStart) / this.moveDuration;
      if(progress >= 1){
        this.expanding = false;
        this.contracting = true;
        this.moveStart = millis();
      } else {
        this.head.x = ((this.end.x - this.headpast.x) * progress) + this.headpast.x;
        this.head.y = ((this.end.y - this.headpast.y) * progress) + this.headpast.y;
      }
    } else if(this.contracting){
      // CONTRACT LINE TO REMOVE IT
      var progress = (millis() - this.moveStart) / this.moveDuration;
      if(progress >= 1){
        // TODO: reset at the "top"
        this.head = this.headpast.copy();
        this.tail = this.tailpast.copy();
        this.contracting = false;
        this.delayDuration = random(2000,6000);
        this.delaying = true;
      } else {
        this.tail.x = ((this.end.x - this.tailpast.x) * progress) + this.tailpast.x;
        this.tail.y = ((this.end.y - this.tailpast.y) * progress) + this.tailpast.y;
      }
    }
  }

}
