// Genuary 2022, January 7
// Sol LeWitt Wall Drawing 414

var brush;
var brushSize;
var quads = [];
var quadSize;
var squareSize;

function preload(){
  brush = loadImage("brush.png");
}

function setup(){
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("splash");
  frameRate(60);
  background(255);
  var bigSide = width;
  if(width > height){
    bigSide = height;
  }
  quadSize = (bigSide - 220) / 2;
  squareSize = quadSize / 2;
  brushSize = bigSide / 10;
  quads.push(new Quad(createVector(-quadSize-10, -quadSize-10)));
  quads.push(new Quad(createVector(10, -quadSize-10)));
  quads.push(new Quad(createVector(-quadSize-10, 10)));
  quads.push(new Quad(createVector(10, 10)));
}

function draw(){
  translate(width/2, height/2);
  for(var i=0; i<this.quads.length; i++){
    this.quads[i].draw();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}




class Quad{
  constructor(pos){
    this.pos = pos;
    this.squares = []
    this.values = [200, 400, 700, 1200];
    this.squares.push(new Square(createVector(0,0), this.values.splice(floor(random()*this.values.length), 1)));
    this.squares.push(new Square(createVector(squareSize,0), this.values.splice(floor(random()*this.values.length), 1)));
    this.squares.push(new Square(createVector(0,squareSize), this.values.splice(floor(random()*this.values.length), 1)));
    this.squares.push(new Square(createVector(squareSize,squareSize), this.values.splice(floor(random()*this.values.length), 1)));
  }

  draw(){
    push();
    translate(this.pos.x, this.pos.y);
    for(var i=0; i<this.squares.length; i++){
      this.squares[i].draw();
    }
    pop();
  }
}




class Square{
  constructor(pos, brushCount){
    this.pos = pos;
    this.brushCount = brushCount;
    this.img = createGraphics(squareSize, squareSize);
    this.img.imageMode(CENTER);
    this.img.background(255);
    this.img.tint(0,0,0,4);
    this.currentCount = 0;
  }

  draw(){
    if(this.currentCount < this.brushCount){
      // add brush image
      this.img.image(brush, random()*this.img.width, random()*this.img.height, brushSize, brushSize);
      this.currentCount++;
    }
    image(this.img, this.pos.x, this.pos.y);
  }
}
