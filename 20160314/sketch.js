var bars = [];
var barWidth;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  stroke(0);
  reset();
}

function reset(){
  bars = [];
  barWidth = windowWidth/30;
  strokeWeight(barWidth);

  var vec = createVector(windowWidth, windowHeight).normalize();
  var xpos = 0;
  var ypos = 0;

  // draw a bunch of bars parallel to diagonal bar toward the upper right.
  var i = 0;
  var delay = 200;
  while(xpos < windowWidth){
    var bar = new Bar(createVector(xpos,0-ypos), createVector(xpos,0-ypos));
    bar.moveTo(createVector(windowWidth + xpos, windowHeight - ypos), 1000, i*delay);
    bars.push(bar);
    xpos += barWidth*2 * vec.y;
    ypos += barWidth*2 * vec.x;
    i++;
  }

  // draw a bunch of bars perpindicular to diagonal bar toward the lower left.
  xpos = windowWidth;
  ypos = windowHeight;
  i = 0;
  while(ypos > 0){
    var bar = new Bar(createVector(xpos,ypos), createVector(xpos,ypos));
    bar.moveTo(createVector(xpos-windowHeight, ypos+windowWidth), 1000, i*delay + 1000);
    bars.push(bar);
    xpos -= barWidth*2 * vec.x;
    ypos -= barWidth*2 * vec.y;
    i++;
  }
}

function draw(){
  background(255);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Bar(start, end){
  this.start = start;
  this.end = end;
  this.targetEnd;
  this.pastEnd;
  this.bars = [];
  this.moving = false;
  this.moveStart = millis();
  this.moveDuration = 0;
  this.delaying = false;
  this.delayStart = millis();
  this.delayDuration = 0;
}

Bar.prototype = {
  constructor: Bar,

  draw:function(){
    this.handleDelaying();
    this.handleMoving();
    if(abs(this.start.dist(this.end)) > 0){
      line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
    for(var i=0; i<this.bars.length; i++){
      this.bars[i].draw();
    }
  },

  addBar:function(bar){
    this.bars.push(bar);
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delayDuration;
      if(p >= 1){
        this.delaying = false;
        this.moving = true;
        this.moveStart = millis();
      }
    }
  },

  handleMoving:function(){
    if(this.moving){
      var p = (millis() - this.moveStart) / this.moveDuration;
      if(p >= 1){
        this.end.x = this.targetEnd.x;
        this.end.y = this.targetEnd.y;
        this.moving = false;
      } else {
        this.end.x = ((this.targetEnd.x - this.pastEnd.x) * this.sinProgress(p)) + this.pastEnd.x;
        this.end.y = ((this.targetEnd.y - this.pastEnd.y) * this.sinProgress(p)) + this.pastEnd.y;
      }
    }
  },

  moveTo:function(targetEnd, moveDur, delayDur){
    this.targetEnd = targetEnd
    this.pastEnd = this.end.copy();
    this.moveDuration = moveDur;
    this.delayDuration = delayDur;
    this.delayStart = millis();
    this.delaying = true;
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
