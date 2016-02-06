var words = [];
var deadwords = [];
var string = "";
var moveDuration = 1000;
var holdDuration = 250;
var din;

function preload(){
  din = loadFont("dinm.ttf");
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  textSize(100);
  textAlign(CENTER);
  fill(255);
  textFont(din);
}

function draw(){
  background(0);
  for(var i=0; i<words.length; i++){
    words[i].draw();
    if(words[i].dead){
      deadwords.push(words[i]);
    }
  }
  // remove the dead words from render list
  for(var n=0; n<deadwords.length; n++){
    var index = words.indexOf(deadwords[n]);
    if(index > -1){
      words.splice(index, 1);
    }
  }
  deadwords = [];
}

function keyTyped(){
  if(keyCode == ENTER || keyCode == RETURN || key == " " || key == "." || key == "?" || key == "!"){
    words.push(new Word(string.valueOf()));
    string = "";
  } else {
    string = string.concat(key);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Word(string){
  this.string = string;
  this.moving = true;
  this.holding = false;
  this.dead = false;
  this.moveStart = millis();
  this.holdStart = millis();
  this.birth = millis();
  this.x = windowWidth/2;
  this.y = windowHeight;
  this.tx = windowWidth/2;
  this.ty = windowHeight/2;
  this.px = this.x;
  this.py = this.y;
}

Word.prototype = {
  constructor:Word,

  draw:function(){
    this.handleMoving();
    this.handleHolding();
    text(this.string, this.x, this.y);
    if(millis() - this.birth > (moveDuration*2 + holdDuration)){
      this.dead = true;
    }
  },

  handleMoving:function(){
    if(this.moving){
      var p = (millis() - this.moveStart) / moveDuration;
      var sp = this.sinProgress(p);
      if(p >= 1){
        this.x = this.tx;
        this.y = this.ty;
        this.moving = false;
        this.holding = true;
        this.holdStart = millis();
      } else {
        this.x = ((this.tx - this.px) * sp) + this.px;
        this.y = ((this.ty - this.py) * sp) + this.py;
      }
    }
  },

  handleHolding:function(){
    if(this.holding){
      var p = (millis() - this.holdStart) / holdDuration;
      if(p >= 1){
        this.px = this.x;
        this.py = this.y;
        this.tx = windowWidth/2;
        this.ty = 0;
        this.holding = false;
        this.moving = true;
        this.moveStart = millis();
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
