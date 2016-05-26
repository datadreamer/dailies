var waves = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  waves.push(new Wave(windowHeight/2, color(0,255,255,32)));
  waves.push(new Wave(windowHeight/2 + 10, color(255,0,255,32)));
  waves.push(new Wave(windowHeight/2 + 20, color(255,255,0,32)));
  waves.push(new Wave(windowHeight/2 + 30, color(0,255,255,64)));
  waves.push(new Wave(windowHeight/2 + 40, color(255,0,255,64)));
  waves.push(new Wave(windowHeight/2 + 50, color(255,255,0,64)));
  waves.push(new Wave(windowHeight/2 + 60, color(0,255,255)));
  waves.push(new Wave(windowHeight/2 + 70, color(255,0,255)));
  waves.push(new Wave(windowHeight/2 + 80, color(255,255,0)));
  noStroke();
  fill(0);
  rectMode(CENTER);
}

function draw(){
  blendMode(NORMAL);
  background(255);
  blendMode(MULTIPLY);
  for(var i=0; i<waves.length; i++){
    waves[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Wave(y, c){
  this.y = y;
  this.c = c;
  this.points = [];
  this.detail = 30;
  for(var i=0; i<=this.detail; i++){
    var xpos = windowWidth * (i/this.detail);
    var ypos = y;
    this.points.push(new WavePoint(xpos, ypos));
  }
}

Wave.prototype= {
  constructor:Wave,

  draw:function(){
    fill(this.c);
    beginShape();
    for(var i=0; i<this.points.length; i++){
      this.points[i].draw();
      vertex(this.points[i].x, this.points[i].y);
    }
    vertex(windowWidth, this.y);
    vertex(windowWidth, windowHeight);
    vertex(0, windowHeight);
    vertex(0, this.y);
    endShape(CLOSE);
  }
}




function WavePoint(x, y){
  this.x = x;
  this.y = y;
  this.homeX = x;
  this.homeY = y;
  this.xvec = 0;
  this.yvec = 0;
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
