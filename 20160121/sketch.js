lines = [];
notes = [];
sounds = [];
var lineLength;
var halfLineLength;
var centerX;
var centerY;
var sound1;
var sound2;
var sound3;
var sound4;
var sound5;
var sound6;
var sound7;
var sound8;
var sound9;
var soundTriggerAngle = 0.002;
var soundTriggerDelay = 300;

function preload(){
  // load sounds
  sounds.push(loadSound("kalimba1.mp3"));
  sounds.push(loadSound("kalimba2.mp3"));
  sounds.push(loadSound("kalimba3.mp3"));
  sounds.push(loadSound("kalimba4.mp3"));
  sounds.push(loadSound("kalimba5.mp3"));
  sounds.push(loadSound("kalimba6.mp3"));
  sounds.push(loadSound("kalimba7.mp3"));
  sounds.push(loadSound("kalimba8.mp3"));
  sounds.push(loadSound("kalimba9.mp3"));
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(3);
  for(var i=0; i<sounds.length; i++){
    var angle = i * ((PI*2) / 9);
    sounds[i].setVolume(0.5);
    notes.push(new Note(sounds[i], angle));
  }
  lines.push(new Line());
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
  stroke(255,0,0);
  for(var i=0; i<notes.length; i++){
    notes[i].draw();
  }
  pop();

  // draw these spinning fuckers
  for(var i=0; i<lines.length; i++){
    lines[i].draw();
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
  this.angle = 0;
  this.speed = random(0.00001,0.0001);
  this.fadingIn = true;
  this.fadeInDuration = 3000;
  this.fadeStart = millis();
  this.lastPlay = [0,0,0,0,0,0,0,0,0];
}

Line.prototype = {
  constructor:Line,

  draw:function(){
    this.handleFading();
    this.handleAudio();
    push();
    translate(centerX, centerY);
    this.angle = (millis()-this.born) * this.speed;
    if(this.angle >= PI*2){
      this.angle = this.angle - PI*2;
      this.born = millis();
    }
    rotate(this.angle);
    stroke(255, this.alpha);
    line(0, 0, halfLineLength, 0);
    pop();
  },

  handleAudio:function(){
    for(var n=0; n<notes.length; n++){
      if((this.angle >= notes[n].angle) && (this.angle < notes[n].angle + soundTriggerAngle) && (millis() - this.lastPlay[n] > soundTriggerDelay)){
        // TODO: make trigger a factor of speed of line and soundTriggerAngle
        console.log(n +" "+ this.angle +" "+ notes[n].angle);
        notes[n].sound.play();
        this.lastPlay[n] = millis();
      }
    }
  },

  handleFading:function(){
    if(this.fadingIn){
      var progress = (millis() - this.fadeStart) / this.fadeInDuration;
      if(progress >= 1){
        this.fadingIn = false;
        this.alpha = 255;
      } else {
        this.alpha = progress * 255;
      }
    }
  }

}




function Note(sound, angle){
  this.sound = sound;
  this.angle = angle;
}

Note.prototype = {
  constructor:Note,

  draw:function(){
    push();
    rotate(this.angle);
    translate(halfLineLength-20,0);
    line(0,0,20,0);
    pop();
  }
}
