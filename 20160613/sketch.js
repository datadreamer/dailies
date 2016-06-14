var camera, scene, renderer, composer;
var width, height;
var group;
var blob;
var xRot = 0;
var yRot = 0.001;
var zRot = 0;
var mouseIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var blobPoints = [];

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  // setup camera and scene
  camera = new THREE.PerspectiveCamera(60, width/height, 100, 5000);
  camera.position.z = 1500;
  scene = new THREE.Scene();

  // add group object to scene to be rendered
  group = new THREE.Group();
  scene.add(group);

  // create blob
  blob = new Blob(group, 300, 500);

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
  window.addEventListener('resize', onWindowResize, false);
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
    yRot += (mouse.x - mouseStart.x) * 0.001;
    xRot -= (mouse.y - mouseStart.y) * 0.001;
  }
}

function mouseReleased(event){
  mouseIsPressed = false;
}

function mouseWheel(event){
  camera.position.z += event.deltaY * 0.1;
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

  // rotate group object using vectors from mouse activity
  group.rotation.x += xRot;
  group.rotation.y += yRot;
  group.rotation.z += zRot;

  // update blob
  blob.update();

  // render a new frame
  composer.render();
}




function Blob(parent, radius, num){
  this.radius = radius;
  this.points = [];
  this.geo = new THREE.Geometry();
  this.mat = new THREE.PointsMaterial({color:0xffffff, blending:THREE["AdditiveBlending"], vertexColors:THREE.VertexColors});

  // create blobpoints
  var colors = [];
  for(var i=0; i<num; i++){
    var pos = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
    pos.normalize();
    pos.multiplyScalar(radius + Math.random()*radius);
    var c = Math.random();
    colors.push(new THREE.Color(c,c,c));
    this.points.push(new BlobPoint(parent, pos, radius));
    this.geo.vertices.push(pos);
  }
  this.geo.colors = colors;

  // create point objects to render
  this.obj = new THREE.Points(this.geo, this.mat);
  parent.add(this.obj);

  this.update = function(){
    for(var i=0; i<this.points.length; i++){
      this.points[i].update();
      this.obj.geometry.vertices[i].copy(this.points[i].pos);
    }
    this.obj.geometry.verticesNeedUpdate = true;
  };
}





function BlobPoint(parent, pos, radius){
  this.pos = pos;
  this.radius = radius;
  this.vec = new THREE.Vector3(0,0,0);
  this.startPos = pos.clone();
  this.damping = Math.random()*0.03 + 0.95;

  this.update = function(){
    // 1. blobpoint attracted to AND repelled from center
    var dist = this.pos.length();
    var force = (1 - this.radius/dist);
    var xdiffNorm = (0-this.pos.x) / dist;
    var ydiffNorm = (0-this.pos.y) / dist;
    var zdiffNorm = (0-this.pos.z) / dist;
    this.vec.x += xdiffNorm * force;
    this.vec.y += ydiffNorm * force;
    this.vec.z += zdiffNorm * force;

    // 2. blobpoint repelled from other blobpoints

    // apply forces
    this.pos.x += this.vec.x;
    this.pos.y += this.vec.y;
    this.pos.z += this.vec.z;
    this.vec.x *= this.damping;
    this.vec.y *= this.damping;
    this.vec.z *= this.damping;
  };
}
