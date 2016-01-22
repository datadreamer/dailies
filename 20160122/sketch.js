lines = [];
notes = [];
sounds = [];
var lineLength;
var halfLineLength;
var centerX;
var centerY;
var soundTriggerAngle = 0.002;
var soundTriggerDelay = 300;

function preload(){
  // load sounds
  loadSounds();
  //sounds = [null, null, null, null, null, null, null, null, null];
}

function loadSounds(){
  sounds.push(loadSound("../20160121/kalimba1.mp3"));
  sounds.push(loadSound("../20160121/kalimba2.mp3"));
  sounds.push(loadSound("../20160121/kalimba3.mp3"));
  sounds.push(loadSound("../20160121/kalimba4.mp3"));
  sounds.push(loadSound("../20160121/kalimba5.mp3"));
  sounds.push(loadSound("../20160121/kalimba6.mp3"));
  sounds.push(loadSound("../20160121/kalimba7.mp3"));
  sounds.push(loadSound("../20160121/kalimba8.mp3"));
  sounds.push(loadSound("../20160121/kalimba9.mp3"));
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(5);
  var angleSpacing = ((PI*2) / sounds.length);
  for(var i=0; i<sounds.length; i++){
    var angle = (i * angleSpacing) + (angleSpacing/2);
    if(sounds[i] != null){
      sounds[i].setVolume(0.5);
    }
    var c = getColor((i / sounds.length) * 255);
    notes.push(new Note(sounds[i], angle, c));
  }
  //lines.push(new Line());
}

function draw(){
  // update global variables every frame
  lineLength = windowHeight;
  if(windowWidth < windowHeight){
    lineLength = windowWidth;
  }
  halfLineLength = lineLength/2;
  centerX = windowWidth/2;
  centerY = windowHeight/2;

  background(0);

  // draw the 9 markers around the ring
  push();
  translate(centerX, centerY);
  for(var i=0; i<notes.length; i++){
    notes[i].draw();
  }
  pop();

  // draw these spinning fuckers
  for(var i=0; i<lines.length; i++){
    lines[i].draw();
  }
}

function getColor(pos){
  // returns a value from the CMY spectrum
  var cyan = color(0, 174, 239, 255);
  var magenta = color(236, 0, 140, 255);
  var yellow = color(255, 242, 0, 255);
  if(pos >= 0 && pos < 85){ // C to M
    return lerpColor(cyan, magenta, (pos / 85));
  } else if(pos >= 85 && pos < 170){  // M to Y
    return lerpColor(magenta, yellow, ((pos-85) / 85));
  } else {  // Y to C
    return lerpColor(yellow, cyan, ((pos-170) / 85));
  }
}

function mousePressed(){
  lines.push(new Line());
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Line(){
  this.born = millis();
  this.alpha = 0;
  this.maxalpha = 64;
  this.pastalpha = 0;
  this.targetalpha = 64;
  this.lastangle = 0;
  this.angle = 0;
  this.linelength = random(halfLineLength/4, halfLineLength/2);
  this.speed = random(0.00001,0.0001);
  this.c = color(255, 64);
  this.targetc = color(255);
  this.pastc = color(255);
  this.coloring = false;
  this.coloringDuration = 1000;
  this.colorStart = millis();
  this.fadingIn = true;
  this.fadeInDuration = 3000;
  this.fadeStart = millis();
  this.lastPlay = [0,0,0,0,0,0,0,0,0];
}

Line.prototype = {
  constructor:Line,

  draw:function(){
    this.handleFading();
    this.handleColor();
    this.handleAudio();
    push();
    translate(centerX, centerY);
    this.lastangle = this.angle;
    this.angle = (millis()-this.born) * this.speed;
    if(this.angle >= PI*2){
      this.angle = this.angle - PI*2;
      this.born = millis();
    }
    rotate(this.angle);
    //stroke(red(this.c), green(this.c), blue(this.c), this.alpha);
    //line(0, 0, halfLineLength, 0);
    stroke(red(this.c), green(this.c), blue(this.c), this.alpha);
    line(halfLineLength-10, 0, halfLineLength - this.linelength, 0);
    pop();
  },

  colorFade:function(tc, ta){
    this.targetc = tc;
    this.targetalpha = ta;
    this.coloring = true;
    this.pastc = this.c;
    this.pastalpha = this.alpha;
    this.colorStart = millis();
  },

  handleAudio:function(){
    for(var n=0; n<notes.length; n++){
      //if((this.angle >= notes[n].angle) && (this.angle < notes[n].angle + soundTriggerAngle) && (millis() - this.lastPlay[n] > soundTriggerDelay)){
      if((this.lastangle < notes[n].angle) && (this.angle >= notes[n].angle)){
        //console.log(n +" "+ this.angle +" "+ notes[n].angle);
        if(notes[n].sound != null){
          notes[n].sound.play();
        }
        // color this line with note color and immediately fade it back to white
        this.c = notes[n].c;
        this.alpha = 255;
        this.colorFade(color(255),64);
        this.lastPlay[n] = millis();
      }
    }
  },

  handleColor:function(){
    if(this.coloring){
      var progress = (millis() - this.colorStart) / this.coloringDuration;
      if(progress >= 1){
        this.coloring = false;
        this.c = this.targetc;
        this.alpha = this.targetalpha;
      } else {
        this.c = lerpColor(this.pastc, this.targetc, progress);
        this.alpha = ((this.targetalpha - this.pastalpha) * progress) + this.pastalpha;
      }
    }
  },

  handleFading:function(){
    if(this.fadingIn){
      var progress = (millis() - this.fadeStart) / this.fadeInDuration;
      if(progress >= 1){
        this.fadingIn = false;
        this.alpha = this.maxalpha;
      } else {
        this.alpha = progress * this.maxalpha;
      }
    }
  }

}




function Note(sound, angle, c){
  this.sound = sound;
  this.angle = angle;
  this.c = c;
  this.size = 30;
}

Note.prototype = {
  constructor:Note,

  draw:function(){
    push();
    rotate(this.angle);
    translate(halfLineLength,0);
    fill(this.c);
    beginShape();
    vertex(0, -this.size/4);
    vertex(-this.size, 0);
    vertex(0, this.size/4);
    endShape();
    //stroke(this.c);
    //line(0,0,20,0);
    pop();
  }
}
