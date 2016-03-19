var triangles = [];
var triangleWidth, triangleHeight;
var verticalSpacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  fill(0);
  triangleSpacing = windowWidth / 40;
  triangleWidth = triangleSpacing * 0.9;
  //triangleWidth = windowWidth / 50;
  triangleHeight = triangleWidth * 0.75;
  verticalSpacing = triangleHeight * 3;
  var xpos = triangleWidth/20;
  var ypos = verticalSpacing;
  while(ypos < windowHeight){
    while(xpos < windowWidth){
      var tri = new Triangle(xpos, ypos);
      triangles.push(tri);
      xpos += triangleSpacing;
    }
    xpos = triangleWidth/20;
    ypos += verticalSpacing;
  }
  console.log("Total triangles: "+ triangles.length);
}


function draw(){
  background(255);
  for(var i=0; i<triangles.length; i++){
    triangles[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}







function Triangle(x, y){
  this.x = x;
  this.y = y;
  this.topSize = 0;
  this.flipping = false;
  this.flipStart = millis();
  this.flipValue = 1;
  this.flipTarget = 1;
  this.flipPast = this.flipValue;
  this.flipDuration = random(250,1000);
  this.delaying = true;
  this.delayStart = millis();
  this.delayDuration = random(500,2000);
}

Triangle.prototype = {
  constructor:Triangle,

  draw:function(){
    this.handleDelaying();
    this.handleFlipping();
    this.handleMouse();
    push();
    translate(this.x, this.y);
    scale(1, this.flipValue);
    beginShape();
    vertex(0,0);
    //vertex(triangleWidth/2, triangleHeight);
    vertex(triangleWidth/2 - this.topSize, triangleHeight);
    vertex(triangleWidth/2 + this.topSize, triangleHeight);
    vertex(triangleWidth, 0);
    endShape(CLOSE);
    pop();
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delayDuration;
      if(p >= 1){
        this.delaying = false;
        this.flipping = true;
        this.flipPast = this.flipTarget;
        this.flipTarget *= -1;
        this.flipStart = millis();
        this.flipDuration = random(250,1000);
      }
    }
  },

  handleFlipping:function(){
    if(this.flipping){
      var p = (millis() - this.flipStart) / this.flipDuration;
      if(p >= 1){
        this.flipping = false;
        this.delaying = true;
        this.delayStart = millis();
        this.delayDuration = random(500,2000);
      } else {
        this.flipValue = ((this.flipTarget - this.flipPast) * this.sinProgress(p)) + this.flipPast;
      }
    }
  },

  handleMouse:function(){
    var xdiff = this.x - mouseX;
    var ydiff = this.y - mouseY;
    var hypo = sqrt(xdiff*xdiff + ydiff*ydiff);
    this.topSize = 0;
    if(hypo < windowWidth/4){
      this.topSize = ((1-(hypo / (windowWidth/4))) * triangleWidth) / 2;
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
