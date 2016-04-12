var redFloater, greenFloater, blueFloater, centerFloater;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  background(0);
  blendMode(SCREEN);
  redFloater = new Floater();
  greenFloater = new Floater();
  blueFloater = new Floater();
  centerFloater = new Floater();
  strokeWeight(3);
}

function draw(){
  redFloater.draw();
  greenFloater.draw();
  blueFloater.draw();
  centerFloater.draw();
  stroke(255,0,0,16);
  line(redFloater.x, redFloater.y, centerFloater.x, centerFloater.y);
  stroke(0,255,0,16);
  line(greenFloater.x, greenFloater.y, centerFloater.x, centerFloater.y);
  stroke(0,0,255,16);
  line(blueFloater.x, blueFloater.y, centerFloater.x, centerFloater.y);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Floater(){
  this.x = windowWidth/2;
  this.y = windowHeight/2;
  this.xvec = random(-1,1);
  this.yvec = random(-1,1);
  this.damping = 0.97;
  this.noiseForce = windowWidth * 0.0003;
}

Floater.prototype = {
  constructor:Floater,

  draw:function(){
    this.x += this.xvec;
    this.y += this.yvec;
    this.xvec *= this.damping;
    this.yvec *= this.damping;
    this.xvec += random(0-this.noiseForce, this.noiseForce);
    this.yvec += random(0-this.noiseForce, this.noiseForce);
    if(this.x < 0){
      this.x = 0;
      this.xvec *= -1;
    } else if(this.x > windowWidth){
      this.x = windowWidth;
      this.xvec *= -1;
    }
    if(this.y < 0){
      this.y = 0;
      this.yvec *= -1;
    } else if(this.y > windowHeight){
      this.y = windowHeight;
      this.yvec *= -1;
    }
  }
}
