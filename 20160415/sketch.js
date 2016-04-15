var bouncerCount = 10;
var rowCount = 10;
var rows = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colorMode(HSB, 360);
  noStroke();
  rectMode(CENTER);
  for(var n=0; n<rowCount; n++){
    var bouncers = [];
    var w = windowWidth / (bouncerCount*2); // width
    var h = ((n/rowCount) * 160) + 200;     // hue
    for(var i=0; i<bouncerCount; i++){
      var b = random(360);
      var c = color(h, b, 360);
      var x = (windowWidth / (bouncerCount+1)) * i + (w*2)
      var y = (windowHeight / rowCount) * n + ((windowHeight / rowCount)/2);
      bouncers.push(new Bouncer(x, y, w, c));
    }
    rows.push(bouncers);
  }
}

function draw(){
  background(0);
  for(var j=0; j<rows.length; j++){
    var bouncers = rows[j];
    for(var i=0; i<bouncers.length; i++){
      var a = bouncers[i];
      a.move();
      for(var n=i+1; n<bouncers.length; n++){
        var b = bouncers[n];
        collisionCheck(a, b);
      }
      a.draw();
    }
  }
}

function collisionCheck(a, b){
  if(a.xvec > 0){   // A is going right
    if(a.pastx+a.w/2 < b.pastx-b.w/2 && a.x+a.w/2 >= b.x-b.w/2){
      // A was to the left of B, but now A overlaps B.
      resetPositions(a, b);
    } else if(a.pastx-a.w/2 > b.pastx+b.w/2 && a.x-a.w/2 <= b.x+b.w/2){
      // A was to the right of B, but now A overlaps B.
      resetPositions(a, b);
    }
  } else {          // A is going left
    if(a.pastx+a.w/2 < b.pastx-b.w/2 && a.x+a.w/2 >= b.x-b.w/2){
      // A was to the left of B, but now A overlaps B.
      resetPositions(a, b);
    } else if(a.pastx-a.w/2 > b.pastx+b.w/2 && a.x-a.w/2 <= b.x+b.w/2){
      // A was to the right of B, but now A overlaps B.
      resetPositions(a, b);
    }
  }
}

function resetPositions(a, b){
  a.x = a.pastx;
  b.x = b.pastx;
  a.xvec *= -1;
  b.xvec *= -1;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Bouncer(x, y, w, c){
  this.x = x;
  this.pastx = x;
  this.y = y;
  this.w = w;
  this.h = windowHeight/(rowCount+1);
  this.xvec = random(-1,1);
  this.c = c;
}

Bouncer.prototype = {
  constructor:Bouncer,

  draw:function(){
    fill(this.c);
    rect(this.x, this.y, this.w, this.h);
  },

  move:function(){
    // add vector
    this.pastx = this.x;
    this.x += this.xvec;

    // bounce off sides of browser
    if(this.x-this.w/2 < 0){
      this.x = this.w/2;
      this.xvec *= -1;
    } else if(this.x+this.w/2 > windowWidth){
      this.x = windowWidth - this.w/2;
      this.xvec *= -1;
    }
  }

}
