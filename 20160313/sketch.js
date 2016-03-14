var bars = [];
var barWidth = 20;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  fill(255);
  reset();
}

function reset(){
  bars = [];
  var barCount = int(random(3,10));
  var horSpacing = windowWidth / barCount;
  var horNoise = horSpacing / 4;
  // add vertical bars
  for(var i=0; i<barCount; i++){
    var xpos = int(i*horSpacing + random(0-horNoise, horNoise) + (horSpacing/2));
    var bar = new Bar(-barWidth, 0, barWidth, windowHeight);
    bar.moveTo(xpos, 0, 1000, (barCount*350) - 350*i);
    bars.push(bar);
  }
  // add horizontal bars
  for(var i=0; i<bars.length-1; i++){
    var w = bars[i+1].tx - bars[i].tx;
    var horbar = new Bar(bars[i].tx, windowHeight + barWidth, w, barWidth);
    horbar.moveTo(bars[i].tx, random(windowHeight), 1000, (barCount*350) + 1000 + 350*i);
    bars[i].addBar(horbar);
  }
}

function draw(){
  background(0);
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





function Bar(x, y, w, h){
  this.x = x;
  this.y = y;
  this.tx = x;
  this.ty = y;
  this.px = x;
  this.py = y;
  this.w = w;
  this.h = h;
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
    rect(this.x, this.y, this.w, this.h);
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
        this.x = this.tx;
        this.y = this.ty;
        this.moving = false;
      } else {
        this.x = ((this.tx - this.px) * this.sinProgress(p)) + this.px;
        this.y = ((this.ty - this.py) * this.sinProgress(p)) + this.py;
      }
    }
  },

  moveTo:function(x, y, moveDur, delayDur){
    this.tx = x;
    this.ty = y;
    this.px = this.x;
    this.py = this.y;
    this.moveDuration = moveDur;
    this.delayDuration = delayDur;
    this.delayStart = millis();
    this.delaying = true;
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
