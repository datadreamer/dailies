var camera, scene, renderer, composer;
var width, height;
var group;
var planet;
var xRot = 0;
var yRot = 0.001;
var zRot = 0;
var mouseIsPressed = false;
var keyIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var texture, textureMat;

// matrices for camera rig
var m = new THREE.Matrix4();  // master
var m1 = new THREE.Matrix4(); // alpha  (X)
var m2 = new THREE.Matrix4().makeRotationY(yRot); // beta   (Y)
var m3 = new THREE.Matrix4(); // gamma  (Z)
m.multiplyMatrices(m1,m2);
var alpha = 0;
var beta = 0;
var gamma = 0;

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  // setup camera and scene
  camera = new THREE.PerspectiveCamera(60, width/height, 100, 5000);
  //camera.position.z = 1500;
	camera.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1500));
	//camera.applyMatrix(new THREE.Matrix4().makeRotationX(1));
  scene = new THREE.Scene();

  // add group object to scene to be rendered
  group = new THREE.Group();
  scene.add(group);

  // load texture for planet
  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("world_topo_4096.jpg");

  // create planet
  planet = new Planet(group, 250, 64, texture);

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

  renderer.domElement.addEventListener('mousemove', mouseMoved, false);
	renderer.domElement.addEventListener('mousedown', mousePressed, false);
	renderer.domElement.addEventListener('mouseup', mouseReleased, false);
  renderer.domElement.addEventListener('wheel', mouseWheel, false);
  window.addEventListener('keypress', keyPressed, false);
  window.addEventListener('keyup', keyReleased, false);
  window.addEventListener('resize', onWindowResize, false);
}

function keyPressed(event){
  keyIsPressed = true;
}

function keyReleased(event){
  keyIsPressed = false;
}

function mousePressed(event){
  mouseIsPressed = true;
  mouseStart.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouseStart.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function mouseMoved(event){
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if(mouseIsPressed){
    // rotating camera
    alpha += (mouse.y - mouseStart.y) * 0.001;
    beta -= (mouse.x - mouseStart.x) * 0.001;
    m1.makeRotationX(alpha);
    m2.makeRotationY(beta);
    //m3.makeRotationZ(gamma);
    m.multiplyMatrices(m1,m2);
    //m.multiply(m3);
  }
}

function mouseReleased(event){
  mouseIsPressed = false;
}

function mouseWheel(event){
  // TODO: update camera dollying
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
  camera.applyMatrix(m);
	camera.updateMatrixWorld();

  // DO EVERYTHING HERE

  // render a new frame
  composer.render();
}




function Planet(parent, radius, detail, texture){
  var geo = new THREE.SphereGeometry(radius, detail, detail);
  var mat = new THREE.MeshBasicMaterial({map:texture});
  this.obj = new THREE.Mesh(geo, mat);
  parent.add(this.obj);
}
