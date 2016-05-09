var walkers = [];
var lastRelease = 0;
var releaseRate = 200;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  this.walkers.push(new Walker());
  background(255);
  strokeWeight(5);
}

function draw(){
  // release a new walker when ready
  if(millis() - lastRelease > releaseRate){
    this.walkers.push(new Walker());
    lastRelease = millis();
  }

  // reduce the opacity of the entire raster
  loadPixels();
  for(var i=0; i<pixels.length; i+=4){
    pixels[i] = constrain(pixels[i] + 1, 0, 255);
    pixels[i+1] = constrain(pixels[i+1] + 1, 0, 255);
    pixels[i+2] = constrain(pixels[i+2] + 1, 0, 255);
    //pixels[i+3] = constrain(pixels[i+3] - 4, 0, 255);
  }
  updatePixels();

  // blend to black
  blendMode(MULTIPLY);

  // draw and/or kill walkers
  for(var i=this.walkers.length-1; i>=0; i--){
    this.walkers[i].draw();
    if(this.walkers[i].dead){
      this.walkers.splice(i,1);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Walker(){
  this.pos = createVector(random(windowWidth), random(windowHeight));
  this.pospast = this.pos.copy();
  this.vec = createVector(1,0);
  this.vec.rotate(random(TWO_PI));
  this.rotation = 0;
  this.rotationTightness = random(0.001, 0.01);
  var r = random();
  if(r < 0.33){
    this.c = color(0,255,255);
  } else if(r >= 0.33 && r < 0.66){
    this.c = color(255,0,255);
  } else {
    this.c = color(255,255,0);
  }
  this.a = 0;
  this.ta = 255;
  this.pa = this.a;
  this.fading = true;
  this.fadeStart = millis();
  this.fadeDuration = 2000;
  this.dead = false;
}

Walker.prototype = {
  constructor:Walker,

  draw:function(){
    this.handleBounce();
    this.handleFading();
    this.handleRotation();
    this.pospast = this.pos.copy();
    this.pos.add(this.vec);
    stroke(red(this.c), green(this.c), blue(this.c), this.a);
    line(this.pos.x, this.pos.y, this.pospast.x, this.pospast.y);
  },

  handleBounce:function(){
    if(this.pos.y < 0){
      this.pos.y = 0;
      this.vec.y *= -1;
    } else if(this.pos.y > windowHeight){
      this.pos.y = windowHeight;
      this.vec.y *= -1;
    }
    if(this.pos.x < 0){
      this.pos.x = 0;
      this.vec.x *= -1;
    } else if(this.pos.x > windowWidth){
      this.pos.x = windowWidth;
      this.vec.x *= -1;
    }
  },

  handleFading:function(){
    var p = (millis() - this.fadeStart) / this.fadeDuration;
    if(p >= 1){
      this.a = this.ta;
      this.pa = this.a;
      this.fading = false;
      if(this.a == 0){
        this.dead = true;
      }
    } else {
      this.a = ((this.ta - this.pa) * p) + this.pa;
    }
  },

  handleRotation:function(){
    this.vec.rotate(this.rotationTightness);
    this.rotation += this.rotationTightness;
    if(this.rotation > TWO_PI && !this.fading){
      //this.dead = true;
      this.fading = true;
      this.fadeStart = millis();
      this.ta = 0;
    }
  }
}
