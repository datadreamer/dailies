var camera, scene, renderer, composer;
var width, height;
var group;
var controls;
var light;
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
  //group.position.set(-250,0,-250);

  // light for the new solids
  light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(200, 400, 200);
  scene.add(light);

  // create some blocks (5 x 5)
  var blockW = 100;
  var blockH = 100;
  var blockX = 7;
  var blockY = 7;
  var streetWidth = 20;
  var offset = (((blockW+streetWidth) * blockX)-streetWidth) /2 - (blockW/2);
  console.log(offset);
  for(var y=0; y<blockY; y++){
    for(var x=0; x<blockX; x++){
      var pos = new THREE.Vector3(x * (blockW+streetWidth) - offset, 0, y * (blockH+streetWidth) - offset);
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
  var maxLots = 3;
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


  var maxHeight = (1 - (pos.length() / 550)) * maxBuildingHeight;

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
      this.lots.push(new Lot(this.obj, new THREE.Vector3(newW * i - offset, 0, 0), newW, newH, false, maxHeight));
    }
  } else {
    // split block horizontally
    newH = newH/this.numLots;
    var offset = 0;
    if(this.numLots > 1){
      offset = (h-this.sidewalkSize)/2 - newH/2;
    }
    for(var i=0; i<this.numLots; i++){
      this.lots.push(new Lot(this.obj, new THREE.Vector3(0, 0, newH * i - offset), newW, newH, true, maxHeight));
    }
  }

  this.update = function(){

  };
}





// A lot contains one or more buildings.
function Lot(parent, pos, w, h, hor, maxHeight){
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
    var bh = Math.round(Math.random() * (maxHeight - minBuildingHeight)) + minBuildingHeight;
    if(hor){
      // distribute buildings horizontally
      this.buildings.push(new Building(this.obj, new THREE.Vector3(newW * i - offset, 0, 0), newW, newH, bh, maxHeight));
    } else {
      // distribute buildings vertically
      this.buildings.push(new Building(this.obj, new THREE.Vector3(0, 0, newH * i - offset), newW, newH, bh, maxHeight));
    }
  }
}





// A building is a 3d box.
function Building(parent, pos, w, h, d, maxHeight){
  this.pos = pos;
  w = (Math.random()*0.5 + 0.5) * w;
  h = (Math.random()*0.5 + 0.5) * h;

  var geo = new THREE.BoxGeometry(w, d, h);
  var mat = new THREE.MeshPhongMaterial({color:0xffffff});
  this.box = new THREE.Mesh(geo, mat);
  this.box.position.copy(pos);
  this.box.position.setY(pos.y+d/2);
  parent.add(this.box);

  // outline the building
  // var geo = new THREE.Geometry();
  // geo.vertices.push(
  //   new THREE.Vector3(-w/2, 0, -h/2),
  //   new THREE.Vector3(w/2, 0, -h/2),
  //   new THREE.Vector3(w/2, 0, h/2),
  //   new THREE.Vector3(-w/2, 0, h/2),
  //   new THREE.Vector3(-w/2, 0, -h/2)
  // );
  // var mat = new THREE.LineBasicMaterial({color:0x00ff99, transparent:true, opacity: 0.8});
  // mat.color.setHSL(0.6 - ((d/maxBuildingHeight) * 0.6), 1, 0.5);
  // this.bottom = new THREE.Line(geo, mat);
  // this.bottom.position.copy(pos);
  // this.top = this.bottom.clone();
  // this.top.position.setY(pos.y+d);
  // parent.add(this.bottom);
  // parent.add(this.top);
  // var sidegeo = new THREE.Geometry();
  // sidegeo.vertices.push(
  //   new THREE.Vector3(-w/2, 0, -h/2),
  //   new THREE.Vector3(-w/2, d, -h/2),
  //   new THREE.Vector3(w/2, 0, -h/2),
  //   new THREE.Vector3(w/2, d, -h/2),
  //   new THREE.Vector3(w/2, 0, h/2),
  //   new THREE.Vector3(w/2, d, h/2),
  //   new THREE.Vector3(-w/2, 0, h/2),
  //   new THREE.Vector3(-w/2, d, h/2)
  // );
  // this.sides = new THREE.LineSegments(sidegeo, mat);
  // this.sides.position.copy(pos);
  // parent.add(this.sides);
}
