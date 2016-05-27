var waves = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  waves.push(new Wave(windowHeight/2, windowHeight * 0.1, color(255,0,0)));
  waves.push(new Wave(windowHeight/2, windowHeight * 0.1, color(0,255,0)));
  waves.push(new Wave(windowHeight/2, windowHeight * 0.1, color(0,0,255)));
  noStroke();
  fill(0);
  rectMode(CENTER);
}

function draw(){
  blendMode(NORMAL);
  background(0);
  blendMode(SCREEN);
  for(var i=0; i<waves.length; i++){
    waves[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Wave(y, h, c){
  this.y = y;
  this.h = h;
  this.c = c;
  this.topPoints = [];
  this.bottomPoints = [];
  this.detail = 30;
  // top row (left to right)
  for(var i=0; i<=this.detail; i++){
    var xpos = windowWidth * (i/this.detail);
    var ypos = y - (h/2);
    this.topPoints.push(new WavePoint(xpos, ypos));
  }
  // bottom row (right to left)
  for(var i=this.detail; i>=0; i--){
    var xpos = windowWidth * (i/this.detail);
    var ypos = y + (h/2);
    this.bottomPoints.push(new WavePoint(xpos, ypos));
  }
}

Wave.prototype= {
  constructor:Wave,

  draw:function(){
    fill(this.c);
    beginShape();
    for(var i=0; i<this.topPoints.length; i++){
      this.topPoints[i].draw();
      vertex(this.topPoints[i].x, this.topPoints[i].y);
    }
    vertex(windowWidth, this.y - (this.h/2));
    vertex(windowWidth, this.y + (this.h/2));
    for(var i=0; i<this.bottomPoints.length; i++){
      this.bottomPoints[i].draw();
      vertex(this.bottomPoints[i].x, this.bottomPoints[i].y);
    }
    vertex(0, this.y + (this.h/2));
    vertex(0, this.y - (this.h/2));
    endShape(CLOSE);
  }
}




function WavePoint(x, y){
  this.x = x;
  this.y = y;
  this.homeX = x;
  this.homeY = y;
  this.xvec = random(-1,1);
  this.yvec = random(-1,1);
  this.damping = 0.97;
}

WavePoint.prototype = {
  constructor:WavePoint,

  draw:function(){
    //rect(this.x, this.y, 10, 10);

    // apply gravity (further = stronger)
    var xdiff = this.homeX - this.x;
    var ydiff = this.homeY - this.y;
    var dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    if(dist != 0){
      var xforce = xdiff/dist;
      var yforce = ydiff/dist;
      this.xvec += xforce;
      this.yvec += yforce;
    }

    // repel from cursor (further = weaker)
    xdiff = mouseX - this.x;
    ydiff = mouseY - this.y;
    dist = sqrt(xdiff*xdiff + ydiff*ydiff);
    var force = ((windowWidth/2) - dist) * 0.001;
    if(mouseIsPressed){
      force *= 2;
    }
    if(force != 0){
      xforce = xdiff/dist;
      yforce = ydiff/dist;
      this.xvec -= xforce * force;
      this.yvec -= yforce * force;
    }

    // dampen vector
    this.xvec *= this.damping;
    this.yvec *= this.damping;

    // apply vector to position
    this.x += this.xvec;
    this.y += this.yvec;
  }
}
