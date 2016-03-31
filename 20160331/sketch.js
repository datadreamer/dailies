var masterBlock;
var maxDepth = 7;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  masterBlock = new Block(createVector(0,0), createVector(windowWidth, 0), createVector(windowWidth, windowHeight), createVector(0, windowHeight), 0);
  strokeWeight(2);
  fill(255);
}

function draw(){
  background(0);
  masterBlock.draw();
}

function mousePressed(){
  masterBlock = new Block(createVector(0,0), createVector(windowWidth, 0), createVector(windowWidth, windowHeight), createVector(0, windowHeight), 0);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Block(posA, posB, posC, posD, depth){
  this.posA = posA;
  this.posB = posB;
  this.posC = posC;
  this.posD = posD;
  this.depth = depth;

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
  this.drawing = true;
  this.drawingDuration = random(500,2000);
  this.drawingStart = millis();
}

Block.prototype = {
  constructor:Block,

  draw:function(){
    // draw a line from a random point on the left edge to a random point on the right edge.
    this.handleDrawing();
    if(this.children.length == 0){
      // draw the block given the four points provided.
      noStroke()
      beginShape();
      vertex(this.posA.x, this.posA.y);
      vertex(this.posB.x, this.posB.y);
      vertex(this.posC.x, this.posC.y);
      vertex(this.posD.x, this.posD.y);
      endShape(CLOSE);
    } else {
      for(var i=0; i<this.children.length; i++){
        this.children[i].draw();
      }
    }
    stroke(0);
    line(this.lineStart.x, this.lineStart.y, this.lineEnd.x, this.lineEnd.y);
  },

  handleDrawing:function(){
    if(this.drawing){
      var p = (millis() - this.drawingStart) / this.drawingDuration;
      if(p >= 1){
        this.drawing = false;
        this.lineEnd = this.lineEndTarget.copy();
        if(this.depth < maxDepth){
          // create two new blocks on either side of the line and draw those instead.
          var blockA = new Block(this.posB, this.lineEnd, this.lineStart, this.posA, this.depth+1);
          var blockB = new Block(this.lineEnd, this.posC, this.posD, this.lineStart, this.depth+1);
          this.children.push(blockA);
          this.children.push(blockB);
        }
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
