var c;
var shapes = [];
var deadshapes = [];
var colors;
var mainColor, bgColor;
var colorIndex = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  colorMode(HSB,255);
  mainColor = color(random(255),255,255);
  colorMode(RGB,255);
  bgColor = color(255);
  colors = [color(0), color(255), mainColor];
  rectMode(CENTER);
  ellipseMode(CENTER);
  strokeWeight(windowWidth/100);
}

function draw(){
  background(bgColor);
  for(var i=0; i<shapes.length; i++){
    shapes[i].update();
    shapes[i].draw();
    if(shapes[i].dead){
      deadshapes.push(shapes[i]);
    }
  }
  // remove the dead shapes
  for(var n=0; n<deadshapes.length; n++){
    var index = shapes.indexOf(deadshapes[n]);
    if(index > -1){
      shapes.splice(index, 1);
    }
  }
  deadshapes = [];
}

function createShape(x, y){
  var s;
  var r1 = random();
  if(r1 < 0.33){
    s = new Ring(x, y, colors[colorIndex]);
    var hypo = sqrt(windowWidth*windowWidth + windowHeight*windowHeight);
    s.sizeTo(hypo, hypo, 3000);
    s.moveTo(windowWidth/2, windowHeight/2, 3000);
  } else if(r1 > 0.33 && r1 < 0.66){
    s = new Shape(x, y, colors[colorIndex]);
    r = random();
    if(r < 0.33){
      s.moveTo(windowWidth/2, windowHeight/2, 3000);
    } else if(r > 0.33 && r < 0.66){
      s.h = windowHeight;
      s.w = 1;
      s.x = 0;
      s.y = windowHeight/2;
      if(random() > 0.5){
        s.x = windowWidth;
      }
      s.moveTo(windowWidth/2, windowHeight/2, 3000);
    } else {
      s.h = 1;
      s.w = windowWidth;
      s.x = windowWidth/2;
      s.y = 0;
      if(random() > 0.5){
        s.y = windowHeight;
      }
      s.moveTo(windowWidth/2, windowHeight/2, 3000);
    }
    s.sizeTo(windowWidth, windowHeight, 3000);
  } else {
    s = new Line(x, y, colors[colorIndex]);
    var r2 = random();
    if(r2 < 0.25){
      s.x = 0;
      s.y = windowHeight/2;
      s.w = windowWidth/100;
      s.h = windowHeight;
      s.moveTo(windowWidth, windowHeight/2, 3000);
    } else if(r2 > 0.25 && r2 < 0.5){
      s.x = windowWidth;
      s.y = windowHeight/2;
      s.w = windowWidth/100;
      s.h = windowHeight;
      s.moveTo(0, windowHeight/2, 3000);
    } else if(r2 > 0.5 && r2 < 0.75){
      s.x = windowWidth/2;
      s.y = 0;
      s.w = windowWidth;
      s.h = windowWidth/100;
      s.moveTo(windowWidth/2, windowHeight, 3000);
    } else {
      s.x = windowWidth/2;
      s.y = windowHeight;
      s.w = windowWidth;
      s.h = windowWidth/100;
      s.moveTo(windowWidth/2, 0, 3000);
    }
  }
  shapes.push(s);
  colorIndex++;
  if(colorIndex == colors.length){
    colorIndex = 0;
  }
}

function keyPressed(){
  createShape(random(windowWidth), random(windowHeight));
}

function mousePressed(){
  createShape(mouseX, mouseY);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Shape(x, y, c){
  this.x = x;
  this.y = y;
  this.tx = x;
  this.ty = y;
  this.px = x;
  this.py = y;
  this.w = 20;
  this.h = 20;
  this.tw = this.w;
  this.th = this.h;
  this.pw = this.w;
  this.ph = this.h;
  this.birth = millis();
  this.lifespan = 3000;
  this.dead = false;
  this.moving = false;
  this.sizing = false;
  this.fading = false;
  this.moveStart;
  this.sizeStart;
  this.fadeStart;
  this.moveDuration = 2000;
  this.sizeDuration = 2000;
  this.fadeDuration = 2000;
  this.c = c;
  this.a = 255;
  this.ta;
  this.pa;
}

Shape.prototype = {
  constructor:Shape,

  draw:function(){
    noStroke();
    fill(red(this.c), green(this.c), blue(this.c), this.a);
    rect(this.x, this.y, this.w, this.h);
  },

  handleFading:function(){
    if(this.fading){
      var p = (millis() - this.fadeStart) / this.fadeDuration;
      if(p >= 1){
        this.a = this.ta;
        this.fading = false;
      } else {
        var sp = this.sinProgress(p);
        this.a = ((this.ta - this.pa) * sp) + this.pa;
      }
    }
  },

  handleLife:function(){
    if(millis() - this.birth > this.lifespan){
      this.dead = true;
      bgColor = this.c;
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
        var sp = this.sinProgress(p);
        this.x = ((this.tx - this.px) * sp) + this.px;
        this.y = ((this.ty - this.py) * sp) + this.py;
      }
    }
  },

  handleSizing:function(){
    if(this.sizing){
      var p = (millis() - this.sizeStart) / this.sizeDuration;
      if(p >= 1){
        this.w = this.tw;
        this.h = this.th;
        this.sizing = false;
      } else {
        var sp = this.sinProgress(p);
        this.w = ((this.tw - this.pw) * sp) + this.pw;
        this.h = ((this.th - this.ph) * sp) + this.ph;
      }
    }
  },

  fadeTo:function(ta, dur){
    this.ta = ta;
    this.pa = this.a;
    this.fadeDuration = dur;
    this.fading = true;
    this.fadeStart = millis();
  },

  moveTo:function(tx, ty, dur){
    this.tx = tx;
    this.ty = ty;
    this.px = this.x;
    this.py = this.y;
    this.moveDuration = dur;
    this.moving = true;
    this.moveStart = millis();
  },

  sizeTo:function(tw, th, dur){
    this.tw = tw;
    this.th = th;
    this.pw = this.w;
    this.ph = this.h;
    this.sizeDuration = dur;
    this.sizing = true;
    this.sizeStart = millis();
  },

  update:function(){
    this.handleLife();
    this.handleFading();
    this.handleMoving();
    this.handleSizing();
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}





function Ring(x, y, c){
  Shape.call(this, x, y, c);
}

Ring.prototype = Object.create(Shape.prototype);
Ring.prototype.constructor = Shape;
Ring.prototype.draw = function(){
  noFill();
  stroke(red(this.c), green(this.c), blue(this.c), this.a);
  ellipse(this.x, this.y, this.w, this.w);
}
Ring.prototype.handleLife = function(){
  if(millis() - this.birth > this.lifespan){
    this.dead = true;
  }
}




function Line(x, y, c){
  Shape.call(this, x, y, c);
}

Line.prototype = Object.create(Shape.prototype);
Line.prototype.constructor = Shape;
Line.prototype.draw = function(){
  noFill();
  stroke(red(this.c), green(this.c), blue(this.c), this.a);
  rect(this.x, this.y, this.w, this.h);
}
Line.prototype.handleLife = function(){
  if(millis() - this.birth > this.lifespan){
    this.dead = true;
  }
}
