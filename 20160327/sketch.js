var dots = [];
var diamonds = [];
var dotCount = 6;
var ringRadius = 50;
var speed = 0.001;
var inv = 1;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  fill(255);
  noStroke();
  reset();
}

function reset(){
  diamonds = [];
  ringRadius = windowWidth/20;
  speed = 0.001;
  inv = 1;
  var d = (TWO_PI*ringRadius) / dotCount;
  var angle = TWO_PI / dotCount;
  var a = 0;
  var delay = 0;
  var sizeDuration = 500;
  var maxRadius = sqrt(windowWidth*windowWidth + windowHeight*windowHeight)/2;
  while(ringRadius <= maxRadius){
    for(var i=0; i<dotCount; i++){
      a += angle;
      var xpos = (ringRadius * cos(a));
      var ypos = (ringRadius * sin(a));
      var diamond = new Diamond(xpos, ypos, d, a, ringRadius, speed, inv);
      diamonds.push(diamond);
      delay += 20;
    }
    ringRadius += d;
    dotCount = floor((TWO_PI*ringRadius)/d);
    angle = TWO_PI / dotCount;
    a += angle/2;
    inv *= -1;
  }
  console.log("Total Diamonds: "+ diamonds.length);
}

function draw(){
  background(0);
  push();
  translate(windowWidth/2, windowHeight/2);
  for(var i=0; i<diamonds.length; i++){
    diamonds[i].draw();
  }
  pop();
}

function mouseDragged(){
  speed = (mouseY - pmouseY) * 0.0001;
  for(var i=0; i<diamonds.length; i++){
    diamonds[i].speed += speed;
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Diamond(x, y, d, a, ringRadius, speed, inv){
  this.x = x;
  this.y = y;
  this.d = d;
  this.r = this.d/4;
  this.a = a;
  this.ringRadius = ringRadius;
  this.speed = speed;
  this.inv = inv;
}

Diamond.prototype = {
  constructor:Diamond,

  draw:function(){
    push();
    translate(this.x, this.y)
    rotate(this.a);
    beginShape();
    vertex(0, 0-this.r);
    vertex(this.r/2, 0);
    vertex(0, this.r);
    vertex(0-this.r/2, 0);
    endShape(CLOSE);
    pop();
    // move x/y based on speed
    this.a += (this.speed * this.inv);
    this.x = this.ringRadius * cos(this.a);
    this.y = this.ringRadius * sin(this.a);
  }
}
