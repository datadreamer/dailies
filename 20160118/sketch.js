var points = []
var deadpoints = [];
var connectRadius = 0.25;
var fadeSpeed = 2;
var r, y, g, b;
var spread;
var chartScale = 5;
var releaseRate = 200;
var lastRelease = 0;

var trace2 = [
  [12,7,3,"192.168.0.1"],
  [23,20,25,"cpe-108-185-208-1.socal.res.rr.com [108.185.208.1]"],
  [13,19,18,"tge0-10-0-0.lsaicaev02h.socal.rr.com [24.30.168.121]"],
  [30,19,17,"agg11.lsaicaev02r.socal.rr.com [72.129.18.194]"],
  [24,29,29,"agg26.tustcaft01r.socal.rr.com [72.129.17.2]"],
  [24,22,26,"bu-ether16.tustca4200w-bcr00.tbone.rr.com [66.109.6.64]"],
  [26,27,49,"0.ae3.pr1.lax10.tbone.rr.com [107.14.19.56]"],
  [26,29,29,"216.156.65.225.ptr.us.xo.net [216.156.65.225]"],
  [27,30,28,"be3055.ccr23.lax05.atlas.cogentco.com [154.54.11.65]"],
  [39,69,29,"be2180.ccr21.lax01.atlas.cogentco.com [154.54.41.57]"],
  [37,29,39,"be2160.ccr21.sjc01.atlas.cogentco.com [154.54.27.162]"],
  [37,39,40,"be2164.ccr21.sfo01.atlas.cogentco.com [154.54.28.33]"],
  [57,59,60,"be2086.ccr21.slc01.atlas.cogentco.com [154.54.3.186]"],
  [58,49,59,"38.104.174.198"],
  [59,56,59,"prv-211-1-1-2.unifiedlayer.com [69.27.175.147]"],
  [47,59,62,"162-144-240-149.unifiedlayer.com [162.144.240.149]"],
  [57,59,61,"162-144-240-85.unifiedlayer.com [162.144.240.85]"],
  [58,59,62,"192.185.225.92"]
];

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  ellipseMode(CENTER);
  textSize(10);
  strokeWeight(2);

  // go through trace path and create points
  spread = windowWidth / (trace2.length + 1);
  // for(var i=0; i<trace2.length; i++){
  //   var xpos = i*spread + spread;
  //   var ypos = windowHeight/2;
  //   var c = getColor((xpos/windowWidth) * 160);
  //   points.push(new Point(xpos, ypos, trace2[i], c));
  // }
}

function draw(){
  background(0);
  drawGrid();

  // release points if there are still some to make
  if(points.length < trace2.length){
    if(millis() - lastRelease > releaseRate){
      var xpos = points.length * spread + spread;
      var ypos = windowHeight/2;
      var c = getColor((xpos/windowWidth) * 160);
      var p = new Point(xpos, ypos, trace2[points.length], c);
      if(trace2[points.length][0] != undefined){
        ypos -= trace2[points.length][0] * chartScale;
      }
      p.moveTo(xpos, ypos);
      points.push(p);
      lastRelease = millis();
    }
  }

  // move and draw lines connecting consecutive points
  for(var i=0; i<points.length; i++){
    points[i].move();
    if(i < points.length-1){
      stroke(255, points[i+1].alpha);
      line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      //spring(points[i], points[i+1]);
    }
  }

  // draw points themselves
  for(var i=0; i<points.length; i++){
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

function drawGrid(){
  var ypos = windowHeight/2;
  var ms = 0;
  var gap = 100;
  while(ypos > 0){
    stroke(20);
    line(0,ypos,windowWidth,ypos);
    noStroke();
    fill(100);
    text(ms+"ms", 5, ypos - 5);
    ypos -= gap;
    ms += gap / chartScale;
  }
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
  // for(var i=0; i<points.length; i++){
  //   points[i].force(mouseX, mouseY);
  // }
}

function mouseDragged(){
  // for(var i=0; i<points.length; i++){
  //   points[i].force(mouseX, mouseY);
  // }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


/* CLASSES */

function Point(x, y, data, c){
  this.birth = millis();
  this.death = 0;
  this.lifespan = random(7500, 10000);
  this.deathspan = 1000;
  this.dead = false;
  this.dying = false;
  this.x = x;
  this.y = y;
  this.targetX = x;
  this.targetY = y;
  this.pastX = x;
  this.pastY = y;
  this.moving = false;
  this.moveStart = 0;
  this.moveDuration = 1000;
  this.data = data;
  this.d = 10;
  this.t = random(1, 6);
  this.c = c;
  this.xvec = 0;
  this.yvec = 0;
  this.damping = 0.95;
  this.maxalpha = 255;
  this.alpha = 0;
  this.angle = 0 - Math.atan2(this.xvec, this.yvec);
  this.twist = 0;
}

Point.prototype = {
  constructor: Point,

  draw:function(){
    if(this.alpha < this.maxalpha){
      this.alpha += 5;
    }
    fill(0, this.alpha);
    stroke(red(this.c), green(this.c), blue(this.c), this.alpha);
    ellipse(this.x, this.y, this.d, this.d);
    fill(255,128 * (this.alpha/255));
    noStroke();
    push();
    translate(this.x - 4, this.y + 15);
    rotate(HALF_PI);
    text(this.data[3], 0, 0);
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

  getNormX(){
    return this.x / windowWidth;
  },

  getNormY(){
    return this.y / windowHeight;
  },

  move:function(){
    if(this.moving){
      if(millis() - this.moveStart > this.moveDuration){
        this.x = this.targetX;
        this.y = this.targetY;
        this.moving = false;
      } else {
        var progress = ((millis() - this.moveStart) / this.moveDuration);
        var sinprogress = (1 - (Math.cos(PI * progress) / 2 - 0.5)) - 1;
        this.x = (sinprogress * (this.targetX - this.pastX)) + this.pastX;
        this.y = (sinprogress * (this.targetY - this.pastY)) + this.pastY;
      }
    }
    //this.xvec += random(-0.1, 0.1);
    //this.yvec += random(-0.1, 0.1);
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
    //,this.dying = true;
    //,this.death = millis();
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

  moveTo:function(tx, ty){
    this.targetX = tx;
    this.targetY = ty;
    this.pastX = this.x;
    this.pastY = this.y;
    this.moving = true;
    this.moveStart = millis();
  },

  progress:function(){
    return (millis() - this.death) / this.deathspan;
  }
}
