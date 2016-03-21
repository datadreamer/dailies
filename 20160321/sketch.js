var tiles = [];
var tileSize;
var tileCount = 20;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  tileSize = int(windowWidth/tileCount);
  var lastc = 0;
  var c, xoffset;
  for(var y=0-tileSize; y<windowHeight+tileSize; y+=tileSize){
    if(lastc == 0){
      lastc = 255;
      xoffset = 0;
      c = color(lastc);
    } else {
      lastc = 0;
      xoffset = tileSize;
      c = color(lastc);
    }
    for(var x=0-tileSize; x<windowWidth+tileSize; x+=tileSize*2){
      tiles.push(new Houndstooth(x+xoffset, y, tileSize, c));
    }
  }
}


function draw(){
  background(0,180,255);
  push();
  for(var i=0; i<tiles.length; i++){
    tiles[i].draw();
  }
  pop();
}

function mousePressed(){
  for(var i=0; i<tiles.length; i++){
    tiles[i].collapse();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Houndstooth(x, y, size, c){
  this.x = x;
  this.y = y;
  this.size = size;
  this.c = c;
  this.a = 0;
  this.points = [
    createVector(0,0),
    createVector(0,-0.5),
    createVector(0.5,0),
    createVector(1,0),
    createVector(2,1),
    createVector(1.5,1),
    createVector(1,0.5),
    createVector(1,1),
    createVector(0.5,1),
    createVector(1,1.5),
    createVector(1,2),
    createVector(0,1),
    createVector(0,0.5),
    createVector(-0.5,0)
  ];
  this.expandedPoints = [];
  for(var i=0; i<this.points.length; i++){
    this.expandedPoints[i] = this.points[i].copy();
  }
  this.collapsedPoints = [
    createVector(0,0),
    createVector(0.5,0),
    createVector(0.5,0),
    createVector(1,0),
    createVector(1,0),
    createVector(1,0.5),
    createVector(1,0.5),
    createVector(1,1),
    createVector(0.5,1),
    createVector(0.5,1),
    createVector(0,1),
    createVector(0,1),
    createVector(0,0.5),
    createVector(0,0.5)
  ];

  this.collapsing = false;
  this.expanding = false;
  this.collapseStart = millis();
  this.expandStart = millis();
  this.collapseDuration = 1000;
  this.expandDuration = 1000;
}

Houndstooth.prototype = {
  constructor:Houndstooth,

  draw:function(){
    this.handleCollapsing();
    this.handleExpanding();
    push();
    translate(this.x, this.y);
    rotate(this.a);
    scale(this.size, this.size);
    translate(-0.5, -0.5);  // center?
    fill(this.c);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape(CLOSE);
    pop();
  },

  collapse:function(){
    this.collapsing = true;
    this.collapseStart = millis();
  },

  expand:function(){
    this.expanding = true;
    this.expandStart = millis();
  },

  handleCollapsing:function(){
    if(this.collapsing){
      var p = (millis() - this.collapseStart) / this.collapseDuration;
      if(p >= 1){
        for(var i=0; i<this.points.length; i++){
          this.points[i] = this.collapsedPoints[i].copy();
        }
        this.collapsing = false;
        this.a += HALF_PI;  // snap another 90 degrees
        this.expand();
      } else {
        for(var i=0; i<this.points.length; i++){
          this.points[i].x = ((this.collapsedPoints[i].x - this.expandedPoints[i].x) * this.sinProgress(p)) + this.expandedPoints[i].x;
          this.points[i].y = ((this.collapsedPoints[i].y - this.expandedPoints[i].y) * this.sinProgress(p)) + this.expandedPoints[i].y;
        }
      }
    }
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandStart) / this.expandDuration;
      if(p >= 1){
        for(var i=0; i<this.points.length; i++){
          this.points[i] = this.expandedPoints[i].copy();
        }
        this.expanding = false;
      } else {
        for(var i=0; i<this.points.length; i++){
          var xdiff = this.expandedPoints[i].x - this.collapsedPoints[i].x;
          this.points[i].x = ((this.expandedPoints[i].x - this.collapsedPoints[i].x) * this.sinProgress(p)) + this.collapsedPoints[i].x;
          this.points[i].y = ((this.expandedPoints[i].y - this.collapsedPoints[i].y) * this.sinProgress(p)) + this.collapsedPoints[i].y;
        }
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }

}
