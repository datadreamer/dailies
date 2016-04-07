var bars = [];
var xCount = 40;
var spacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colorMode(HSB, 360);
  spacing = windowWidth / xCount;
  for(var x=0; x<xCount; x++){
    var xpos = int(x*spacing + spacing/2);
    bars.push(new Bar(xpos, windowHeight));
  }
  rectMode(CENTER);
  noStroke();
}

function draw(){
  background(100);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bar(x, y){
  this.x = x;
  this.y = y;
  this.w = 1;
  this.h = 0;
  this.targetW = spacing;
  this.targetH = windowHeight * 2;
  this.pastW = 0;
  this.pastH = 0;
  var r = random(255);
  this.c = color(random(180,220),360,360);
  this.growing = true;
  this.shrinking = false;
  this.fattening = false;
  this.thinning = false;
  this.growingStart = millis();
  this.shrinkingStart = millis();
  this.fatteningStart = millis();
  this.thinningStart = millis();
  this.growingDuration = random(500,2000);
  this.shrinkingDuration = random(500,2000);
  this.fatteningDuration = random(500,2000);
  this.thinningDuration = random(500,2000);
}

Bar.prototype = {
  constructor: Bar,

  draw:function(){
    this.handleGrowing();
    this.handleShrinking();
    this.handleFattening();
    this.handleThinning();
    fill(this.c);
    rect(this.x, this.y, this.w, this.h);
  },

  grow:function(){
    this.targetH = windowHeight*2;
    this.growing = true;
    this.growingDuration = random(500,2000);
    this.growingStart = millis();
    this.c = color(random(180,220),360,360);
  },

  handleGrowing:function(){
    // bar is getting taller
    if(this.growing){
      var p = (millis() - this.growingStart) / this.growingDuration;
      if(p >= 1){
        this.h = this.targetH;
        this.pastH = this.h;
        this.growing = false;
        this.fatten();
      } else {
        this.h = ((this.targetH - this.pastH) * this.sinProgress(p)) + this.pastH;
      }
    }
  },

  shrink:function(){
    this.targetH = 0;
    this.shrinking = true;
    this.shrinkingDuration = random(500,2000);
    this.shrinkingStart = millis();
  },

  handleShrinking:function(){
    // bar is getting shorter
    if(this.shrinking){
      var p = (millis() - this.shrinkingStart) / this.shrinkingDuration;
      if(p >= 1){
        this.h = this.targetH;
        this.pastH = this.h;
        this.shrinking = false;
        this.grow();
      } else {
        this.h = ((this.targetH - this.pastH) * this.sinProgress(p)) + this.pastH;
      }
    }
  },

  fatten:function(){
    this.targetW = spacing;
    this.fattening = true;
    this.fatteningDuration = random(500,2000);
    this.fatteningStart = millis();
  },

  handleFattening:function(){
    // bar width is increasing
    if(this.fattening){
      var p = (millis() - this.fatteningStart) / this.fatteningDuration;
      if(p >= 1){
        this.w = this.targetW;
        this.pastW = this.w;
        this.fattening = false;
        this.thin();
      } else {
        this.w = ((this.targetW - this.pastW) * this.sinProgress(p)) + this.pastW;
      }
    }
  },

  thin:function(){
    this.targetW = 1;
    this.thinning = true;
    this.thinningDuration = random(500,2000);
    this.thinningStart = millis();
  },

  handleThinning:function(){
    // bar width is decreasing
    if(this.thinning){
      var p = (millis() - this.thinningStart) / this.thinningDuration;
      if(p >= 1){
        this.w = this.targetW;
        this.pastW = this.w;
        this.thinning = false;
        this.shrink();
      } else {
        this.w = ((this.targetW - this.pastW) * this.sinProgress(p)) + this.pastW;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}