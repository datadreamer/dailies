var blinds = [];
var blindCount = 30;
var blindHeight;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  blindHeight = windowHeight / blindCount;
  for(var i=0; i<blindCount; i++){
    var y = blindHeight * i;
    blinds.push(new Blind(0, y));
  }
  fill(255);
}

function draw(){
  background(0);
  for(var i=0; i<blinds.length; i++){
    blinds[i].draw();
  }
}

function mouseDragged(){
  if(mouseX-pmouseX > 0){
    // dragging down
    for(var i=0; i<blinds.length; i++){
      if(blinds[i].isOver() && !blinds[i].bendingDown && !blinds[i].bendingUp){
        blinds[i].bendDown();
      }
    }
  } else {
    // dragging up
    for(var i=0; i<blinds.length; i++){
      if(blinds[i].isOver() && !blinds[i].bendingDown && !blinds[i].bendingUp){
        blinds[i].bendUp();
      }
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Blind(x, y){
  this.x = x;
  this.pos = y;
  this.y = 0;
  this.targety = 0;
  this.pasty = 0;
  this.h = blindHeight;
  this.targeth = this.h;
  this.pasth = this.h;
  this.bendDuration = 1000;
  this.bendStart;
  this.bendingDown = false;
  this.bendingUp = false;
  this.bendingBack = false;
}

Blind.prototype = {
  constructor: Blind,

  draw:function(){
    this.handleBending();
    push();
    translate(this.x, this.pos);
    rect(0, this.y, windowWidth, this.h);
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
      } else {
        this.h = ((this.targeth - this.pasth) * this.sinProgress(p)) + this.pasth;
        this.y = ((this.targety - this.pasty) * this.sinProgress(p)) + this.pasty;
      }
    }
  },

  isOver:function(){
    if(mouseY > this.pos && mouseY <= this.pos+this.h){
      return true;
    }
    return false;
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
