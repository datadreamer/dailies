var mic, recorder, soundFile;
var loops = [];
var recording = false;
var measureLength = 0;
var startedRecording = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  mic = new p5.AudioIn();
  mic.start();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  //soundFile = new p5.SoundFile();
}


function draw(){
  background(0);
  if(recording && loops.length > 0){
    if(millis() - startedRecording >= measureLength){
      console.log("STOPPING AUTOMATICALLY.");
      recorder.stop();
      //soundFile.loop();
      loops.push(soundFile);
      recording = false;
    }
  }
}

function playAllTracks(){
  console.log("PLAYING ALL.");
  for(var i=0; i<loops.length; i++){
    loops[i].play();
  }
}

function keyPressed() {
  // make sure user enabled the mic
  if (!recording && mic.enabled) {
    soundFile = new p5.SoundFile();
    recorder.record(soundFile);
    recording = true;
    startedRecording = millis();
    console.log("RECORDING.");
  } else if (recording && loops.length == 0) {
    recorder.stop();
    loops.push(soundFile);
    console.log("STOPPING BY KEYPRESS.");
    soundFile.onended(playAllTracks);
    soundFile.play(); // play the first track
    measureLength = soundFile.duration() * 1000;
    console.log(measureLength);
    recording = false;
  }
}



function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
