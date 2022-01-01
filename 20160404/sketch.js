var spirals = [];
var scaling = 10;

function setup(){
  var canvas = createCanvas(3000, 2250);
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

// function mouseMoved(){
//   var v = createVector(mouseX-windowWidth, mouseY);
//   v.rotate(-QUARTER_PI);
//   for(var i=0; i<spirals.length; i++){
//     var xdiff = spirals[i].x - v.x;
//     var ydiff = spirals[i].y - v.y;
//     var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
//     if(hypo < 100){
//       if(!spirals[i].contracting && !spirals[i].expanding){
//         spirals[i].contracting = true;
//         spirals[i].contractStart = millis();
//       }
//     }
//   }
// }

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed(){
  saveCanvas("spirals", "png");
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
  this.delaying = true;
  this.expanding = false;
  this.contracting = false;
  this.expandStart = millis();
  this.expandDuration = 2000;
  this.contractStart = millis();
  this.contractDuration = 2000;
  this.delayStart = millis();
  this.delayDuration = random(4000);
  this.startPos = 0;
  this.endPos = 0;
}

Spiral.prototype = {
  constructor:Spiral,

  draw:function(){
    this.handleDelaying();
    this.handleContracting();
    this.handleExpanding();
    push();
    translate(this.x, this.y);
    if(this.flipped){
      scale(1, -1);
      rotate(HALF_PI);
    }
    scale(this.s);
    beginShape();
    if(this.delaying){
      // do nothing?
    } else if(this.expanding){
      var sep = 1 / this.points.length;
      // expanding, so draw the points we have passed
      for(var i=0; i<this.points.length; i++){
        if(i*sep <= this.endPos){
          vertex(this.points[i].x, this.points[i].y);
        } else {
          var rem = this.endPos - ((i-1)*sep);
          var normrem = rem / sep;
          //console.log(normrem);
          var xdiff = ((this.points[i].x - this.points[i-1].x) * normrem) + this.points[i-1].x;
          var ydiff = ((this.points[i].y - this.points[i-1].y) * normrem) + this.points[i-1].y;
          vertex(xdiff, ydiff);
          break;
        }
      }
    } else if(this.contracting){
      var sep = 1 / this.points.length;
      // contracting, so draw the points we have YET to pass.
      for(var i=0; i<this.points.length; i++){

        if(this.startPos > (i-1)*sep && this.startPos < i*sep){
          var rem = this.startPos - (i-1)*sep;
          var normrem = rem / sep;
          var xdiff = ((this.points[i].x - this.points[i-1].x) * normrem) + this.points[i-1].x;
          var ydiff = ((this.points[i].y - this.points[i-1].y) * normrem) + this.points[i-1].y;
          vertex(xdiff, ydiff);
          vertex(this.points[i].x, this.points[i].y);
        } else if(i*sep > this.startPos){
          vertex(this.points[i].x, this.points[i].y);
        }
      }
    } else {
      // not expanding, not separating, draw all the points
      for(var i=0; i<this.points.length; i++){
        vertex(this.points[i].x, this.points[i].y);
      }
    }
    endShape();
    pop();
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delayDuration;
      if(p >= 1){
        this.delaying = false;
        this.expanding = true;
        this.expandStart = millis();
      }
    }
  },

  handleContracting:function(){
    if(this.contracting){
      var p = (millis() - this.contractStart) / this.contractDuration;
      if(p >= 1){
        this.contracting = false;
        this.endPos = 0;
        this.startPos = 0;
        this.expanding = true;
        this.expandStart = millis();
      } else {
        this.startPos = p;//this.sinProgress(p);
      }
    }
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandStart) / this.expandDuration;
      if(p >= 1){
        this.expanding = false;
        this.endPos = 1;
        this.contracting = true;
        this.contractStart = millis();
      } else {
        this.endPos = p;//this.sinProgress(p);
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
