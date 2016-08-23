var fans = [];
var spacing;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  stroke(0);
  reset();
}

function draw(){
  background(255);
  for(var i=0; i<fans.length; i++){
    fans[i].draw();
  }
}

function reset(){
  fans = [];
  spacing = windowWidth / 5;
  var sw = 1;
  var alternate = false;
  var rowcount = round((windowHeight-spacing/2) / (spacing*0.25));
  var row = 0;
  console.log(rowcount);
  for(var y=spacing; y<windowHeight+spacing; y+=spacing*0.25){
    var start = spacing/2;
    if(alternate){
      start = 0;
    }
    for(var x=start; x<=windowWidth; x+=spacing){
      var fan = new Fan(x, y, spacing, sw, (rowcount-row)*300);
      fans.push(fan);
    }
    row++;
    alternate = !alternate;
    sw += 1;
  }
}

function mousePressed(){
  reset();
}


function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}






function Fan(x, y, d, sw, dd){
  this.x = x;
  this.y = y;
  this.d = d;
  this.sw = sw;
  this.dd = dd;
  this.rotation = 0;
  this.delaying = true;
  this.delayStart = millis();
  this.delayDuration = dd;
  this.expanding = false;
  this.expandStart = millis();
  this.expandDuration = 500;
}

Fan.prototype = {
  constructor:Fan,

  draw:function(){
    this.handleDelaying();
    this.handleExpanding();
    strokeWeight(this.sw);
    if(this.rotation > 0){
      arc(this.x, this.y, this.d, this.d, PI, PI + this.rotation);
      arc(this.x, this.y, this.d*0.75, this.d*0.75, PI, PI + this.rotation);
      arc(this.x, this.y, this.d*0.5, this.d*0.5, PI, PI + this.rotation);
      arc(this.x, this.y, this.d*0.25, this.d*0.25, PI, PI + this.rotation);
    }
    // ellipse(this.x, this.y, this.d, this.d);
    // ellipse(this.x, this.y, this.d*0.75, this.d*0.75);
    // ellipse(this.x, this.y, this.d*0.5, this.d*0.5);
    // ellipse(this.x, this.y, this.d*0.25, this.d*0.25);
  },

  handleDelaying:function(){
    if(this.delaying){
      var p = (millis() - this.delayStart) / this.delayDuration;
      if(p >= 1){
        this.delaying = false;
        this.expanding = true;
        this.expandStart = millis();
      }
    }
  },

  handleExpanding:function(){
    if(this.expanding){
      var p = (millis() - this.expandStart) / this.expandDuration;
      if(p >= 1){
        this.rotation = PI;
        this.expanding = false;
      } else {
        this.rotation = PI * this.sinProgress(p);
      }
    }
  },

  sinProgress:function(p){
    return -0.5 * (cos(PI*p) - 1);
  }
}
