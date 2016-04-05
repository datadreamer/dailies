var rings = [];
var maxSize;
var minSize = 50;
var spacing = minSize;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  maxSize = windowHeight;
  if(windowWidth < windowHeight){
    maxSize = windowWidth;
  }
  var size = minSize;
  while(size < maxSize){
    rings.push(new Ring(size));
    size += spacing;
  }
  strokeWeight(maxSize * 0.01);
  colorMode(HSB, 360);
  noFill();
  ellipseMode(CENTER);
  strokeCap(SQUARE);
}

function draw(){
  background(360);
  for(var i=0; i<rings.length; i++){
    rings[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Ring(d){
  this.d = d;
  this.x = windowWidth/2;
  this.y = windowHeight/2;
  this.expanding = true;
  this.contracting = false;
  this.delaying = false;
  this.startAngle = random(TWO_PI);
  this.endAngle = this.startAngle;
  this.expandStart = millis();
  this.expandDuration = random(1000,5000);
  this.contractStart = millis();
  this.contractDuration = random(1000,5000);
  this.delayStart = millis();
  this.delayDuration = random(1000,5000);
  this.brightness = random(360);
}

Ring.prototype = {
  constructor: Ring,

  draw:function(){
    this.handleDelaying();
    this.handleContracting();
    this.handleExpanding();
    stroke(200, 360, this.brightness);
    if(this.expanding || this.contracting){
      arc(this.x, this.y, this.d, this.d, this.startAngle, this.endAngle);
    } else if(this.delaying){
      // don't do shit.
    } else {
      ellipse(this.x, this.y, this.d, this.d);
    }
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delayDuration;
      if(p >= 1){
        this.delaying = false;
        this.startAngle = random(TWO_PI);
        this.endAngle = this.startAngle;
        this.brightness = random(360);
        this.expanding = true;
        this.expandStart = millis();
        this.expandDuration = random(1000,5000);
      }
    }
  },

  handleContracting:function(){
    if(this.contracting){
      var p = (millis() - this.contractStart) / this.contractDuration;
      if(p >= 1){
        this.startAngle = this.endAngle;
        this.contracting = false;
        this.delaying = true;
        this.delayStart = millis();
        this.delayDuration = random(1000,5000);
      } else {
        this.startAngle = this.endAngle - ((TWO_PI) * (1-this.sinProgress(p)));
      }
    }
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandStart) / this.expandDuration;
      if(p >= 1){
        this.endAngle = this.startAngle + TWO_PI;
        this.expanding = false;
        this.contracting = true;
        this.contractStart = millis();
        this.contractDuration = random(1000,5000);
        this.startAngle += 0.001; // correct for arc bug when start and end are the same value.
      } else {
        this.endAngle = (TWO_PI * this.sinProgress(p)) + this.startAngle;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
