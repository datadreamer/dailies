var bars = []
var barCount = 200;
var colorA, colorB, colorC, colorD;
var angleRange = 0.2;
var spacingNoise = 25;
var xdensity = 3.8;
var ydensity = 5.3;
var thickness = 25;
var minHeight = 100;
var maxHeight = 350;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  rectMode(CENTER);
  colorA = color(63,53,88);
  colorB = color(176,197,226);
  colorC = color(210,222,234);
  colorD = color(221,228,238);
  // for(var i=0; i<barCount; i++){
  //   bars.push(new Bar(random(windowWidth),random(windowHeight)));
  // }
  var xspacing = thickness * xdensity;
  var yspacing = thickness * ydensity;
  for(var x=0; x<(windowWidth+xspacing)/xspacing; x++){
    for(var y=0; y<(windowHeight+yspacing)/yspacing; y++){
      var xpos = x * xspacing + random(0-spacingNoise,spacingNoise);
      var ypos = y * yspacing + random(0-spacingNoise,spacingNoise);
      var bar = new Bar(xpos, ypos);
      bars.push(bar);
    }
  }
  bars = shuffle(bars);
}

function draw(){
  background(255);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}

function getColor(){
  var chance = random(0,1);
  if(chance < 0.5){
    return colorA;
  } else if(chance >= 0.4 && chance < 0.7){
    return colorB;
  } else if(chance >= 0.7 && chance < 0.9){
    return colorC;
  } else {
    return colorD;
  }
}

function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function mousePressed(){
  mouseDragged();
}

function mouseDragged(){
  for(var i=0; i<bars.length; i++){
    bars[i].disturb(mouseX, mouseY);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}


/* CLASSES */

function Bar(x, y){
  this.x = x;
  this.y = y;
  this.angle = random(0-angleRange,angleRange);
  this.c = getColor();
  this.h = random(minHeight,maxHeight);
}

Bar.prototype = {
  constructor:Bar,

  draw:function(){
    fill(this.c);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    rect(0,0,thickness,this.h);
    pop();
  },

  disturb:function(x,y){
    var radius = windowWidth/5;
    var xdiff = this.x - x;
    var ydiff = this.y - y;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo < radius){
      var force = ((radius - hypo) / radius) * 0.02;
      this.angle += random(0-force,force);
    }
  }
}
