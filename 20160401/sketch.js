var masterBlock;
var maxDepth = 7;
var fadingIn = false;
var fadeInStart = 0;
var fadeInDuration = 2000;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  masterBlock = new Block(createVector(-2,-2), createVector(windowWidth+2, -2), createVector(windowWidth+2, windowHeight+2), createVector(-2, windowHeight+2), 0);
  strokeWeight(2);
  fill(255);
}

function draw(){
  if(fadingIn){
    var p = ((millis() - fadeInStart) / fadeInDuration);
    if(p >= 1){
      background(255);
      fadingIn = false;
      masterBlock = new Block(createVector(-2,-2), createVector(windowWidth+2, -2), createVector(windowWidth+2, windowHeight+2), createVector(-2, windowHeight+2), 0);
    } else {
      background(p * 255);
    }
  } else {
    background(0);
  }
  masterBlock.draw();
  if(masterBlock.dead && !fadingIn){
    fadingIn = true;
    fadeInStart = millis();
  }
}

function mousePressed(){
  masterBlock.drop();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Block(posA, posB, posC, posD, depth){
  this.x = 0;
  this.y = 0;
  this.yv = 0;
  this.a = 0;
  this.av = random(-0.1, 0.1);
  this.gravity = random(0.1,0.3);
  var avgX = (posA.x + posB.x + posC.x + posD.x)/4;
  var avgY = (posA.y + posB.y + posC.y + posD.y)/4;
  this.centerPos = createVector(avgX, avgY);
  this.posA = posA;
  this.posB = posB;
  this.posC = posC;
  this.posD = posD;
  this.depth = depth;
  //console.log(avgX, avgY);

  var r = random(0.3, 0.7);
  var startX = ((posD.x - posA.x) * r) + posA.x;
  var startY = ((posD.y - posA.y) * r) + posA.y;
  this.lineStart = createVector(startX, startY);
  r = random(0.3, 0.7);
  var endX = ((posC.x - posB.x) * r) + posB.x;
  var endY = ((posC.y - posB.y) * r) + posB.y;
  this.lineEndTarget = createVector(endX, endY);
  this.lineEnd = this.lineStart.copy();
  this.children = [];
  this.drawing = false;
  if(this.depth < maxDepth){
    this.drawing = true;
  }
  this.drawingDuration = random(500,2000);
  this.drawingStart = millis();
  this.dropping = false;
  this.dead = false;
}

Block.prototype = {
  constructor:Block,

  draw:function(){
    // draw a line from a random point on the left edge to a random point on the right edge.
    this.handleDrawing();
    if(this.children.length == 0){
      // draw the block given the four points provided.
      push();
      translate(this.x, this.y);
      translate(this.centerPos.x, this.centerPos.y);
      rotate(this.a);
      translate(0-this.centerPos.x, 0-this.centerPos.y);
      beginShape();
      vertex(this.posA.x, this.posA.y);
      vertex(this.posB.x, this.posB.y);
      vertex(this.posC.x, this.posC.y);
      vertex(this.posD.x, this.posD.y);
      endShape(CLOSE);
      // noStroke();
      // fill(255, 0, 0);
      // rect(this.centerPos.x, this.centerPos.y, 3, 3);
      pop();
      if(!this.dropping){
        line(this.lineStart.x, this.lineStart.y, this.lineEnd.x, this.lineEnd.y);
      } else {
        if(this.y > windowHeight + 200){
          this.dead = true;
        }
      }
    } else {
      var bothdead = true;
      for(var i=0; i<this.children.length; i++){
        this.children[i].draw();
        if(!this.children[i].dead){
          bothdead = false;
        }
      }
      if(bothdead){
        this.dead = true;
      }
    }

    if(this.dropping){
      this.a += this.av;
      this.yv += this.gravity;
      this.y += this.yv;
    }
  },

  drop:function(){
    this.drawing = false;
    this.dropping = true;
    for(var i=0; i<this.children.length; i++){
      this.children[i].drop();
    }
  },

  handleDrawing:function(){
    if(this.drawing){
      var p = (millis() - this.drawingStart) / this.drawingDuration;
      if(p >= 1){
        this.drawing = false;
        this.lineEnd = this.lineEndTarget.copy();
        // create two new blocks on either side of the line and draw those instead.
        var blockA = new Block(this.posB, this.lineEnd, this.lineStart, this.posA, this.depth+1);
        var blockB = new Block(this.lineEnd, this.posC, this.posD, this.lineStart, this.depth+1);
        this.children.push(blockA);
        this.children.push(blockB);
      } else {
        this.lineEnd.x = ((this.lineEndTarget.x - this.lineStart.x) * this.sinProgress(p)) + this.lineStart.x;
        this.lineEnd.y = ((this.lineEndTarget.y - this.lineStart.y) * this.sinProgress(p)) + this.lineStart.y;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
