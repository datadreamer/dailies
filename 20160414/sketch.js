var bouncerCount = 20;
var rowCount = 10;
var rows = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colorMode(HSB, 360);
  strokeWeight(2);
  for(var n=0; n<rowCount; n++){
    var bouncers = [];
    var h = ((n/rowCount) * 100) + 150;
    for(var i=0; i<bouncerCount; i++){
      var b = random(360);
      var c = color(h, b, 360);
      var x = (windowWidth / bouncerCount) * i
      var y = (windowHeight / rowCount) * n;
      bouncers.push(new Bouncer(x, y, c));
    }
    rows.push(bouncers);
  }
}

function draw(){
  background(0,0,0,16);
  for(var j=0; j<rows.length; j++){
    var bouncers = rows[j];
    for(var i=0; i<bouncers.length; i++){
      var a = bouncers[i];
      a.move();
      for(var n=i+1; n<bouncers.length; n++){
        var b = bouncers[n];
        if(a.xvec > 0){
          if(a.pastx < b.pastx && a.x >= b.x){
            a.x = a.pastx;
            b.x = b.pastx;
            a.xvec *= -1;
            b.xvec *= -1;
          }
        } else {
          if(a.pastx > b.pastx && a.x <= b.x){
            a.x = a.pastx;
            b.x = b.pastx;
            a.xvec *= -1;
            b.xvec *= -1;
          }
        }
      }
      a.draw();
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bouncer(x, y, c){
  this.x = x;
  this.pastx = x;
  this.y = y;
  this.h = windowHeight/rowCount;
  this.xvec = random(-1,1);
  this.c = c;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    stroke(this.c);
    line(this.x, this.y, this.x, this.y+this.h);
  },

  move:function(){
    // add vector
    this.pastx = this.x;
    this.x += this.xvec;

    // bounce off sides of browser
    if(this.x < 0){
      this.x = 0;
      this.xvec *= -1;
    } else if(this.x > windowWidth){
      this.x = windowWidth;
      this.xvec *= -1;
    }
  }

}
