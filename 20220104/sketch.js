// Genuary 2022, January 4
// The Next Next Fidenza (Treviso)

var brushes = [];
var totalBrushes = 350;
var brushCount = 0;
var releaseRate = 100;
var lastRelease = 0;
var palette = ["#a07d5d", "#958a78", "#b4c5cf", "#39362f", "#9d9b8f", "#925c42", "#a78351", "#6d1d26", "#50643f", "#344555"];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  background(255);
  noStroke();
  rectMode(CENTER);

  for(var i=0; i<50; i++){
    var pos = createVector(random(100, width-100), random(100, height-100));
    var c = color(palette[floor(random(palette.length))]);
    brushes.push(new Brush(pos, c));
    brushCount++;
  }
}

function draw(){
  for(var i=brushes.length-1; i >= 0; i--){
    brushes[i].draw();
    if(brushes[i].dead){
      brushes.splice(i,1);
    }
  }

  if(millis() - lastRelease > releaseRate && brushCount < totalBrushes){
    var pos = createVector(random(100, width-100), random(100, height-100));
    var c = color(palette[floor(random(palette.length))]);
    brushes.push(new Brush(pos, c));
    brushCount++;
    lastRelease = millis();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




class Brush{
  constructor(pos, c){
    this.pos = pos;
    this.pastpos;
    this.c = c;
    if(random() > 0.5){
      this.vec = createVector(random(-1), random(1));
    } else {
      this.vec = createVector(random(1), random(-1));
    }
    this.damping = 0.97;
    this.size = random(10,40);
    this.birth = millis();
    this.lifespan = random(4000, 8000);
  }

  draw(){
    this.pastpos = this.pos.copy();
    this.pos.add(this.vec);
    this.vec.x += random(-0.02, 0.02);
    this.vec.y += random(-0.02, 0.02);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vec.heading());
    fill(255);
    rect(0, 0, this.size-2, this.size+4);
    fill(this.c);
    square(0, 0, this.size);
    pop();

    if(this.pos.x < 100 || this.pos.x > width-100){
      this.dead = true;
    }
    if(this.pos.y < 100 || this.pos.y > height-100){
      this.dead = true;
    }

    if(millis() - this.birth > this.lifespan){
      this.dead = true;
    }
  }
}
