var points = []
var deadpoints = [];
var connectRadius = 0.25;
var fadeSpeed = 2;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  noStroke();
  background(0);
  blendMode(SCREEN);
}

function draw(){
  for(var i=0; i<points.length; i++){
    // move and draw current
    points[i].move();
    points[i].draw();
    // check other points to draw connections with
    for(var j=i+1; j<points.length; j++){
      var xdiff = points[i].getNormX() - points[j].getNormX();
      var ydiff = points[i].getNormY() - points[j].getNormY();
      var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
      var angle = 0 - Math.atan2(xdiff/dist, ydiff/dist);
      if(dist < connectRadius){
        var midx = points[i].getNormX() - xdiff/2;
        var midy = points[i].getNormY() - ydiff/2;
        var a = (1 - (dist / connectRadius)) * 255;
        var colorA = color(red(points[i].c), green(points[i].c), blue(points[i].c), a);
        var colorB = color(red(points[j].c), green(points[j].c), blue(points[j].c), a);
        //drawPoly(points[i], points[j], xdiff, ydiff, colorA, colorB);
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

function drawPoly(pointA, pointB, xdiff, ydiff, colorA, colorB){
  var grad = this.drawingContext.createLinearGradient(pointA.x, pointA.y, pointB.x, pointB.y);
  grad.addColorStop(0, colorA);
  grad.addColorStop(1, colorB);
  this.drawingContext.fillStyle = grad;

  var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
  var linehalf = pointA.d / 2;
  var xvec = ydiff/dist;
  var yvec = 0 - xdiff/dist;
  var xdist = xvec * linehalf;
  var ydist = yvec * linehalf;

  this.drawingContext.beginPath();
  this.drawingContext.moveTo(pointA.x + xdist, pointA.y + ydist);
  this.drawingContext.lineTo(pointA.x - xdist, pointA.y - ydist);

  linehalf = pointB.d / 2;
  xdist = xvec * linehalf;
  ydist = yvec * linehalf;

  this.drawingContext.lineTo(pointB.x - xdist, pointB.y - ydist);
  this.drawingContext.lineTo(pointB.x + xdist, pointB.y + ydist);
  this.drawingContext.closePath();
  this.drawingContext.fill();
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

function gradientLine(x1, y1, x2, y2, color1, color2) {
  // linear gradient from start to end of line
  var grad = this.drawingContext.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  this.drawingContext.strokeStyle = grad;
  line(x1, y1, x2, y2);
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
  this.d = random(10,20);
  //this.x = random(0, windowWidth);
  this.x = windowWidth/2;
  this.y = windowHeight - this.d/2;
  this.c = getColor((millis() * 0.01) % 255);
  this.xvec = random(-20,20);
  this.yvec = random(-30,-2);
  this.damping = 0.997;
  this.maxalpha = 50;
  this.alpha = this.maxalpha;
  this.angle = 0 - Math.atan2(this.xvec, this.yvec);
  this.gravity = 0.2;
}

Point.prototype = {
  constructor: Point,

  draw:function(){
    fill(red(this.c), green(this.c), blue(this.c), this.alpha);
    ellipse(this.x, this.y, this.d, this.d);
  },

  getNormX(){
    return this.x / windowWidth;
  },

  getNormY(){
    return this.y / windowHeight;
  },

  move:function(){
    //this.xvec += random(-0.1, 0.1);
    //this.yvec += random(-0.1, 0.1);
    this.yvec += this.gravity;
    this.xvec *= this.damping;
    this.yvec *= this.damping;
    this.angle = 0 - Math.atan2(this.xvec, this.yvec);
    this.x += this.xvec;
    this.y += this.yvec;
    this.d *= this.damping; // decay size
    // kill this fucker if it goes outside the window
    // if((this.x > windowWidth || this.x < 0) || (this.y < 0 || this.x > windowHeight)){
    //   if(!this.dying){
    //     this.dying = true;
    //     this.death = millis();
    //   }
    // }
    // bounce off the floor.
    if(this.y > windowHeight - this.d/2){
      this.yvec *= -1;
      this.y = windowHeight - this.d/2;
    }
    // bounce off the walls.
    if(this.x < this.d/2){
      this.xvec *= -1;
      this.x = this.d/2;
    } else if(this.x > windowWidth - this.d/2){
      this.xvec *= -1;
      this.x = windowWidth - this.d/2;
    }
    // reduce alpha gradually for whatever fuck you
    if(this.alpha > 0){
      this.alpha -= 0.5;
    }
    // kill this point when it gets below a pixel diameter
    if(this.d < 1){
      if(!this.dead){
        this.dead = true;
        //this.death = millis();
      }
    }
    // if dying, let it die
    // if(this.dying){
    //   if(this.progress() < 1){
    //     this.alpha = this.maxalpha - (this.progress() * 255);
    //   } else {
    //     this.alpha = 0;
    //     this.dead = true;
    //   }
    // }
  },

  progress:function(){
    return (millis() - this.death) / this.deathspan;
  }
}
