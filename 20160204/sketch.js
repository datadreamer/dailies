var elements = [];
var xCount = 10;
var yCount = 10;
var boxWidth, boxHeight;
var expandMin = 1000;
var expandMax = 2000;
var numPoints = 10; // points per edge

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  noFill();
  rectMode(CENTER);
  boxWidth = windowWidth / xCount;
  boxHeight = windowHeight / yCount;
  //elements.push(new Element(windowWidth/2, windowHeight/2, 0));
  var delay = 0;
  for(var y=0; y<yCount; y++){
    var r = y/yCount * 255;
    for(var x=0; x<xCount; x++){
      var b = x/xCount * 255;
      var xpos = x * boxWidth;
      var ypos = y * boxHeight;
      elements.push(new Element(xpos, ypos, delay, color(255, 255-r, b)));
      delay += 5;
    }
  }
}

function draw(){
  background(0);
  push();
  translate(boxWidth/2, boxHeight/2);
  for(var i=0; i<elements.length; i++){
    elements[i].draw();
  }
  pop();
}

function mouseDragged(){
  mouseMoved();
}

function mousePressed(){
  mouseMoved();
}

function mouseMoved(){
  for(var i=0; i<elements.length; i++){
    if(elements[i].isOver(mouseX - boxWidth/2, mouseY - boxHeight/2)){
      // make this element animate
      if(!elements[i].expanding && !elements[i].contracting){
        elements[i].expand();
        break;
      }
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  boxWidth = windowWidth / xCount;
  boxHeight = windowHeight / yCount;
}





function Element(x, y, delay, c){
  this.x = x;
  this.y = y;
  this.durationDelay = delay;
  this.c = c;
  this.durationSpin = 2000;
  this.durationExpand = expandMax;
  this.durationContract = expandMax;
  this.delayStart = millis();
  this.spinStart = millis();
  this.expandStart = millis();
  this.contractStart = millis();
  this.w = windowWidth/xCount;
  this.h = 1;
  this.alpha = 255;
  this.angle = 0;//0 - HALF_PI;
  this.delaying = false;
  this.spinning = false;
  this.expanding = false;
  this.contracting = false;

  this.points = [];
  this.pointsExpanded = [];
  this.pointsDuration = [];
  var xpos = 0;
  var ypos = 0;
  var vec = createVector(0,0);
  for(var i=0; i<4; i++){             // for each edge...
    for(var n=0; n<numPoints; n++){   // for each point on edge...
      if(i==0){                       // move left
        xpos = ((n/numPoints) * boxWidth) - (boxWidth/2);
        ypos = 0-boxHeight/2;
      } else if(i==1){                // move down
        xpos = boxWidth/2;
        ypos = ((n/numPoints) * boxHeight) - (boxHeight/2);
      } else if(i==2){                // move right
        xpos = (boxWidth/2) - ((n/numPoints) * boxWidth);
        ypos = boxHeight/2;
      } else {                        // move up
        xpos = 0-boxWidth/2;
        ypos = (boxHeight/2) - ((n/numPoints) * boxHeight);
      }
      vec = createVector(xpos, ypos);
      this.pointsExpanded.push(vec);
      this.points.push(createVector(0,0));
      this.pointsDuration.push(random(expandMin,expandMax));
    }
  }
}

Element.prototype = {
  constructor:Element,

  draw:function(){
    this.handleDelaying();
    this.handleSpinning();
    this.handleExpanding();
    this.handleContracting();
    stroke(red(this.c), green(this.c), blue(this.c), this.alpha);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape(CLOSE);
    pop();
  },

  expand:function(){
    this.expanding = true;
    this.expandStart = millis();
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.durationDelay;
      if(p >= 1){
        this.delaying = false;
        this.spinning = true;
        this.spinStart = millis();
      } else {
        // just wait...
      }
    }
  },

  handleSpinning:function(){
    if(this.spinning){
      var p = (millis() - this.spinStart) / this.durationSpin;
      var sp = this.sinProgress(p);
      if(p >= 1){
        this.angle = PI;
        this.spinning = false;
        this.expanding = true;
        this.expandStart = millis();
      } else {
        this.angle = (sp * (PI + HALF_PI)) - HALF_PI;
      }
    }
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandStart) / this.durationExpand;
      if(p >= 1){
        for(var i=0; i<this.points.length; i++){
          this.points[i].x = this.pointsExpanded[i].x;
          this.points[i].y = this.pointsExpanded[i].y;
        }
        // randomize timing
        for(var i=0; i<this.pointsDuration.length; i++){
          this.pointsDuration[i] = random(expandMin,expandMax);
        }
        this.expanding = false;
        this.contracting = true;
        this.contractStart = millis();
      } else {
        for(var i=0; i<this.points.length; i++){
          var progress = (millis() - this.expandStart) / this.pointsDuration[i];
          if(progress < 1){
            var sp = this.sinProgress(progress);
            this.points[i].x = this.pointsExpanded[i].x * sp;
            this.points[i].y = this.pointsExpanded[i].y * sp;
          }
        }
      }
    }
  },

  handleContracting:function(){
    if(this.contracting){
      var p = (millis() - this.contractStart) / this.durationContract;
      var sp = this.sinProgress(p);
      if(p >= 1){
        for(var i=0; i<this.points.length; i++){
          this.points[i].x = 0;
          this.points[i].y = 0;
        }
        // randomize timing
        for(var i=0; i<this.pointsDuration.length; i++){
          this.pointsDuration[i] = random(expandMin,expandMax);
        }
        this.contracting = false;
        //this.delaying = true;
        //this.delayStart = millis();
      } else {
        for(var i=0; i<this.points.length; i++){
          var progress = (millis() - this.contractStart) / this.pointsDuration[i];
          if(progress < 1){
            var sp = this.sinProgress(progress);
            this.points[i].x = this.pointsExpanded[i].x * (1 - sp);
            this.points[i].y = this.pointsExpanded[i].y * (1 - sp);
          }
        }
      }
    }
  },

  isOver:function(x, y){
    if((x > this.x - boxWidth/2) && (x < this.x + boxWidth/2)){
      if((y > this.y - boxHeight/2) && (y < this.y + boxWidth/2)){
        return true;
      }
    }
    return false;
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }

}
