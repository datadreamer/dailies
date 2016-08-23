var bars = [];
var barWidth;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  reset();
}

function reset(){
  bars = [];
  barWidth = windowWidth/30;
  strokeWeight(barWidth);

  // draw bars around the edges of the screen, from top left and bottom right.
  var bar = new Bar(createVector(0,barWidth/2), createVector(0,barWidth/2), color(0));
  bar.moveTo(createVector(windowWidth,barWidth/2), 1000, 0);
  bars.push(bar);
  var bar = new Bar(createVector(barWidth/2, 0), createVector(barWidth/2, 0), color(0));
  bar.moveTo(createVector(barWidth/2, windowHeight), 1000, 0);
  bars.push(bar);
  var bar = new Bar(createVector(windowWidth, windowHeight-barWidth/2), createVector(windowWidth, windowHeight-barWidth/2), color(0));
  bar.moveTo(createVector(barWidth/2, windowHeight-barWidth/2), 1000, 500);
  bars.push(bar);
  var bar = new Bar(createVector(windowWidth-barWidth/2, windowHeight), createVector(windowWidth-barWidth/2, windowHeight), color(0));
  bar.moveTo(createVector(windowWidth-barWidth/2, 0), 1000, 500);
  bars.push(bar);

  // draw bars intersecting the screen vertically and horizontally.
  var bar = new Bar(createVector(windowWidth/2, 0), createVector(windowWidth/2, 0), color(0));
  bar.moveTo(createVector(windowWidth/2, windowHeight), 1000, 750);
  bars.push(bar);
  var bar = new Bar(createVector(0, windowHeight/2), createVector(0, windowHeight/2), color(0));
  bar.moveTo(createVector(windowWidth, windowHeight/2), 1000, 1000);
  bars.push(bar);

  // draw gray vertical bars in the top left.
  var xpos = barWidth*3 - (barWidth/2);
  var delay = 1000;
  while(xpos < windowWidth/2){
    var bar = new Bar(createVector(xpos,0), createVector(xpos,0), color(128));
    bar.moveTo(createVector(xpos,windowHeight/2), 1000, delay);
    bars.push(bar);
    xpos += barWidth*2;
    delay += 200;
  }

  // draw yellow horizontal bars in the top right.
  var ypos = barWidth * 3 - (barWidth/2);
  while(ypos < windowHeight/2){
    var bar = new Bar(createVector(windowWidth/2, ypos), createVector(windowWidth/2, ypos), color(255, 245, 0));
    bar.moveTo(createVector(windowWidth, ypos), 1000, delay);
    bars.push(bar);
    ypos += barWidth * 2;
    delay += 200;
  }

  // draw magenta diagonal bars in the bottom left.
  var vec = createVector(-windowWidth, -windowHeight).normalize();
  var xpos = barWidth*3 - (barWidth/2);
  var ypos = windowHeight/2;
  while(ypos < windowHeight){
    var bar = new Bar(createVector(xpos,ypos), createVector(xpos,ypos), color(229, 30, 130));
    bar.moveTo(createVector(xpos - windowWidth/2, ypos + windowHeight/2), 1000, delay);
    bars.push(bar);
    if(xpos < windowWidth/2){
      xpos -= barWidth * 4 * vec.x;
      if(xpos > windowWidth/2){
        var xdiff = xpos - windowWidth/2;
        xpos -= xdiff;
        ypos += (xdiff / vec.x) * vec.y;
      }
    } else {
      xpos = windowWidth/2;
      ypos -= barWidth * 4 * vec.y;
    }
    delay += 200;
  }

  // draw cyan diagonal bars in the bottom right.
  var vec = createVector(windowWidth, windowHeight).normalize();
  var xpos = windowWidth/2;
  var ypos = windowHeight - (barWidth * 3) - (barWidth/2);
  while(xpos < windowWidth){
    var bar = new Bar(createVector(xpos,ypos), createVector(xpos,ypos), color(0, 255, 255));
    bar.moveTo(createVector(xpos + windowWidth/2, ypos + windowHeight/2), 1000, delay);
    bars.push(bar);
    if(ypos > windowHeight/2){
      ypos -= barWidth * 4 * vec.y;
      if(ypos < windowHeight/2){
        var ydiff = windowHeight/2 - ypos;
        ypos += ydiff;
        xpos += (ydiff / vec.y) * vec.x;
      }
    } else {
      ypos = windowHeight/2;
      xpos += barWidth * 4 * vec.x;
    }
    //console.log(xpos, ypos);
    // xpos += barWidth * 2 * vec.x;
    // ypos -= barWidth * 2 * vec.y;
    delay += 200;
  }

  // reverse array to make sure black bars are drawn on top.
  bars.reverse();
}

function draw(){
  background(255);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}

function mousePressed(){
  reset();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Bar(start, end, c){
  this.start = start;
  this.end = end;
  this.c = c;
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
    stroke(this.c);
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
