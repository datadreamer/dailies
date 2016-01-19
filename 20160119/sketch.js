var zigzags = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(4);
  stroke(255);
  noFill();
  var xpos = 0;
  while(xpos < windowWidth){
    zigzags.push(new ZigZag(xpos, random(5000)));
    xpos += windowWidth / 12;
  }
}

function draw(){
  background(0);
  for(var i=0; i<zigzags.length; i++){
    zigzags[i].draw();
  }
}

function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function mousePressed(){

}

function mouseDragged(){

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function ZigZag(x, delay){
  this.x = x;
  this.y = 0;
  this.ygap = windowWidth / 50;
  this.zig = windowWidth / 30;  // horizontal
  this.zag = windowWidth / 50;  // vertical
  this.delay = delay;
  this.points = [];
  this.releaseRate = 100;
  this.lastRelease = 0;
  this.ypos = 0-this.ygap;
  this.delaying = true;
  this.adding = true;
}

ZigZag.prototype = {
  constructor: ZigZag,

  draw:function(){
    if(this.delaying){
      if(millis() > this.delay){
        this.delaying = false;
      }
    } else {
      // create a new point to draw zig zag
      if(this.adding){
        if(millis() - this.lastRelease > this.releaseRate){
          var xpos = random(0-this.zig, this.zig);
          if(this.ypos > windowHeight + this.ygap*2){
            // zigzag has reached bottom of the screen, so stop adding
            this.adding = false;
          } else {
            // keep adding points to grow zigzag to bottom of the screen.
            var lastx = 0;
            var lasty = 0;
            if(this.points.length > 0){
              lastx = this.points[this.points.length-1].x;
              lasty = this.points[this.points.length-1].y;
            }
            var p = new Point(lastx, lasty, xpos, this.ypos + random(0-this.zag, this.zag), this.releaseRate);
            this.points.push(p);
            this.lastRelease = millis();
          }
          this.ypos += this.ygap;
        }
      } else {
        // remove points from top to bottom
        if(millis() - this.lastRelease > this.releaseRate){
          if(this.points.length == 0){
            this.ypos = 0-this.ygap;
            this.adding = true;
          } else {
            this.points.shift();
            if(this.points.length > 1){
              this.points[0].moveTo(this.points[1].x, this.points[1].y);
            }
          }
          this.lastRelease = millis();
        }
      }
    }

    // draw points connected with a line
    push();
    translate(this.x, this.y);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      this.points[i].move();
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
    pop();
  }
}

function Point(x, y, targetX, targetY, duration){
  this.x = x;
  this.y = y;
  this.pastX = x;
  this.pastY = y;
  this.targetX = targetX;
  this.targetY = targetY;
  this.moving = true;
  this.moveStart = millis();
  this.duration = duration;
}

Point.prototype = {
  constructor: Point,

  move:function(){
    if(this.moving){
      var progress = (millis() - this.moveStart) / this.duration;
      if(progress < 1){
        this.x = ((this.targetX - this.pastX) * progress) + this.pastX;
        this.y = ((this.targetY - this.pastY) * progress) + this.pastY;
      } else {
        this.x = this.targetX;
        this.y = this.targetY;
        this.moving = false;
      }
    }
  },

  moveTo:function(tx, ty){
    this.pastX = this.x;
    this.pastY = this.y;
    this.targetX = tx;
    this.targetY = ty;
    this.moving = true;
    this.moveStart = millis();
  }
}
