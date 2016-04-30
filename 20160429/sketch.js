var stripes = [];
var releaseRate = 30;
var lastRelease = 0;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  strokeWeight(3);
}

function draw(){


  var grad = this.drawingContext.createLinearGradient(0,0,0,windowHeight);
  grad.addColorStop(0, color(0,0,0,0));
  grad.addColorStop(1, color(50,0,0,128));
  this.drawingContext.fillStyle = grad;
  this.drawingContext.rect(0,0,windowWidth,windowHeight);
  this.drawingContext.fill();

  loadPixels();
  for(var i=0; i<pixels.length; i+=4){
    pixels[i+3] = constrain(pixels[i+3] - 4, 0, 255);
  }
  updatePixels();

  if(millis() - lastRelease > releaseRate){
    var s;
    var r = random();
    if(r < 0.33){ // move down
      var x = random(windowWidth);
      s = new Stripe(x, 0);
      s.setVec(0,random(5,20));
    } else  if(r >= 0.33 && r < 0.66){  // move right
      var y = random(windowHeight);
      s = new Stripe(0, y);
      s.setVec(random(5,20),0);
    } else {                            // move left
      var y = random(windowHeight);
      s = new Stripe(windowWidth, y);
      s.setVec(random(-5,-20),0);
    }
    stripes.push(s);
    lastRelease = millis();
  }

  //background(0,4);
  for(var i=stripes.length-1; i>=0; i--){
    stripes[i].draw();
    if(stripes[i].dead){
      stripes.splice(i,1);
    }
  }

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function Stripe(x, y){
  this.x = x;
  this.y = y;
  this.c = color(random(255), 0, 0);
  this.tx = this.x;
  this.ty = this.y;
  this.px = this.x;
  this.py = this.y;
  this.vx = 0;
  this.vy = 0;
  this.dead = false;
  this.moving = false;
  this.moveStart;
  this.moveDuration = random(1000,3000);
}

Stripe.prototype = {
  constructor:Stripe,

  draw:function(){
    this.move();
    stroke(this.c);
    line(this.x, this.y, this.px, this.py);
  },

  move:function(){
    this.px = this.x;
    this.py = this.y;
    this.x += this.vx;
    this.y += this.vy;
  },

  handleMoving:function(){
    if(this.moving){
      var p = (millis() - this.moveStart) / this.moveDuration;
      if(p >= 1){
        this.moving = false;
        this.x = this.tx;
        this.y = this.ty;
        this.px = this.x;
        this.py = this.y;
      } else {
        this.x = ((this.tx - this.px) * p) + this.px;
        this.y = ((this.ty - this.py) * p) + this.py;
      }
    }
  },

  moveTo:function(tx, ty){
    if(this.x > windowWidth || this.y > windowHeight){
      this.dead = true;
    }
    this.tx = tx;
    this.ty = ty;
    this.px = this.x;
    this.py = this.y;
    this.moving = true;
    this.moveStart = millis();
  },

  setVec(vx, vy){
    this.vx = vx;
    this.vy = vy;
  }
}
