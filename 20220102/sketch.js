// Genuary 2022, January 2
// Dithering

var img;
var pg;
var ditheredImage;
var numPoints = 200000;
var pointsPerFrame = 200;
var totalPoints = 0;
var imgSize;

function preload(){
  img = loadImage("grayshirtcentered.jpg");
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  imgSize = width;
  if(height < width){
    imgSize = height;
  }
  ditheredImage = createGraphics(imgSize, imgSize);
  ditheredImage.noStroke();
  pg = createGraphics(imgSize, imgSize);
  pg.background(255);
  pg.image(img, 0, 0, imgSize, imgSize);
  background(0);
  imageMode(CENTER);
  rectMode(CENTER);
}

function draw(){
  background(0);
  if(totalPoints < numPoints){
    for(var i=0; i<pointsPerFrame; i++){
      var xpos = int(random()*pg.width);
      var ypos = int(random()*pg.height);
      var c = pg.get(xpos, ypos);
      ditheredImage.push();
      ditheredImage.translate(xpos, ypos);
      ditheredImage.rotate(random()*TWO_PI);
      ditheredImage.fill(255);
      var size = brightness(c) * 0.05;
      ditheredImage.square(0,0,size);

      ditheredImage.pop();
    }
    totalPoints += pointsPerFrame;
  }
  image(ditheredImage, width/2, height/2, imgSize, imgSize);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
