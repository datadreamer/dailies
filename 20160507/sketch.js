var topshards = [];
var bottomshards = [];
var lastRelease = 0;
var releaseRate = 100;
var toprot = 0;
var bottomrot = 0;
var rotspeed = 0.01;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("splash");
}

function draw(){
  if(millis() - lastRelease > releaseRate){
    if(random() > 0.5){
      topshards.push(new Shard());
    } else {
      bottomshards.push(new Shard());
    }
    lastRelease = millis();
  }
  background(0);

  var locY = (mouseY / height - 0.5) *(-2);
  var locX = (mouseX / width - 0.5) *2;
  pointLight(255, 255, 255, locX, locY, 0);

  push();
  translate(0, -100, 0);
  rotateX(toprot);
  for(var i=topshards.length-1; i>=0; i--){
    topshards[i].draw();
    if(topshards[i].dead){
      topshards.splice(i,1);
    }
  }
  pop();

  push();
  translate(0, 100, 0);
  rotateX(bottomrot);
  for(var i=bottomshards.length-1; i>=0; i--){
    bottomshards[i].draw();
    if(bottomshards[i].dead){
      bottomshards.splice(i,1);
    }
  }
  pop();

  toprot += rotspeed;
  bottomrot -= rotspeed;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Shard(){
  this.x = random(-windowWidth/2, windowWidth/2);
  this.y = 0;
  this.z = 0;
  this.w = random(windowWidth * 0.005, windowWidth * 0.01);
  this.wiggle = 0.2;
  this.h = this.w;
  this.th = random(100,300);//random(windowHeight/4, windowHeight/2);
  this.ph = this.h;
  this.rotX = random(-PI, PI);//random(-this.wiggle, this.wiggle);
  this.rotY = random(-this.wiggle, this.wiggle);
  this.rotZ = random(-this.wiggle, this.wiggle);
  this.c = color(255-random(150), 255-random(100), 255, random(150,255));
  this.a = 0;
  this.ta = 250;
  this.pa = this.a;
  this.growing = true;
  this.growStart = millis();
  this.growDuration = random(5000,10000);
  this.dead = false;
}

Shard.prototype = {
  constructor:Shard,

  draw:function(){
    this.handleGrowing();
    push();
    translate(this.x, this.y, this.z);
    rotateX(this.rotX);
    rotateY(this.rotY);
    rotateZ(this.rotZ);
    ambientMaterial(red(this.c), green(this.c), blue(this.c), this.a);
    box(this.w, this.h, this.w);
    pop();
  },

  handleGrowing:function(){
    if(this.growing){
      var p = (millis() - this.growStart) / this.growDuration;
      if(p >= 1){
        this.h = this.th;
        this.a = this.ta;
        if(this.h == 0){
          this.ph = this.h;
          this.pa = this.a;
          this.growing = false;
          this.dead = true;
        } else {
          this.th = 0;
          this.ta = 0;
          this.ph = this.h;
          this.pa = this.a;
          this.growStart = millis();
        }
      } else {
        this.h = ((this.th - this.ph) * this.sinProgress(p)) + this.ph;
        this.a = ((this.ta - this.pa) * this.sinProgress(p)) + this.pa;
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
