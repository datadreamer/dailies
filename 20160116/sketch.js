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
  rectMode(CENTER);
  strokeWeight(2);
}

function draw(){
  background(0,0,0,10);
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
    for(var j=i+1; j<points.length; j++){
      magnetism(points[i], points[j]);
    }
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
  // returns a value from the CMY spectrum
  var red = color(255,0,0);
  var green = color(0,255,0);
  var blue = color(0,0,255);
  if(pos >= 0 && pos < 85){ // C to M
    return lerpColor(red, green, (pos / 85));
  } else if(pos >= 85 && pos < 170){  // M to Y
    return lerpColor(green, blue, ((pos-85) / 85));
  } else {  // Y to C
    return lerpColor(blue, red, ((pos-170) / 85));
  }
}

function getMouseX(){
  return mouseX / windowWidth;
}

function getMouseY(){
  return mouseY / windowHeight;
}

function magnetism(pointA, pointB){
  var xdiff = pointA.x - pointB.x;
  var ydiff = pointA.y - pointB.y;
  var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
  var radius = 50;
  if(hypo < radius){
    var invforce = 1 - hypo/radius;
    pointA.xvec += invforce * (xdiff/hypo);
    pointA.yvec += invforce * (ydiff/hypo);
    pointB.xvec -= invforce * (xdiff/hypo);
    pointB.yvec -= invforce * (ydiff/hypo);
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
  this.lifespan = random(7500, 10000);
  this.deathspan = 1000;
  this.dead = false;
  this.dying = false;
  this.x = x;
  this.y = y;
  this.d = random(2, 50);
  this.t = random(1, 6);
  this.c = getColor((millis() * 0.01) % 255);
  this.xvec = 0;
  this.yvec = 0;
  this.damping = 0.95;
  this.maxalpha = 255;
  this.alpha = this.maxalpha;
  this.angle = 0 - Math.atan2(this.xvec, this.yvec);
  this.twist = 0;
}

Point.prototype = {
  constructor: Point,

  draw:function(){
    push();
    translate(this.x, this.y);
    rotate(this.angle + this.twist);
    fill(red(this.c), green(this.c), blue(this.c), this.alpha);
    //rect(0,0,this.d,this.t);
    beginShape();
    vertex(0,0);
    vertex(this.d,this.t);
    vertex(this.d,0-this.t);
    endShape(CLOSE);
    pop();
  },

  force:function(forceX, forceY){
    var radius = windowWidth/4;
    var xdiff = this.x - forceX;
    var ydiff = this.y - forceY;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    if(hypo < radius){
      var force = ((radius - hypo) / radius) * 30;
      this.xvec = (xdiff/hypo) * force;
      this.yvec = (ydiff/hypo) * force;
      this.twist = HALF_PI;
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
    var radius = windowWidth/10;
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
    //this.angle = 0 - Math.atan2(this.xvec, this.yvec);
    var xdiff = mouseX - this.x;
    var ydiff = mouseY - this.y;
    var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    this.angle = 0 - Math.atan2(xdiff/hypo, ydiff/hypo);
    this.x += this.xvec;
    this.y += this.yvec;
    // if twisted, untwist a little
    if(this.twist > 0){
      this.twist -= 0.01;
    }
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
