var zigzags = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  strokeWeight(windowHeight/40);
  //stroke(255,70,40);
  noFill();
  var ypos = 0;
  while(ypos < windowHeight + 100){
    var c = getColor((ypos / windowHeight) * 255);
    zigzags.push(new ZigZag(ypos, random(5000), c));
    ypos += windowHeight / 12;
  }
}

function draw(){
  background(255);
  for(var i=0; i<zigzags.length; i++){
    zigzags[i].draw();
  }
}

function getColor(pos){
  // returns a value from the CMY spectrum
  var cyan = color(0, 174, 239);
  var magenta = color(236, 0, 140);
  var yellow = color(255, 242, 0);
  if(pos >= 0 && pos < 85){ // C to M
    return lerpColor(cyan, magenta, (pos / 85));
  } else if(pos >= 85 && pos < 170){  // M to Y
    return lerpColor(magenta, yellow, ((pos-85) / 85));
  } else {  // Y to C
    return lerpColor(yellow, cyan, ((pos-170) / 85));
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

function ZigZag(y, delay, c){
  this.x = 0;
  this.y = y;
  this.c = c;
  //this.ygap = windowWidth / 15;
  this.xgap = windowWidth / 10;
  this.zig = windowWidth / 30;  // horizontal
  this.zag = windowWidth / 30;  // vertical
  this.delay = delay;
  this.points = [];
  this.releaseRate = random(300,700);
  this.lastRelease = 0;
  //this.ypos = 0-this.ygap;
  this.xpos = 0 - this.xgap;
  this.delayStart = 0;
  this.delaying = true;
  this.adding = true;
  this.left = true;
}

ZigZag.prototype = {
  constructor: ZigZag,

  draw:function(){
    if(this.delaying){
      if(millis() - this.delayStart > this.delay){
        this.delaying = false;
      }
    } else {
      // create a new point to draw zig zag
      if(this.adding){
        if(millis() - this.lastRelease > this.releaseRate){
          var ypos = 0;//random(0-this.zig, this.zig);
          if(this.left){
            ypos -= windowHeight/30;
          } else {
            ypos += windowHeight/30;
          }
          if(this.xpos > windowWidth + this.xgap*2){
            // zigzag has reached right of the screen, so stop adding
            this.adding = false;
          } else {
            // keep adding points to grow zigzag to right of the screen.
            var lastx = 0;
            var lasty = 0;
            if(this.points.length > 0){
              lastx = this.points[this.points.length-1].x;
              lasty = this.points[this.points.length-1].y;
            }
            //var p = new Point(lastx, lasty, xpos, this.ypos + random(0-this.zag, this.zag), this.releaseRate);
            var p = new Point(lastx, lasty, this.xpos, ypos, this.releaseRate);
            this.left =  !this.left;
            this.points.push(p);
            this.lastRelease = millis();
          }
          this.xpos += this.xgap;
        }
      } else {
        // remove points from top to bottom
        if(millis() - this.lastRelease > this.releaseRate){
          if(this.points.length == 0){
            this.xpos = 0-this.xgap;
            this.adding = true;
            this.delaying = true;
            this.delayStart = millis();
            this.delay = random(100, 2000);
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
    stroke(this.c);
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
