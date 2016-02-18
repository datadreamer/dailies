var c;
var shapes = [];
var deadshapes = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  colorMode(HSB,255);
  c = color(random(255),255,255);
  colorMode(RGB,255);
  rectMode(CENTER);
  ellipseMode(CENTER);
  strokeWeight(5);
}

function draw(){
  background(255);
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

function keyPressed(){
  var s;
  if(random() > 0.5){
    s = new Ring(random(windowWidth), random(windowHeight));
  } else {
    s = new Shape(random(windowWidth), random(windowHeight));
  }
  s.sizeTo(windowWidth, windowHeight, 3000);
  s.moveTo(windowWidth/2, windowHeight/2, 3000);
  s.fadeTo(0, 3000);
  shapes.push(s);
}

function mousePressed(){
  var s;
  if(random() > 0.5){
    s = new Ring(mouseX, mouseY);
  } else {
    s = new Shape(mouseX, mouseY);
  }
  s.sizeTo(windowWidth, windowHeight, 3000);
  s.moveTo(windowWidth/2, windowHeight/2, 3000);
  s.fadeTo(0, 3000);
  shapes.push(s);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Shape(x, y){
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
  var r = random();
  if(r < 0.33){
    this.c = color(0);
  } else if(r > 0.33 && r < 0.66){
    this.c = color(255);
  }
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





function Ring(x, y){
  Shape.call(this, x, y);
}

Ring.prototype = Object.create(Shape.prototype);
Ring.prototype.constructor = Shape;
Ring.prototype.draw = function(){
  noFill();
  stroke(red(this.c), green(this.c), blue(this.c), this.a);
  ellipse(this.x, this.y, this.w, this.w);
}
