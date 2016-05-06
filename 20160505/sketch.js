var cam;
var opticalFlowField;
var flowField;
var videoWidth = 160;
var videoHeight = 120;
var resolution = 10;
var force = 1000000;
var spacing, halfspacing, gridWidth;
var showVideo = false;
var showFlowField = true;

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  cam = createCapture(VIDEO);
  cam.size(videoWidth, videoHeight);
  opticalFlowField = new OpticalFlowField(videoWidth, videoHeight, resolution);
  opticalFlowField.init();
  gridWidth = opticalFlowField.gw;
  spacing = windowWidth / gridWidth;
  halfspacing = spacing / 2;
  strokeWeight(3);
}

function draw(){
  background(0);

  // check for new image and update the optical flow field
  opticalFlowField.update(cam);

  // draw image
  if(showVideo){
    image(cam, 0, 0, windowWidth, windowHeight);
  }

  // draw flow field
  if(showFlowField){
    drawFlowField();
  }
}

function drawFlowField(){
  var u,v,a,r,g,b,xpos,ypos;
  
  flowField = opticalFlowField.flowField;
  for(var i=0; i < flowField.length; i++){
    u = flowField[i][0] * force;
    v = flowField[i][1] * force;
    a = sqrt(u*u + v*v);
    r = 0.5 * (1 + u / (a + 0.1));
    g = 0.5 * (1 + v / (a + 0.1));
    b = 0.5 * (2 - (r + g));
    stroke(255 * r, 255 * g, 255 * b);
    ypos = floor(i / gridWidth) * spacing;// + halfspacing;
    xpos = (i % gridWidth) * spacing + halfspacing;
    line(xpos, ypos, xpos + u, ypos + v);
    //console.log(u, v);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}





function OpticalFlowField(w, h, res){
  this.w = w;
  this.h = h;
  this.gs = res;

  // optical flow variables
  this.ar = 0;
  this.ag = 0;
  this.ab = 0;    // used as return values from pixel averaging
  this.dtr = [];
  this.dtg = [];
  this.dtb = [];  // differentiation by time (red, green, blue)
  this.dxr = [];
  this.dxg = [];
  this.dxb = [];  // differentiation by x (red, green, blue)
  this.dyr = [];
  this.dyg = [];
  this.dyb = [];  // differentiation by y (red, green, blue)
  this.par = [];
  this.pag = [];
  this.pab = [];  // averaged grid values (red, green, blue)
  this.flowx = [];
  this.flowy = [];  // computed optical flow
  this.sflowx = [];
  this.sflowy = [];  // slowly changing version of the flow
  this.flowField = [];  // 2D array of sflowx/sflowy values
  this.imgLine = [];      // stores pixels for mirroring
  this.flagMirror = false;
}

OpticalFlowField.prototype = {
  constructor:OpticalFlowField,

  init:function(){
    this.as = this.gs * 2;
    this.gw = this.w / this.gs;
    this.gh = this.h / this.gs;
    this.gs2 = this.gs / 2;
    this.flagMirror = false;
    this.imgLine = new Array(this.w);

    this.ar = 0;
    this.ag = 0;
    this.ab = 0;

    this.fm = 27;         // length of vectors
    this.fc = 100000000;  // regularization term for regression
    this.wflow = 0.1;    // smoothing

    this.par = new Array(this.gw * this.gh);
    this.pag = new Array(this.gw * this.gh);
    this.pab = new Array(this.gw * this.gh);
    this.dtr = new Array(this.gw * this.gh);
    this.dtg = new Array(this.gw * this.gh);
    this.dtb = new Array(this.gw * this.gh);
    this.dxr = new Array(this.gw * this.gh);
    this.dxg = new Array(this.gw * this.gh);
    this.dxb = new Array(this.gw * this.gh);
    this.dyr = new Array(this.gw * this.gh);
    this.dyg = new Array(this.gw * this.gh);
    this.dyb = new Array(this.gw * this.gh);
    this.flowx = new Array(this.gw * this.gh);
    this.flowy = new Array(this.gw * this.gh);
    this.sflowx = new Array(this.gw * this.gh);
    this.sflowy = new Array(this.gw * this.gh);
    // initialize all arrays with a 0 value
    for(var i=0; i<this.sflowx.length; i++){
      this.par[i] = 0;
      this.pag[i] = 0;
      this.pab[i] = 0;
      this.dtr[i] = 0;
      this.dtg[i] = 0;
      this.dtb[i] = 0;
      this.dxr[i] = 0;
      this.dxg[i] = 0;
      this.dxb[i] = 0;
      this.dyr[i] = 0;
      this.dyg[i] = 0;
      this.dyb[i] = 0;
      this.sflowx[i] = 0;
      this.sflowy[i] = 0;
    }
    this.flowField = new Array(this.gw * this.gh);
    for(var i=0; i<this.flowField.length; i++){
      this.flowField[i] = new Array(2);
    }
    this.fx = new Array(this.fm);
    this.fy = new Array(this.fm);
    this.ft = new Array(this.fm);
    for(var i=0; i<this.fx.length; i++){
      this.fx[i] = 0;
      this.fy[i] = 0;
      this.ft[i] = 0;
    }
  },

  averagePixels:function(img, x1, y1, x2, y2){
    var sumr = 0;
    var sumg = 0;
    var sumb = 0;
    var pix;

    // constrain to dimensions of the image
    if(x1 < 0){
      x1 = 0;
    }
    if(x2 >= this.w){
      x2 = this.w-1;
    }
    if(y1 < 0){
      y1 = 0;
    }
    if(y2 >= this.h){
      y2 = this.h-1;
    }

    // get RGB sum of pixels
    // for(var y = y1; y <= y2; y++){
    //   for(var i = this.w * y + x1; i <= this.w * y + x2; i++){
    //     pix = img.pixels[i];
    //     sumb += pix & 0xFF;  // blue
    //     pix = pix >> 8;
    //     sumg += pix & 0xFF;  // green
    //     pix = pix >> 8;
    //     sumr += pix & 0xFF;  // red
    //   }
    // }

    // get RGB sum of pixels
    for(var y = y1; y <= y2; y++){
      for(var i = this.w * y + x1; i <= this.w * y + x2; i += 3){
        sumr += img.pixels[i];
        sumg += img.pixels[i+1];
        sumb += img.pixels[i+2];
      }
    }

    // average the RGB values
    var n = (x2 - x1 + 1) * (y2 - y1 + 1);  // number of pixels
    this.ar = sumr / n;
    this.ag = sumg / n;
    this.ab = sumb / n;
  },

  getNext9:function(x, y, i, j){
    y[j + 0] = x[i + 0];
    y[j + 1] = x[i - 1];
    y[j + 2] = x[i + 1];
    y[j + 3] = x[i - this.gw];
    y[j + 4] = x[i + this.gw];
    y[j + 5] = x[i - this.gw - 1];
    y[j + 6] = x[i - this.gw + 1];
    y[j + 7] = x[i + this.gw - 1];
    y[j + 8] = x[i + this.gw + 1];
  },

  solveFlow:function(ig){
    var xx, xy, yy, xt, yt;
    var a, u, v;
    xx = xy = yy = xt = yt = 0;

    // prepare covariances
    for(var i=0; i < this.fm; i++){
      xx += this.fx[i] * this.fx[i];
      xy += this.fx[i] * this.fy[i];
      yy += this.fy[i] * this.fy[i];
      xt += this.fx[i] * this.ft[i];
      yt += this.fy[i] * this.ft[i];
    }

    // lease squares computation
    a = xx * yy - xy * xy + this.fc;   // fc is for stable computation
    u = yy * xt - xy * yt;       // x direction
    v = xx * yt - xy * xt;       // y direction

    // write back
    this.flowx[ig] = -2 * this.gs * u / a;   // optical flow x (pixel per frame)
    this.flowy[ig] = -2 * this.gs * v / a;   // optical flow y (pixel per frame)
  },

  // mirrorImage:function(img){
  //   img.loadPixels();
  //   for(var y=0; y < height; y++) {
  //     var ig = y * this.w;
  //     for(var x=0; x < this.w; x++){
  //       this.imgLine[x] = img.pixels[ig + x];
  //     }
  //     for(var x=0; x < this.w; x++){
  //       img.pixels[ig + x] = this.imgLine[this.w - 1 - x];
  //     }
  //   }
  //   img.updatePixels();
  //   return img;
  // },

  // getVel:function(normX, normY){
  //   if(normX >= 0 && normX < 1 && normY >= 0 && normY < 1){
  //     var col = round(normX * this.gw);
  //     var row = round(normY * this.gh);
  //     var xvel = this.sflowx[row * this.gw + col];
  //     var yvel = this.sflowy[row * this.gw + col];
  //     console.log(xvel, yvel);
  //     var vel = [xvel, yvel];
  //     return vel;
  //   }
  //   var vel = [0,0];
  //   return vel;
  // },

  update:function(img){
    img.loadPixels();
    if(img.width == videoWidth){
      return false;
    }
    // if(this.flagMirror){
    //   img = this.mirrorImage(img);
    // }

    // 1st sweep: differentiation by time
    for(var ix=0; ix < this.gw; ix++){
      var x0 = ix * this.gs + this.gs2;
      for(var iy=0; iy < this.gh; iy++){
        var y0 = iy * this.gs + this.gs2;
        var ig = iy * this.gw + ix;
        // compute average pixel at (x0,y0)
        this.averagePixels(img, x0 - this.as, y0 - this.as, x0 + this.as, y0 + this.as);
        // compute time difference
        this.dtr[ig] = this.ar - this.par[ig];  // red
        this.dtg[ig] = this.ag - this.pag[ig];  // green
        this.dtb[ig] = this.ab - this.pab[ig];  // blue
        // save the pixel
        this.par[ig] = this.ar;
        this.pag[ig] = this.ag;
        this.pab[ig] = this.ab;
      }
    }

    // 2nd sweep: differentiation by x and y
    for(var ix=1; ix < this.gw - 1; ix++){
      for(var iy=1; iy < this.gh - 1; iy++){
        var ig = iy * this.gw + ix;
        // compute x difference
        this.dxr[ig] = this.par[ig+1] - this.par[ig-1];   // red
        this.dxg[ig] = this.pag[ig+1] - this.pag[ig-1];   // green
        this.dxb[ig] = this.pab[ig+1] - this.pab[ig-1];   // blue
        // compute y difference
        this.dyr[ig] = this.par[ig+this.gw] - this.par[ig-this.gw];   // red
        this.dyg[ig] = this.pag[ig+this.gw] - this.pag[ig-this.gw];   // green
        this.dyb[ig] = this.pab[ig+this.gw] - this.pab[ig-this.gw];   // blue
      }
    }

    // 3rd sweep: solving optical flow
    for(var ix=1; ix < this.gw - 1; ix++){
      for(var iy=1; iy < this.gh - 1; iy++){
        var ig = iy * this.gw + ix;
        // prepare vectors fx, fy, ft
        this.getNext9(this.dxr, this.fx, ig, 0);       // dx red
        this.getNext9(this.dxg, this.fx, ig, 9);       // dx green
        this.getNext9(this.dxb, this.fx, ig, 18);      // dx blue
        this.getNext9(this.dyr, this.fy, ig, 0);       // dy red
        this.getNext9(this.dyg, this.fy, ig, 9);       // dy green
        this.getNext9(this.dyb, this.fy, ig, 18);      // dy blue
        this.getNext9(this.dtr, this.ft, ig, 0);       // dt red
        this.getNext9(this.dtg, this.ft, ig, 9);       // dt green
        this.getNext9(this.dtb, this.ft, ig, 18);      // dt blue
        // solve for (flowx, flowy)
        this.solveFlow(ig);
        // smoothing
        //console.log(this.flowx[ig], this.sflowx[ig]);
        this.sflowx[ig] += (this.flowx[ig] - this.sflowx[ig]) * this.wflow;
        this.sflowy[ig] += (this.flowy[ig] - this.sflowy[ig]) * this.wflow;
      }
    }

    // 4th sweep: put sflowx/sflowy in flowfield array
    for(var i=0; i < this.flowField.length; i++){
      //console.log(this.sflowx[i], this.sflowy[i]);
      this.flowField[i][0] = this.sflowx[i];
      this.flowField[i][1] = this.sflowy[i];
    }

  }

}


