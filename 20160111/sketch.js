var bars = []
var barCount = 200;
var colorA, colorB, colorC, colorD;
var angleRange = 0.2;
var spacingNoise = 25;
var xdensity = 2.25;
var ydensity = 5.3;
var thickness = 25;
var minHeight = 100;
var maxHeight = 400;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  colorA = color(180,36,71);    // magenta
  colorB = color(163,51,109);   // purple
  colorC = color(171,161,195);  // mauve
  colorD = color(40,113,182);   // blue
  colorE = color(145,197,218);  // cyan

  var xspacing = thickness * xdensity;
  for(var x=0; x<(windowWidth+xspacing)/xspacing; x++){
    var ypos = 0;
    while(ypos < windowHeight){
      var xpos = x * xspacing;// + random(0-spacingNoise,spacingNoise);
      var bar = new Bar(xpos, ypos);
      bars.push(bar);
      ypos += bar.h;
    }
  }

  bars = shuffle(bars);
}

function draw(){
  background(0);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
}

function getColor(){
  var chance = random(0,1);
  if(chance < 0.2){
    return colorA;
  } else if(chance >= 0.2 && chance < 0.4){
    return colorB;
  } else if(chance >= 0.4 && chance < 0.6){
    return colorC;
  } else if(chance >= 0.6 && chance < 0.8){
    return colorD
  } else {
    return colorE;
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

function touchMoved(){
  for(var i=0; i<bars.length; i++){
    bars[i].disturb(touchX, touchY);
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
