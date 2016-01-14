var points = []
var deadpoints = [];
var connectRadius = 0.25;
var fadeSpeed = 2;
var releaseRate = 100;
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
}

function draw(){
  background(0);
  // release new points
  if(millis() - lastRelease > releaseRate){
    points.push(new Point(random(windowWidth), random(windowHeight)));
    lastRelease = millis();
  }
  for(var i=0; i<points.length; i++){
    // move and draw current
    points[i].gravity();
    points[i].antigravity();
    points[i].spin();
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

function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function mouseMoved(){

}

function mousePressed(){

}

function mouseDragged(){

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Point(x, y){
  this.birth = millis();
  this.death = 0;
  this.lifespan = random(5000, 7000);
  this.deathspan = 1000;
  this.dead = false;
  this.dying = false;
  this.x = x;
  this.y = y;
  this.d = random(2, 10);
  this.c = color(255);
  this.xvec = 0;
  this.yvec = 0;
  this.damping = 0.95;
  this.maxalpha = 255;
  this.alpha = this.maxalpha;
  this.angle = 0 - Math.atan2(this.xvec, this.yvec);
}

Point.prototype = {
  constructor: Point,

  draw:function(){
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

  gravity:function(){
    // apply gravity towards cursor
    var radius = windowWidth/5;
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo > radius){
      this.xvec += (xdiff / hypo) * ((hypo - radius) * 0.002);
      this.yvec += (ydiff / hypo) * ((hypo - radius) * 0.002);
    }
  },

  antigravity:function(){
    // push point away from cursor when too close
    var radius = windowWidth/7;
    var xdiff = this.x - mouseX;
    var ydiff = this.y - mouseY;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo < radius){
      this.xvec += 0 - ((xdiff / hypo) * ((hypo - radius) * 0.002));
      this.yvec += 0 - ((ydiff / hypo) * ((hypo - radius) * 0.002));
    }
  },

  spin:function(){
    // apply tiny force perpindicular to vector between cursor and point
    //var radius = windowWidth/5;
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    this.xvec += 0 - (ydiff / hypo) * 0.1;// * ((hypo - radius) * 0.002);
    this.yvec += (xdiff / hypo) * 0.1;// * ((hypo - radius) * 0.002);
  },

  getNormX(){
    return this.x / windowWidth;
  },

  getNormY(){
    return this.y / windowHeight;
  },

  move:function(){
    this.xvec *= this.damping;
    this.yvec *= this.damping;
    this.angle = 0 - Math.atan2(this.xvec, this.yvec);
    this.x += this.xvec;
    this.y += this.yvec;
    // kill this fucker if it gets too old
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
