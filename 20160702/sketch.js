var camera, scene, renderer, composer;
var width, height;
var group;
var controls;
var xRot = 0;
var yRot = 0.001;
var zRot = 0;
var minBuildingHeight = 20;
var maxBuildingHeight = 200;
var mouseIsPressed = false;
var keyIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var blocks = [];

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  // setup camera and scene
  camera = new THREE.PerspectiveCamera(60, width/height, 100, 5000);
	camera.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1500));
  scene = new THREE.Scene();

  // setup trackball camera controls
  controls = new THREE.TrackballControls(camera);
  controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];

  // add group object to scene to be rendered
  group = new THREE.Group();
  scene.add(group);
  group.position.set(-250,0,-250);

  // create some blocks (5 x 5)
  var blockW = 100;
  var blockH = 100;
  var streetWidth = 20;
  for(var y=0; y<5; y++){
    for(var x=0; x<5; x++){
      var pos = new THREE.Vector3(x * (blockW+streetWidth), 0, y * (blockH+streetWidth));
      blocks.push(new Block(group, pos, blockW, blockH));
    }
  }

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // composer for doing post-processing stuff.
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  var pass = new THREE.SMAAPass(width, height);
  pass.renderToScreen = true;
  composer.addPass(pass);

  // update everything when window is resized
  window.addEventListener('resize', onWindowResize, false);
}

function mouseWheel(event){
  camera.zoom += (event.deltaY * 0.001);
  camera.updateProjectionMatrix();
}

function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
}

function draw() {
  requestAnimationFrame(draw);
  controls.update();

  for(var i=0; i<blocks.length; i++){
    blocks[i].update();
  }

  // render a new frame
  composer.render();
}





// A block contains one or more lots.
function Block(parent, pos, w, h){
  this.pos = pos;
  this.w = w;
  this.h = h;
  var minLots = 1;
  var maxLots = 5;
  this.numLots = Math.round(Math.random() * (maxLots - minLots)) + minLots;
  this.lots = [];
  this.sidewalkSize = 10;

  // outline the block
  var geo = new THREE.Geometry();
  geo.vertices.push(
    new THREE.Vector3(-w/2, 0, -h/2),
    new THREE.Vector3(w/2, 0, -h/2),
    new THREE.Vector3(w/2, 0, h/2),
    new THREE.Vector3(-w/2, 0, h/2),
    new THREE.Vector3(-w/2, 0, -h/2)
  );
  var mat = new THREE.LineBasicMaterial({color:0x0099ff});
  this.obj = new THREE.Line(geo, mat);
  this.obj.position.copy(pos);
  parent.add(this.obj);

  // TODO: come up with a recursive algorithm for splitting plots logically.
  // create lots
  var newW = w-this.sidewalkSize;
  var newH = h-this.sidewalkSize;
  if(Math.random() > 0.5){
    // split block vertically
    newW = newW/this.numLots;
    var offset = 0;
    if(this.numLots > 1){
      offset = (w-this.sidewalkSize)/2 - newW/2;
    }
    for(var i=0; i<this.numLots; i++){
      this.lots.push(new Lot(this.obj, new THREE.Vector3(newW * i - offset, 5, 0), newW, newH, false));
    }
    // this.lots.push(new Lot(this.obj, new THREE.Vector3(-newW/2, 5, 0), newW, newH, false));
    // this.lots.push(new Lot(this.obj, new THREE.Vector3(newW/2, 5, 0), newW, newH, false));
  } else {
    // split block horizontally
    newH = newH/2;
    this.lots.push(new Lot(this.obj, new THREE.Vector3(0, 5, -newH/2), newW, newH, true));
    this.lots.push(new Lot(this.obj, new THREE.Vector3(0, 5, newH/2), newW, newH, true));
  }

  this.update = function(){

  };
}





// A lot contains one or more buildings.
function Lot(parent, pos, w, h, hor){
  this.pos = pos;
  this.w = w;
  this.h = h;
  var minBuildings = 1;
  var maxBuildings = 5;
  this.numBuildings = Math.round(Math.random() * (maxBuildings - minBuildings)) + minBuildings;
  this.buildings = [];

  // outline the lot
  var geo = new THREE.Geometry();
  geo.vertices.push(
    new THREE.Vector3(-w/2, 0, -h/2),
    new THREE.Vector3(w/2, 0, -h/2),
    new THREE.Vector3(w/2, 0, h/2),
    new THREE.Vector3(-w/2, 0, h/2),
    new THREE.Vector3(-w/2, 0, -h/2)
  );
  var mat = new THREE.LineBasicMaterial({color:0x00ffff});
  this.obj = new THREE.Line(geo, mat);
  this.obj.position.copy(pos);
  parent.add(this.obj);

  // TODO: make different prototypes for different building types (high density vs. low density).
  // create buildings
  var newW = w;
  var newH = h;
  if(hor){
    newW = w / this.numBuildings;
  } else {
    newH = h / this.numBuildings;
  }
  var offset = 0;
  if(this.numBuildings > 1){
    if(hor){
      offset = w/2 - newW/2;
    } else {
      offset = h/2 - newH/2;
    }
  }
  for(var i=0; i<this.numBuildings; i++){
    var bh = Math.round(Math.random() * (maxBuildingHeight - minBuildingHeight)) + minBuildingHeight;
    if(hor){
      // distribute buildings horizontally
      this.buildings.push(new Building(this.obj, new THREE.Vector3(newW * i - offset, 5, 0), newW, newH, bh));
    } else {
      // distribute buildings vertically
      this.buildings.push(new Building(this.obj, new THREE.Vector3(0, 5, newH * i - offset), newW, newH, bh));
    }
  }
}





// A building is a 3d box.
function Building(parent, pos, w, h, d){
  this.pos = pos;
  w = (Math.random()*0.5 + 0.5) * w;
  h = (Math.random()*0.5 + 0.5) * h;

  // outline the building
  var geo = new THREE.Geometry();
  geo.vertices.push(
    new THREE.Vector3(-w/2, 0, -h/2),
    new THREE.Vector3(w/2, 0, -h/2),
    new THREE.Vector3(w/2, 0, h/2),
    new THREE.Vector3(-w/2, 0, h/2),
    new THREE.Vector3(-w/2, 0, -h/2)
  );
  var mat = new THREE.LineBasicMaterial({color:0x00ff99, transparent:true, opacity: 0.8});
  mat.color.setHSL(0.6 - ((d/maxBuildingHeight) * 0.6), 1, 0.5);
  this.bottom = new THREE.Line(geo, mat);
  this.bottom.position.copy(pos);
  this.top = this.bottom.clone();
  this.top.position.setY(pos.y+d);
  parent.add(this.bottom);
  parent.add(this.top);
  var sidegeo = new THREE.Geometry();
  sidegeo.vertices.push(
    new THREE.Vector3(-w/2, 0, -h/2),
    new THREE.Vector3(-w/2, d, -h/2),
    new THREE.Vector3(w/2, 0, -h/2),
    new THREE.Vector3(w/2, d, -h/2),
    new THREE.Vector3(w/2, 0, h/2),
    new THREE.Vector3(w/2, d, h/2),
    new THREE.Vector3(-w/2, 0, h/2),
    new THREE.Vector3(-w/2, d, h/2)
  );
  this.sides = new THREE.LineSegments(sidegeo, mat);
  this.sides.position.copy(pos);
  parent.add(this.sides);
}
