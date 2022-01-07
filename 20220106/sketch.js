// Genuary 2022, January 6
// Trade Styles with a Friend (Estevan Carlos Benson)

var c;
var leaves = ["leaf1.png","leaf2.png","leaf3.png","leaf4.png","leaf5.png","leaf6.png"];
var brushes = ["brush_01.png","brush_02.png","brush_03.png","brush_04.png","brush_05.png","brush_06.png","brush_07.png","brush_08.png","brush_09.png","brush_10.png","brush_11.png","brush_12.png","brush_13.png","brush_14.png","brush_15.png","brush_16.png","brush_17.png","brush_18.png","brush_19.png","brush_20.png","brush_21.png","brush_22.png","brush_23.png","brush_24.png","brush_25.png","brush_26.png",];
var leaf;
var leafW, leafH, leafR;
var paintStrokes = [];
var paintStrokesW = [];
var paintStrokesH = [];
var paintStrokesR = [];
var strokeCount;

function preload(){
  leaf = loadImage(leaves[floor(random(leaves.length-0.0001))]);
  var strokeCount = floor(random(2,4.99));
  for(var i=0; i<strokeCount; i++){
    console.log(brushes[floor(random(brushes.length-0.0001))]);
    paintStrokes.push(loadImage(brushes[floor(random(brushes.length-0.0001))]));
  }
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  c = color(255, 210, 70);
  noFill();
  stroke(c);
  strokeWeight(1);
  imageMode(CENTER);
  leafR = random() * TWO_PI;

  var bigside = 0;
  if(width > height){
    bigside = width;
  } else {
    bigside = height;
  }

  if(leaf.width > leaf.height){
    leafW = bigside;
    leafH = (leaf.height/leaf.width) * bigside;
  } else {
    leafH = bigside;
    leafW = (leaf.width/leaf.height) * bigside;
  }

  console.log(paintStrokes.length);
  for(var i=0; i<paintStrokes.length; i++){
    if(paintStrokes[i].width > paintStrokes[i].height){
      paintStrokesW.push(bigside/2);
      paintStrokesH.push((paintStrokes[i].height/paintStrokes[i].width) * (bigside/2));
    } else {
      paintStrokesH.push(bigside/2);
      paintStrokesW.push((paintStrokes[i].width/paintStrokes[i].height) * (bigside/2));
    }
    paintStrokesR.push(random() * TWO_PI);
  }
  noLoop();
}

function draw(){
  background(0);
  push();
  translate(width/2, height/2);
  rotate(leafR);
  tint(c);
  image(leaf, 0, 0, leafW, leafH);
  tint(255);
  for(var i=0; i<paintStrokes.length; i++){
    rotate(paintStrokesR[i]);
    image(paintStrokes[i], random(-width/8, width/8), random(-width/4, width/4), paintStrokesW[i], paintStrokesH[i]);
  }
  pop();
  rect(100.5, 100.5, width-200, height-200);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
