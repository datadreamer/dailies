// Genuary 2022, January 1
// Draw 10,000 of something

var things = [];
var thingSize;
var xOffset = 0;
var yOffset = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  if(width > height){
    thingSize = height/100;
    xOffset = (width - height) / 2;
  } else {
    thingSize = width/100;
    yOffset = (height - width) / 2;
  }

  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);

  for(var y=0; y<100; y++){
    for(var x=0; x<100; x++){
      var pos = createVector(x*thingSize, y*thingSize);
      //var c = color(0, x*2.55 + random(-20,20), y*2.55 + random(-20,20));
      var newpos = p5.Vector.sub(pos, createVector(thingSize*50, thingSize*50));
      var angle = newpos.heading();
      var c = color(angle+180, 100, 100);
      things.push(new Something(pos, x, y, c));
    }
  }

  noStroke();
}

function draw(){
  background(0);
  translate(xOffset, yOffset);
  for(var i=0; i<things.length; i++){
    things[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




class Something{
  constructor(pos, x, y, c){
    this.pos = pos;
    this.x = x;
    this.y = y;
    this.c = c;
    this.colorNoise = random(-20,20);
  }

  draw(){
    fill(hue(this.c)+this.colorNoise, 100, 100, 100);
    rect(this.pos.x, this.pos.y, floor(thingSize), floor(thingSize));
    if(hue(this.c) >= 360){
      this.c = color(0, 100, 100);
    } else {
      var h = hue(this.c) + 1;
      this.c = color(h, 100, 100);
    }
  }
}
