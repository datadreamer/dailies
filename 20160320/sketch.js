var zigzags = [];
var zigzagCount = 300;
var pointCount = 20;
var pointXSpacing = 20;
var pointYSpacing = 30;
var pointNoise = 5;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  fill(0);
  noStroke();
  var colors = [color(255,50,100), color(0,180,255), color(255)];
  for(var i=0; i<zigzagCount; i++){
    var xpos = random(0-pointCount*pointXSpacing, windowWidth);
    var ypos = random(-100, windowHeight+100);
    var c = colors[floor(random(colors.length))];
    zigzags.push(new ZigZag(xpos, ypos, c));
  }
}


function draw(){
  background(0,180,255);
  for(var i=0; i<zigzags.length; i++){
    zigzags[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function ZigZag(x, y, c){
  this.x = x;
  this.y = y;
  this.c = c;
  this.points = [];
  this.pointsTop = [];
  this.pointsBottom = [];
  for(var i=0; i<pointCount; i++){
    var xpos = i*pointXSpacing;
    var ypos = random(0-pointNoise,pointNoise);
    var pos = createVector(xpos, ypos);
    var toppos = createVector(xpos, ypos - random(pointYSpacing));
    var bottompos = createVector(xpos, ypos + random(pointYSpacing));
    this.points.push(pos);
    this.pointsTop.push(toppos);
    this.pointsBottom.push(bottompos);
  }
}

ZigZag.prototype = {
  constructor:ZigZag,

  draw:function(){
    this.handleMouse();
    push();
    translate(this.x, this.y);

    // black drop shadow version
    fill(0);
    beginShape();
    vertex(0-pointXSpacing, 0);
    for(var i=0; i<this.pointsBottom.length; i++){
      vertex(this.pointsBottom[i].x, this.pointsBottom[i].y);
    }
    vertex((this.pointsTop.length+1) * pointXSpacing, 0);
    for(var i=this.pointsBottom.length-1; i>=0; i--){
      vertex(this.pointsBottom[i].x+10, this.pointsBottom[i].y);
    }
    endShape(CLOSE);

    // color version
    fill(this.c);
    beginShape();
    vertex(0-pointXSpacing, 0);
    for(var i=0; i<this.pointsTop.length; i++){
      vertex(this.pointsTop[i].x, this.pointsTop[i].y);
    }
    vertex((this.pointsTop.length+1) * pointXSpacing, 0);
    for(var i=this.pointsBottom.length-1; i>=0; i--){
      vertex(this.pointsBottom[i].x, this.pointsBottom[i].y);
    }
    endShape(CLOSE);
    pop();
  },

  handleMouse:function(){
    var xdiff = this.x+(this.points.length*pointXSpacing/2) - mouseX;
    var ydiff = this.y - mouseY;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo < windowWidth/4){
      var norm = hypo / (windowWidth/4);
      for(var i=0; i<this.points.length; i++){
        // wiggle the points around based on mouse proximity
        this.pointsTop[i].y += random(-norm*2, norm*2);
        this.pointsBottom[i].y += random(-norm*2, norm*2);
        // prevent points from wiggling too far away from origin
        if(this.pointsTop[i].y < this.points[i].y-pointYSpacing){
          this.pointsTop[i].y = this.points[i].y-pointYSpacing;
        }
        if(this.pointsBottom[i].y > this.points[i].y+pointYSpacing){
          this.pointsBottom[i].y = this.points[i].y+pointYSpacing;
        }
        // prevent points from wiggling past the center points
        if(this.pointsTop[i].y > this.points[i].y){
          this.pointsTop[i].y = this.points[i].y;
        }
        if(this.pointsBottom[i].y < this.points[i].y){
          this.pointsBottom.y = this.points[i].y;
        }
      }
    }
  }
}
