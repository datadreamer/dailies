var points = []
var deadpoints = [];
var connectRadius = 0.25;
var fadeSpeed = 2;
var r, y, g, b;
var spread;

var trace = [
  [11,9,11,"2606:6000:61c6:da00:16cf:e2ff:feab:7e57"],
  [20,18,19,"2605:e000:5fc0:7f::1"],
  [21,19,19,"2605:e000:0:4::6:601"],
  [17,18,19,"2605:e000:0:4::6:e4"],
  [,,,"Request timed out."],
  [,,,"Request timed out."],
  [20,17,29,"2001:1998:0:4::38b"],
  [38,41,37,"if-ae24.0.tcore1.LVW-Los-Angeles.ipv6.as6453.net (2001:5a0:fff0::41)"],
  [540,539,559,"2001:4860:1:1:0:1935:0:51"],
  [39,27,29,"2001:4860::1:0:6b02"],
  [27,29,32,"2001:4860:0:1::39d"],
  [220,219,209,"lax17s04-in-x0e.1e100.net (2607:f8b0:4007:807::200e)"]
];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  textAlign(CENTER);
  strokeWeight(2);

  // go through trace path and create points
  spread = windowWidth / (trace.length + 1);
  for(var i=0; i<trace.length; i++){
    var xpos = i*spread + spread;
    var ypos = windowHeight/2;
    var c = getColor((xpos/windowWidth) * 160);
    points.push(new Point(xpos, ypos, trace[i][3], c));
  }
}

function draw(){
  background(0);
  for(var i=0; i<points.length; i++){
    // move and draw lines connecting consecutive points
    points[i].move();
    if(i < points.length-1){
      stroke(255);
      line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      spring(points[i], points[i+1]);
    }
  }
  for(var i=0; i<points.length; i++){
    // draw points themselves
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
  // returns a value from the RGB spectrum
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

function spring(pointA, pointB){
  var xdiff = pointA.x - pointB.x;
  var ydiff = pointA.y - pointB.y;
  var hypo = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
  if(hypo > spread){
    var springforce = (hypo - spread) * 0.001;
    //var invforce = 1 - hypo/radius;
    pointA.xvec -= springforce * (xdiff/hypo);
    pointA.yvec -= springforce * (ydiff/hypo);
    pointB.xvec += springforce * (xdiff/hypo);
    pointB.yvec += springforce * (ydiff/hypo);
  }
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
  }
}

function mouseDragged(){
  for(var i=0; i<points.length; i++){
    points[i].force(mouseX, mouseY);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Point(x, y, title, c){
  this.birth = millis();
  this.death = 0;
  this.lifespan = random(7500, 10000);
  this.deathspan = 1000;
  this.dead = false;
  this.dying = false;
  this.x = x;
  this.y = y;
  this.title = title;
  this.d = 10;
  this.t = random(1, 6);
  this.c = c;
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
    fill(0);
    stroke(this.c);
    ellipse(this.x, this.y, this.d, this.d);
    fill(255,128);
    noStroke();
    text(this.title, this.x, this.y + 20);
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
    // if(millis() - this.birth > this.lifespan){
    //   if(!this.dying){
    //     this.dying = true;
    //     this.death = millis();
    //   }
    // }
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
