var blinds = [];
var blindCount = 20;
var blindHeight;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  colorMode(HSB,360);
  blindHeight = ceil(windowWidth / blindCount);
  for(var x=0; x<windowWidth; x += blindHeight){
    var delay = random(1000,1200);
    for(var y=0; y<windowHeight; y += blindHeight){
      delay += 100;
      blinds.push(new Blind(x, y, delay));
    }
  }
}

function draw(){
  background(0);
  for(var i=0; i<blinds.length; i++){
    blinds[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Blind(x, y, delay){
  this.x = x;
  this.pos = y;
  this.delay = delay;
  this.y = 0;
  this.c = color(random(30)+170,360,360);
  this.targety = 0;
  this.pasty = 0;
  this.w = blindHeight;
  this.h = blindHeight;
  this.targeth = this.h;
  this.pasth = this.h;
  this.bendDuration = 1000;
  this.bendStart;
  this.bendingDown = false;
  this.bendingUp = false;
  this.bendingBack = false;
  this.delaying = true;
  this.delayStart = millis();
}

Blind.prototype = {
  constructor: Blind,

  draw:function(){
    this.handleDelaying();
    this.handleBending();
    push();
    translate(this.x, this.pos);
    fill(this.c);
    rect(0, this.y, this.w, this.h);
    pop();
  },

  bendDown:function(){
    this.targeth = 0;
    this.pasth = this.h;
    this.targety = blindHeight;
    this.pasty = this.y;
    this.bendStart = millis();
    this.bendingDown = true;
  },

  bendUp:function(){
    this.targeth = 0;
    this.pasth = this.h;
    this.targety = 0;
    this.pasty = this.y;
    this.bendStart = millis();
    this.bendingUp = true;
  },

  handleBending:function(){
    if(this.bendingDown){
      var p = (millis() - this.bendStart) / this.bendDuration;
      if(p >= 1){
        this.bendingDown = false;
        this.h = 0;
        this.y = blindHeight;
        this.targeth = blindHeight;
        this.pasth = this.h;
        this.targety = 0;
        this.pasty = this.y;
        this.bendingBack = true;
        this.bendStart = millis();
      } else {
        this.h = ((this.targeth - this.pasth) * this.sinProgress(p)) + this.pasth;
        this.y = ((this.targety - this.pasty) * this.sinProgress(p)) + this.pasty;
      }
    } else if(this.bendingUp){
      var p = (millis() - this.bendStart) / this.bendDuration;
      if(p >= 1){
        this.bendingUp = false;
        this.h = 0;
        this.y = 0;
        this.targeth = blindHeight;
        this.pasth = this.h;
        this.targety = 0;
        this.pasty = this.y;
        this.bendingBack = true;
        this.bendStart = millis();
      } else {
        this.h = ((this.targeth - this.pasth) * this.sinProgress(p)) + this.pasth;
        this.y = ((this.targety - this.pasty) * this.sinProgress(p)) + this.pasty;
      }
    } else if(this.bendingBack){
      var p = (millis() - this.bendStart) / this.bendDuration;
      if(p >= 1){
        this.bendingBack = false;
        this.h = blindHeight;
        this.y = 0;
        this.delaying = true;
        this.delayStart = millis();
      } else {
        this.h = ((this.targeth - this.pasth) * this.sinProgress(p)) + this.pasth;
        this.y = ((this.targety - this.pasty) * this.sinProgress(p)) + this.pasty;
      }
    }
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delay;
      if(p >= 1){
        this.delaying = false;
        this.bendDown();
      }
    }
  },

  isOver:function(){
    if(mouseY > this.pos && mouseY <= this.pos+this.h && mouseX > this.x && mouseX <= this.x+this.w){
      return true;
    }
    return false;
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
