var bars = []
var dividers = []
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
  thickness = windowWidth / 46;
  var minHeight = thickness * 4;
  var maxHeight = minHeight * 4;
  colorA = color(255,70,52);    // orangered
  colorB = color(255,115,46);   // orange
  colorC = color(165,205,231);  // blue
  colorD = color(47,85,192);    // dark blue
  colorE = color(0);            // black
  colorF = color(255);          // white
  colorG = color(229,173,184);  // salmon

  var xpos = 0;
  while(xpos < windowWidth){
    var barCount = 0;
    while(barCount < 4){
      var ypos = 0;
      while(ypos < windowHeight){
        var bar = new Bar(xpos, ypos);
        bars.push(bar);
        ypos += bar.h;
      }
      xpos += thickness;
      barCount++;
    }
    dividers.push(new Divider(xpos,0));
    xpos += thickness * 2;
  }

  bars = shuffle(bars);
}

function draw(){
  background(255);
  for(var i=0; i<bars.length; i++){
    bars[i].draw();
  }
  for(var i=0; i<dividers.length; i++){
    dividers[i].draw();
  }
}

function getColor(){
  var chance = random(0,1);
  if(chance < 0.2){
    return colorA;
  } else if(chance >= 0.2 && chance < 0.4){
    return colorB;
  } else if(chance >= 0.4 && chance < 0.5){
    return colorC;
  } else if(chance >= 0.5 && chance < 0.6){
    return colorD
  }  else if(chance >= 0.6 && chance < 0.7){
    return colorE;
  } else if(chance >= 0.7 && chance < 0.8){
    return colorF;
  } else {
    return colorG;
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
  this.h = Math.round(random(minHeight,maxHeight));
}

Bar.prototype = {
  constructor:Bar,

  draw:function(){
    fill(this.c);
    push();
    translate(this.x, this.y);
    //rotate(this.angle);
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

function Divider(x,y){
  this.x = x;
  this.y = y;
}

Divider.prototype = {
  constructor:Divider,

  draw:function(){
    var grad = drawingContext.createLinearGradient(this.x, this.y, this.x+(thickness*2), this.y);
    grad.addColorStop(0, color(30));
    grad.addColorStop(1, color(70));
    drawingContext.fillStyle = grad;
    drawingContext.beginPath();
    drawingContext.moveTo(this.x, this.y);
    drawingContext.lineTo(this.x + thickness*2, this.y);
    drawingContext.lineTo(this.x + thickness*2, this.y + windowHeight);
    drawingContext.lineTo(this.x, this.y + windowHeight);
    drawingContext.closePath();
    drawingContext.fill();
  }
}
