var spirals = [];
var scaling = 10;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  stroke(255);
  strokeWeight(1);
  strokeCap(SQUARE);
  strokeJoin(MITER);
  noFill();
  var xstartpos = 0;
  var ystartpos = 0;
  var flipped = false;
  while(ystartpos < windowHeight*1.5){
    var xpos = xstartpos;
    var ypos = ystartpos;
    while(xpos < windowWidth*1.5){
      spirals.push(new Spiral(xpos, ypos, scaling, flipped));
      if(!flipped){
        xpos += 6 * scaling;
        ypos += 6 * scaling;
      } else {
        xpos += 6 * scaling;
        ypos += 6 * scaling;
      }
    }
    //break;
    xstartpos -= scaling;
    ystartpos += 8 * scaling;
    if(flipped){
      //break;
      ystartpos -= scaling;
      xstartpos -= scaling;
    }
    flipped = !flipped;
  }
  console.log("# spirals: "+ spirals.length);
}

function draw(){
  background(0);
  push();
  translate(0-windowWidth,0);
  rotate(-QUARTER_PI);
  for(var i=0; i<spirals.length; i++){
    spirals[i].draw();
  }
  pop();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Spiral(x, y, s, flipped){
  this.x = x;
  this.y = y;
  this.s = s;
  this.flipped = flipped;
  this.points = [
    createVector(0.5,0),
    createVector(-3,0),
    createVector(-3,4),
    createVector(8,4),
    createVector(8,8),
    createVector(4.5,8)
  ];
}

Spiral.prototype = {
  constructor:Spiral,

  draw:function(){
    push();
    translate(this.x, this.y);
    if(this.flipped){
      scale(1, -1);
      rotate(HALF_PI);
    }
    scale(this.s);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
    pop();
  }
}
