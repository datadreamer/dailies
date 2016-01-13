// Aaron Siegel wrote this for FADN303.net. (datadreamer.com 2016)

var points = []
var deadpoints = [];
var connectRadius = 0.25;
var fadeSpeed = 2;
var releaseRate = 10;
var lastRelease = 0;
var r, y, g, b;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  background(0);
  ellipseMode(CENTER);
  strokeWeight(2);
  r = color(255,0,0);
  y = color(255,255,0);
  g = color(0,255,0);
  b = color(0,0,255);
}

function draw(){
  background(0);
  for(var i=0; i<points.length; i++){
    // move and draw current
    points[i].move();
    points[i].draw();
    // check for dead points
    if(points[i].dead){
      deadpoints.push(points[i]);
    }
  }
  // remove the dead points from render list
  for(var n=0; n<deadpoints.length; n++){
    var index = points.indexOf(deadpoints[n]);
    if(index > -1){
      points.splice(index, 1);
    }
  }
  deadpoints = [];
  //console.log(points.length);
}

function getColor(pos){
  // returns a color value
  if(pos >= 0 && pos < 128){ // B to G
    return lerpColor(r, y, (pos / 128));
  } else{  // G to B
    return lerpColor(y, r, ((pos-128) / 128));
  }
}

function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function mouseMoved(){
  if(millis() - lastRelease > releaseRate){
    points.push(new Point(mouseX, mouseY));
    lastRelease = millis();
  }
}

function mousePressed(){
  for(var i=0; i<points.length; i++){
    points[i].force(mouseX, mouseY);
    points[i].c = color(255);
  }
}

function mouseDragged(){
  for(var i=0; i<points.length; i++){
    points[i].force(mouseX, mouseY);
    points[i].c = color(255);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Point(x, y){
  this.birth = millis();
  this.death = 0;
  this.lifespan = random(1000, 2000);
  this.deathspan = 1000;
  this.dead = false;
  this.dying = false;
  this.x = x;
  this.y = y;
  this.d = random(2, 10);
  this.c = getColor((millis() * 0.01) % 255);
  this.xvec = random(-1,1);
  this.yvec = random(-1,1);
  this.damping = 0.97;
  this.maxalpha = 255;
  this.alpha = this.maxalpha;
  this.angle = 0 - Math.atan2(this.xvec, this.yvec);
}

Point.prototype = {
  constructor: Point,

  draw:function(){
    //fill(red(this.c), green(this.c), blue(this.c), this.alpha);
    //ellipse(this.x, this.y, this.d, this.d);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    stroke(red(this.c), green(this.c), blue(this.c), this.alpha);
    line(0-this.d, 0, this.d, 0);
    pop();
  },

  force:function(forceX, forceY){
    var radius = windowWidth/5;
    var xdiff = this.x - forceX;
    var ydiff = this.y - forceY;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo < radius){
      var force = ((radius - hypo) / radius) * 5;
      this.xvec = (xdiff/hypo) * force;
      this.yvec = (ydiff/hypo) * force;
    }
  },

  getNormX(){
    return this.x / windowWidth;
  },

  getNormY(){
    return this.y / windowHeight;
  },

  move:function(){
    this.xvec += random(-0.1, 0.1);
    this.yvec += random(-0.1, 0.1);
    this.xvec *= this.damping;
    this.yvec *= this.damping;
    this.angle = 0 - Math.atan2(this.xvec, this.yvec);
    this.x += this.xvec;
    this.y += this.yvec;
    // kill this fucker if it goes outside the window
    if(millis() - this.birth > this.lifespan){
      if(!this.dying){
        this.dying = true;
        this.death = millis();
      }
    }
    // if dying, let it die
    if(this.dying){
      if(this.progress() < 1){
        this.alpha = this.maxalpha - (this.progress() * 255);
      } else {
        this.alpha = 0;
        this.dead = true;
      }
    }
  },

  progress:function(){
    return (millis() - this.death) / this.deathspan;
  }
}
