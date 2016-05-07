var shards = [];
var lastRelease = 0;
var releaseRate = 200;
var maxShards = 100;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("splash");
}

function draw(){
  if(millis() - lastRelease > releaseRate && shards.length < maxShards){
    shards.push(new Shard());
    lastRelease = millis();
  }
  background(0);
  var locY = (mouseY / height - 0.5) *(-2);
  var locX = (mouseX / width - 0.5) *2;
  pointLight(255, 0, 0, locX, locY, 0);
  pointLight(0, 0, 255, locX, -locY, 0);
  for(var i=0; i<shards.length; i++){
    shards[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




function Shard(){
  this.reset();
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
    box(this.w, this.h, this.w);
    pop();
  },

  handleGrowing:function(){
    if(this.growing){
      var p = (millis() - this.growStart) / this.growDuration;
      if(p >= 1){
        this.h = this.th;
        if(this.h == 0){
          // reset or destroy
          this.reset();
        } else {
          this.th = 0;
          this.ph = this.h;
          this.growStart = millis();
        }
      } else {
        this.h = ((this.th - this.ph) * this.sinProgress(p)) + this.ph;
      }
    }
  },

  reset:function(){
    this.x = random(-windowWidth, windowWidth);
    if(random() > 0.5){
      this.y = -windowHeight;
    } else {
      this.y = windowHeight;
    }
    this.z = 0;//random(windowWidth);
    this.w = random(10,20);
    this.wiggle = 0.2;
    this.h = this.w;
    this.th = random(windowHeight, windowHeight * 2);
    this.ph = this.h;
    this.rotX = random(-this.wiggle, this.wiggle);
    this.rotY = random(-this.wiggle, this.wiggle);
    this.rotZ = random(-this.wiggle, this.wiggle);
    this.growing = true;
    this.growStart = millis();
    this.growDuration = random(5000,10000);
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
