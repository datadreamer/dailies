var bouncerCount = 10;
var verticalBars = [];
var horizontalBars = [];
var diagonalBars = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  noStroke();
  rectMode(CENTER);

  // create vertical bars
  var w = windowWidth / (bouncerCount*2); // width
  var h = windowHeight;
  var hue = 200; // hue
  for(var i=0; i<bouncerCount; i++){
    var b = random(360);
    var c = color(255,0,0);
    var x = (windowWidth / (bouncerCount+1)) * i + (w*2)
    var y = windowHeight / 2;
    verticalBars.push(new Bouncer(x, y, w, h, c, windowWidth));
  }

  // create horizontal bars
  var w = windowHeight / (bouncerCount*2); // width
  var h = windowWidth;
  var hue = 320; // hue
  for(var i=0; i<bouncerCount; i++){
    var b = random(360);
    var c = color(0,0,255);
    var x = (windowHeight / (bouncerCount+1)) * i + (w*2)
    var y = windowWidth / 2;
    horizontalBars.push(new Bouncer(x, y, w, h, c, windowHeight));
  }

  // create diagonal bars
  var hypo = sqrt(windowWidth*windowWidth + windowHeight*windowHeight)
  var w = hypo / (bouncerCount*2); // width
  var h = hypo*2;;
  var hue = 320; // hue
  for(var i=0; i<bouncerCount; i++){
    var b = random(360);
    var c = color(0,255,0);
    var x = (hypo / (bouncerCount+1)) * i + (w*2)
    var y = hypo / 2;
    diagonalBars.push(new Bouncer(x, y, w, h, c, hypo));
  }

}

function draw(){
  blendMode(NORMAL);
  background(0,0,0,8);
  blendMode(SCREEN);

  for(var i=0; i<verticalBars.length; i++){
    var a = verticalBars[i];
    a.move();
    for(var n=i+1; n<verticalBars.length; n++){
      var b = verticalBars[n];
      collisionCheck(a, b);
    }
    a.draw();
  }

  push();
  translate(windowWidth, 0);
  rotate(HALF_PI);
  for(var i=0; i<horizontalBars.length; i++){
    var a = horizontalBars[i];
    a.move();
    for(var n=i+1; n<horizontalBars.length; n++){
      var b = horizontalBars[n];
      collisionCheck(a, b);
    }
    a.draw();
  }
  pop();

  push();
  rotate(atan2(windowHeight, windowWidth));
  translate(0,0-windowHeight/2);
  for(var i=0; i<diagonalBars.length; i++){
    var a = diagonalBars[i];
    a.move();
    for(var n=i+1; n<diagonalBars.length; n++){
      var b = diagonalBars[n];
      collisionCheck(a, b);
    }
    a.draw();
  }
  pop();
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




function Bouncer(x, y, w, h, c, maxWidth){
  this.x = x;
  this.pastx = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.xvec = random(-1,1);
  this.c = c;
  this.maxWidth = maxWidth;
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
    } else if(this.x+this.w/2 > this.maxWidth){
      this.x = this.maxWidth - this.w/2;
      this.xvec *= -1;
    }
  }

}
