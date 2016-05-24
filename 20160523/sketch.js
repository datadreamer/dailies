var rings = [];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  rings.push(new Ring(color(255,0,0,32)));
  rings.push(new Ring(color(0,255,0,32)));
  rings.push(new Ring(color(0,0,255,32)));
  rings.push(new Ring(color(255,0,0,32)));
  rings.push(new Ring(color(0,255,0,32)));
  rings.push(new Ring(color(0,0,255,32)));
  noFill();
  stroke(255);
}

function draw(){
  blendMode(NORMAL);
  background(0);
  blendMode(SCREEN);
  for(var i=0; i<rings.length; i++){
    rings[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Ring(c){
  this.c = c;
  this.x = random(windowWidth);//windowWidth/2;
  this.y = random(windowHeight);//windowHeight/2;
  this.xvec = 0;
  this.yvec = 0;
  this.damping = 0.97;
  this.d = windowWidth * 0.5;
}

Ring.prototype = {
  constructor:Ring,

  draw:function(){
    stroke(this.c);
    strokeWeight(windowWidth * 0.05);
    ellipse(this.x, this.y, this.d, this.d);
    strokeWeight(windowWidth * 0.025);
    ellipse(this.x, this.y, this.d, this.d);
    strokeWeight(windowWidth * 0.01);
    ellipse(this.x, this.y, this.d, this.d);
    strokeWeight(windowWidth * 0.005);
    ellipse(this.x, this.y, this.d, this.d);

    // apply gravity (further = stronger)
    var xdiff = (windowWidth/2) - this.x;
    var ydiff = (windowHeight/2) - this.y;
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
      force *= 3;
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
