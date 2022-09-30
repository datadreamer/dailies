var sounds = [];
var instrument = [];
var colors;
var names;
var mic;
var maxDiameter;
var started = false;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER);
  strokeCap(SQUARE);
  // create microphone object to determine audio levels.
  if(windowWidth < windowHeight){
    maxDiameter = windowWidth/2;
  } else {
    maxDiameter = windowHeight/2;
  }
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
  // start playing all (hopefully in sync)
  // for(var i=0; i<instrument.length; i++){
  //   instrument[i].play();
  // }
}

function preload(){
  // load sounds
  loadSounds();
  //sounds = [null, null, null, null, null];
}

function loadSounds(){
  sounds.push(loadSound("bass.wav"));
  sounds.push(loadSound("lead.wav"));
  sounds.push(loadSound("hihat.wav"));
  sounds.push(loadSound("snare.wav"));
  sounds.push(loadSound("kick.wav"));
}

function draw(){
  if(!started){
    background(0);
    fill(255);
    noStroke();
    text("CLICK ANYWHERE TO START", width/2, height/2);
  } else {
    blendMode(NORMAL);
    background(0);
    blendMode(SCREEN);
    mic.draw();
    noStroke();
    for(var i=0; i<instrument.length; i++){
      instrument[i].draw();
    }
  }
}

function mousePressed(){
  if(!started){
    // start playing all (hopefully in sync)
    for(var i=0; i<instrument.length; i++){
      instrument[i].play();
    }
    started = true;
  }
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
    this.sound.setVolume(0);
  }
  this.c = c;
  this.name = name;
  this.a = 0;
  this.angle = 0;
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
    push();
    translate(this.x, this.y);
    push();
    rotate(this.angle);
    strokeWeight(this.d/5);
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
    arc(0, 0, this.d, this.d, 0, TWO_PI-QUARTER_PI);
    pop();
    noStroke();
    fill(255);
    ellipse(0, 0, 20, 20);
    text(this.name, 0, 25);
    pop();
    this.angle += 0.1;
  },

  isOver(){
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo <= 20){
      return true;
    }
    return false;
  },

  play(){
    if(this.sound != null){
      this.sound.setVolume(1);
      this.sound.loop();
    }
  },

  stop(){
    if(this.sound != null){
      this.sound.setVolume(0);
      this.sound.stop();
    }
  }
}





function Microphone(x, y){
  this.x = x;
  this.y = y;
  this.d = maxDiameter;
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
