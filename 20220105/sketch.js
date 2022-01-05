// Genuary 2022, January 5
// Destroy a Square

var chunks = [];
var resolution = 100;
var xOffset, yOffset;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);

  var size = int((width-200) / resolution);
  if(width > height){
    size = (height-200) / resolution;
  }
  for(var y=0; y<resolution; y++){
    for(var x=0; x<resolution; x++){
      var pos = createVector(x*size, y*size);
      var delay = (x * y) + 3000;
      chunks.push(new Chunk(pos, size, delay));
    }
  }

  xOffset =  (width - (resolution*size)) / 2;
  yOffset =  (height - (resolution*size)) / 2;

  noStroke();
}

function draw(){
  background(0);
  translate(xOffset,yOffset);
  for(var i=0; i<chunks.length; i++){
    chunks[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




class Chunk{
    constructor(pos, size, delay){
      this.pos = pos;
      this.size = size;
      this.delay = delay;
      this.fadeDuration = random(1000, 4000);
      this.birth = millis();
      this.delaying = true;
      this.fading = false;
      this.fadeStart;
      this.alpha = 255;
    }

    draw(){
      fill(255, this.alpha);
      square(this.pos.x, this.pos.y, this.size);
      if(this.delaying){
        if(millis() - this.birth > this.delay){
          this.delaying = false;
          this.fading = true;
          this.fadeStart = millis();
        }
      }
      if(this.fading){
        var progress = (millis() - this.fadeStart) / this.fadeDuration;
        this.alpha = (1-progress) * 255;
        if(progress >= 1){
          this.fading = false;
        }
      }
    }
}
