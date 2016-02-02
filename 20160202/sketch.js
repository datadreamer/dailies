var elements = [];
var xCount = 10;
var yCount = 10;
var boxWidth, boxHeight;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  rectMode(CENTER);
  boxWidth = windowWidth / xCount;
  boxHeight = windowHeight / yCount;
  //elements.push(new Element(windowWidth/2, windowHeight/2, 2000));
  var delay = 0;
  for(var y=0; y<yCount; y++){
    for(var x=0; x<xCount; x++){
      var xpos = x * boxWidth;
      var ypos = y * boxHeight;
      elements.push(new Element(xpos, ypos, 0));
      delay += 5;
    }
  }
}

function draw(){
  background(0);
  push();
  translate(boxWidth/2, boxHeight/2);
  for(var i=0; i<elements.length; i++){
    elements[i].draw();
  }
  pop();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  boxWidth = windowWidth / xCount;
  boxHeight = windowHeight / yCount;
}





function Element(x, y, delay){
  this.x = x;
  this.y = y;
  this.durationDelay = delay;
  this.durationSpin = 2000;
  this.durationExpand = 1000;
  this.durationContract = 1000;
  this.delayStart = millis();
  this.spinStart = millis();
  this.expandStart = millis();
  this.contractStart = millis();
  this.w = windowWidth/xCount;
  this.h = 1;
  this.alpha = 255;
  this.angle = 0 - HALF_PI;
  this.delaying = true;
  this.spinning = false;
  this.expanding = false;
  this.contracting = false;
}

Element.prototype = {
  constructor:Element,

  draw:function(){
    this.handleDelaying();
    this.handleSpinning();
    this.handleExpanding();
    this.handleContracting();
    fill(255,this.alpha);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    rect(0,0,this.w,this.h);
    //line(0-this.w/2, 0, this.w/2, 0);
    pop();
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.durationDelay;
      if(p >= 1){
        this.delaying = false;
        this.spinning = true;
        this.spinStart = millis();
      } else {
        // just wait...
      }
    }
  },

  handleSpinning:function(){
    if(this.spinning){
      var p = (millis() - this.spinStart) / this.durationSpin;
      var sp = this.sinProgress(p);
      if(p >= 1){
        this.angle = PI;
        this.spinning = false;
        this.expanding = true;
        this.expandStart = millis();
      } else {
        this.angle = (sp * (PI + HALF_PI)) - HALF_PI;
      }
    }
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandStart) / this.durationExpand;
      var sp = this.sinProgress(p);
      if(p >= 1){
        this.h = boxHeight;
        this.expanding = false;
        this.contracting = true;
        this.contractStart = millis();
      } else {
        this.h = boxHeight * sp;
      }
    }
  },

  handleContracting:function(){
    if(this.contracting){
      var p = (millis() - this.contractStart) / this.durationContract;
      var sp = this.sinProgress(p);
      if(p >= 1){
        this.w = 1;
        this.contracting = false;
        this.delaying = true;
        this.delayStart = millis();
        this.angle = 0-HALF_PI;
        this.w = boxWidth;
        this.h = 1;
      } else {
        this.w = boxWidth * (1-sp);
        this.h = (boxHeight-boxWidth) * (1-sp) + boxWidth;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }

}
