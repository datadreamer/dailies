var sounds = [];
var instrument = [];
var colors;
var names;
var mic;
var maxDiameter;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  textAlign(CENTER);
  // create microphone object to determine audio levels.
  maxDiameter = windowWidth/2;
  mic = new Microphone(windowWidth/2, windowHeight/2);
  // create instrument object for each sound file.
  colors = [color(0,180,255), color(0,255,0), color(255,255,0), color(255,150,0), color(255,0,0)];
  names = ["BASS", "LEAD", "HIHAT", "SNARE", "KICK"];
  var a = 0;
  var angle = TWO_PI/sounds.length;
  for(var i=0; i<sounds.length; i++){
    a += angle;
    var xpos = (mic.d*0.75 * cos(a)) + windowWidth/2;
    var ypos = (mic.d*0.75 * sin(a)) + windowHeight/2;
    instrument.push(new Instrument(xpos, ypos, sounds[i], colors[i], names[i]));
  }
}

function preload(){
  // load sounds
  loadSounds();
  //sounds = [null, null, null, null, null];
}

function loadSounds(){
  sounds.push(loadSound("bass.mp3"));
  sounds.push(loadSound("lead.mp3"));
  sounds.push(loadSound("hihat.mp3"));
  sounds.push(loadSound("snare.mp3"));
  sounds.push(loadSound("kick.mp3"));
}

function draw(){
  background(0);
  mic.draw();
  noStroke();
  for(var i=0; i<instrument.length; i++){
    instrument[i].draw();
  }
}

function mousePressed(){
  if(mic.isOver()){
    mic.dragging = true;
  }
  for(var i=0; i<instrument.length; i++){
    if(instrument[i].isOver()){
      instrument[i].dragging = true;
    }
  }
}

function mouseReleased(){
  mic.dragging = false;
  for(var i=0; i<instrument.length; i++){
    instrument[i].dragging = false;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Instrument(x, y, sound, c, name){
  this.x = x;
  this.y = y;
  this.sound = sound;
  if(this.sound != null){
    this.sound.loop();
  }
  this.c = c;
  this.name = name;
  this.a = 0;
  this.d = 0;
  this.dragging = false;
}

Instrument.prototype = {
  constructor:Instrument,

  draw:function(){
    if(this.dragging){
      this.x = mouseX;
      this.y = mouseY;
    }
    fill(red(this.c), green(this.c), blue(this.c), this.a);
    ellipse(this.x, this.y, this.d, this.d);
    fill(255);
    ellipse(this.x, this.y, 20, 20);
    text(this.name, this.x, this.y+25);
  },

  isOver(){
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo <= 20){
      return true;
    }
    return false;
  }
}





function Microphone(x, y){
  this.x = x;
  this.y = y;
  this.d = windowWidth/2;
  this.dragging = false;
}

Microphone.prototype = {
  constructor:Microphone,

  draw:function(){
    if(this.dragging){
      this.x = mouseX;
      this.y = mouseY;
    }
    for(var i=0; i<instrument.length; i++){
      var xdiff = instrument[i].x - this.x;
      var ydiff = instrument[i].y - this.y;
      var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
      if(hypo < this.d/2){
        var norm = 1 - (hypo / (this.d/2));
        instrument[i].d = norm*maxDiameter;
        instrument[i].a = norm*255;
        if(instrument[i].sound != null){
          instrument[i].sound.setVolume(norm);
        }
      } else {
        instrument[i].d = 0;
        instrument[i].a = 0;
        if(instrument[i].sound != null){
          instrument[i].sound.setVolume(0);
        }
      }
    }
    fill(255);
    ellipse(this.x, this.y, 20, 20);
    noFill();
    stroke(255, 210);
    ellipse(this.x, this.y, this.d*0.2, this.d*0.2);
    stroke(255, 168);
    ellipse(this.x, this.y, this.d*0.4, this.d*0.4);
    stroke(255, 126);
    ellipse(this.x, this.y, this.d*0.6, this.d*0.6);
    stroke(255, 84);
    ellipse(this.x, this.y, this.d*0.8, this.d*0.8);
    stroke(255, 42);
    ellipse(this.x, this.y, this.d, this.d);
  },

  isOver(){
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo <= 20){
      return true;
    }
    return false;
  }
}
