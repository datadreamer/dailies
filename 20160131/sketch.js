notes = [];
sounds = [];
var player;

function preload(){
  // load sounds
  loadSounds();
  //sounds = [null, null, null, null, null, null, null, null, null];
}

function loadSounds(){
  sounds.push(loadSound("../20160121/kalimba9.mp3"));
  sounds.push(loadSound("../20160121/kalimba8.mp3"));
  sounds.push(loadSound("../20160121/kalimba7.mp3"));
  sounds.push(loadSound("../20160121/kalimba6.mp3"));
  sounds.push(loadSound("../20160121/kalimba5.mp3"));
  sounds.push(loadSound("../20160121/kalimba4.mp3"));
  sounds.push(loadSound("../20160121/kalimba3.mp3"));
  sounds.push(loadSound("../20160121/kalimba2.mp3"));
  sounds.push(loadSound("../20160121/kalimba1.mp3"));
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  player = new Player(90);
}

function draw(){
  background(0);
  drawGuides();
  strokeWeight(3);
  player.draw();
  noStroke();
  for(var i=0; i<notes.length; i++){
    notes[i].draw();
  }
}

function drawGuides(){
  var barspace = windowHeight / sounds.length;
  for(var i=0; i<sounds.length; i++){
    strokeWeight(1);
    stroke(30);
    line(0, barspace * i, windowWidth, barspace * i);
  }
  barspace = windowWidth / 8;
  for(var i=0; i<8; i++){
    line(i* barspace, 0, i * barspace, windowHeight);
  }
}

function getColor(pos){
  // returns a value from the custom spectrum
  var red = color(255,0,0,255);
  var yellow = color(255,255,0,255);
  var green = color(0,255,0,255);
  var cyan = color(0,170,255,255);
  if(pos >= 0 && pos < 85){ // R to Y
    return lerpColor(red, yellow, (pos / 85));
  } else if(pos >= 85 && pos < 170){  // Y to G
    return lerpColor(yellow, green, ((pos-85) / 85));
  } else {  // G to C
    return lerpColor(green, cyan, ((pos-170) / 85));
  }
}

function mousePressed(){
  var newnote = true;
  for(var i=0; i<notes.length; i++){
    if(notes[i].isOver()){
      // dragging this note
      notes[i].dragging = true;
      newnote = false;
      break;
    }
  }
  if(newnote){
    notes.push(new Note(mouseX, mouseY, sounds));
  }
}

function mouseReleased(){
  for(var i=0; i<notes.length; i++){
    notes[i].dragging = false;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}






function Note(x, y, soundlist){
  this.x = x;
  this.y = y;
  this.sounds = soundlist;
  this.size = 50;
  this.index = floor(this.y / (windowHeight/this.sounds.length))
  this.sound = this.sounds[this.index];
  this.c = getColor(255 - ((this.index/this.sounds.length) * 255));
  this.dragging = false;
  //this.c = getColor(255 - ((this.y / windowHeight) * 255));
  //console.log(this.index);
}

Note.prototype = {
  constructor:Note,

  draw:function(){
    if(this.dragging){
      this.x = mouseX;
      this.y = mouseY;
      this.index = floor(this.y / (windowHeight/this.sounds.length))
      this.sound = this.sounds[this.index];
      this.c = getColor(255 - ((this.index/this.sounds.length) * 255));
    }
    fill(this.c);
    ellipse(this.x, this.y, this.size, this.size);
  },

  isOver:function(){
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(dist < this.size/2){
      return true;
    }
    return false;
  }
}




function Player(bpm){
  this.bpm = bpm;                    // beats per minute
  this.mspm = 60 / (bpm/4) * 1000;   // milliseconds per measure
  this.x = 0;
  this.y = 0;
  this.pastx = -1;
  this.coloring = false;
  this.coloringDuration = this.mspm / 4;
  this.c = color(255, 64);
  this.targetc = color(255);
  this.pastc = color(255);
  this.colorStart = millis();
  this.startTime = millis();
}

Player.prototype = {
  constructor:Player,

  draw:function(){
    this.handleAudio();
    this.handleColor();
    this.handleMoving();
    stroke(this.c);
    line(this.x, 0, this.x, windowHeight);
  },

  colorFade:function(tc){
    this.targetc = tc;
    this.coloring = true;
    this.pastc = this.c;
    this.colorStart = millis();
  },

  handleAudio:function(){
    for(var n=0; n<notes.length; n++){
      if((this.pastx < notes[n].x) && (this.x >= notes[n].x)){
        if(notes[n].sound != null){
          notes[n].sound.play();
        }
        this.c = color(red(notes[n].c), green(notes[n].c), blue(notes[n].c), 255);
        this.colorFade(color(255,255,255,64));
      }
    }
  },

  handleColor:function(){
    if(this.coloring){
      var progress = (millis() - this.colorStart) / this.coloringDuration;
      if(progress >= 1){
        this.coloring = false;
        this.c = this.targetc;
      } else {
        this.c = lerpColor(this.pastc, this.targetc, progress);
      }
    }
  },

  handleMoving:function(){
    this.pastx = this.x;
    var progress = (millis() - this.startTime) / this.mspm;
    if(progress >= 1){
      this.startTime = millis();
      this.x = 0;
      this.pastx = -1;
    } else {
      this.x = windowWidth * progress;
    }
  }
}
