var dots = [];
var dotCount = 30;
var ringRadius = 50;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  rectMode(CENTER);
  noFill();
  strokeWeight(2);
  colorMode(HSB, 360);
  reset();
}

function reset(){
  dots = [];
  ringRadius = windowWidth/20;
  var d = (TWO_PI*ringRadius) / dotCount;
  var angle = TWO_PI / dotCount;
  var a = 0;
  var delay = 0;
  var sizeDuration = 500;
  while(ringRadius+d < windowWidth/2){
    for(var i=0; i<dotCount; i++){
      a += angle;
      var xpos = (ringRadius * cos(a));
      var ypos = (ringRadius * sin(a));
      var c = color((ringRadius/(windowWidth/2))*360 - (windowWidth/20), 360, 360, 180);
      var dot = new Dot(xpos, ypos, d, c, a);
      dot.sizeTo(d, sizeDuration, delay);
      dots.push(dot);
      delay += 20;
    }
    ringRadius += d/2;
    d = (TWO_PI*ringRadius) / dotCount;
    angle = TWO_PI / dotCount;
    a += angle/2;
  }
}

function draw(){
  background(0,0,0,16);
  push();
  translate(windowWidth/2, windowHeight/2);
  for(var i=0; i<dots.length; i++){
    dots[i].draw();
  }
  pop();
}

function mousePressed(){
  reset();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Dot(x, y, d, c, a){
  this.x = x;
  this.y = y;
  this.d = 0;
  this.td = d;
  this.maxd = d;
  this.pd = 0;
  this.c = c;
  this.a = a;
  this.delaying = false;
  this.delayStart = millis();
  this.delayDuration = 0;
  this.sizing = false;
  this.sizeStart = millis();
  this.sizeDuration = 500;
}

Dot.prototype = {
  constructor:Dot,

  draw:function(){
    this.handleDelaying();
    this.handleSizing();
    stroke(this.c);
    push();
    translate(this.x, this.y);
    rotate(this.a);
    rect(0, 0, this.d, this.d);
    pop();
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delayDuration;
      if(p >= 1){
        this.delaying = false;
        this.sizing = true;
        this.sizeStart = millis();
      }
    }
  },

  handleSizing:function(){
    if(this.sizing){
      var p = (millis() - this.sizeStart) / this.sizeDuration;
      if(p >= 1){
        this.d = this.td;
        this.pd = this.d;
        this.td = random(this.maxd);
        this.sizeStart = millis();
      } else {
        this.d = ((this.td - this.pd) * this.sinProgress(p)) + this.pd;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  },

  sizeTo(d, sizeDuration, delayDuration){
    this.td = d;
    this.sizeDuration = sizeDuration;
    this.delayDuration = delayDuration;
    this.delayStart = millis();
    this.delaying = true;
  }
}
