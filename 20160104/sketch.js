var points = []
var deadpoints = [];
var connectRadius = 0.25;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noFill();
  blendMode(MULTIPLY);
  background(255);
}

function draw(){
  //background(0,30,50);
  for(var i=0; i<points.length; i++){
    // move and draw current
    points[i].move();
    points[i].draw();
    // check other points to draw connections with
    noFill();
    for(var j=i+1; j<points.length; j++){
      var xdiff = points[i].getNormX() - points[j].getNormX();
      var ydiff = points[i].getNormY() - points[j].getNormY();
      dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
      if(dist < connectRadius){
        var midx = points[i].getNormX() - xdiff/2;
        var midy = points[i].getNormY() - ydiff/2;
        var a = (1 - (dist / connectRadius)) * 255;
        var c = getColor((millis() * 0.01) % 255);
        var angle = Math.atan2(xdiff/dist, ydiff/dist);
        stroke(red(c), green(c), blue(c), a);
        //line(points[i].x, points[i].y, points[j].x, points[j].y);
        push();
        translate(midx * windowWidth, midy * windowHeight);
        rotate(HALF_PI - angle);
        arc(0, 0, dist * windowWidth, dist * windowHeight, 0, PI);
        pop();
      }
    }
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
  points.push(new Point());
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Point(){
  this.birth = millis();
  this.death = 0;
  this.lifespan = random(2000, 5000);
  this.deathspan = 1000;
  this.dead = false;
  this.dying = false;
  this.x = mouseX;
  this.y = mouseY;
  this.d = random(windowWidth/10, windowWidth/3);
  this.xvec = random(-2,2);
  this.yvec = random(-2,2);
  this.damping = 0.997;
  this.maxalpha = 50;
  this.alpha = this.maxalpha;
  this.angle = 0 - Math.atan2(this.xvec, this.yvec);
}

Point.prototype = {
  constructor: Point,

  draw:function(){
    // var c = getColor((millis() * 0.01) % 255);
    // stroke(red(c), green(c), blue(c), this.alpha);
    // push();
    // translate(this.x, this.y);
    // rotate(this.angle);
    // arc(0, 0, this.d, this.d, 0, PI);
    // pop();
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
    if((this.x > windowWidth || this.x < 0) || (this.y < 0 || this.x > windowHeight)){
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
