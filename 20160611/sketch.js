var camera, scene, renderer, composer;
var width, height;
var group;
var xRot = 0;
var yRot = 0;
var zRot = 0;
var mouseIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var rings = [];

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

  // create ring objects
  var numRings = 30;
  var radius = 300;
  var segments = 20;
  var noise = 2;
  var maxopacity = 0.3;
  for(var i=0; i<numRings; i++){
    var rad = radius + i * 5;
    var seg = segments + i;
    var n = noise * i;
    var opacity = maxopacity - ((i / numRings)*maxopacity);
    var ring = new NoisyRing(group, rad, seg, n, opacity);
    rings.push(ring);
  }

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
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

  // update rings
  for(var i=0; i<rings.length; i++){
    rings[i].lines.rotation.z += rings[i].zRot;
    rings[i].points.rotation.z += rings[i].zRot;
  }

  // render a new frame
  composer.render();
}




function NoisyRing(parent, radius, segments, noise, maxopacity){
  this.zRot = Math.random()*0.001 - 0.0005;
  var a = Math.random() * Math.PI*2;
  var angle = (Math.PI*2) / segments;
  this.geo = new THREE.Geometry();
  for (var i=0; i<segments; i++) {
    a += angle;
    // generate position on ring with some noise applied
    var x = (Math.cos(a) * radius) + ((Math.random() * noise) - (noise/2));
    var y = (Math.sin(a) * radius) + ((Math.random() * noise) - (noise/2));
    var z = ((Math.random() * noise) - (noise/2));
    this.geo.vertices.push(new THREE.Vector3(x, y, z));
  }
  // setup material and objects for points and lines
  var pointMat = new THREE.PointsMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.8 + 0.2, blending:THREE["AdditiveBlending"]});
  var lineMat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:maxopacity, blending:THREE["AdditiveBlending"]});
  this.points = new THREE.Points(this.geo, pointMat);
  // add first point to the end to close shape
  this.geo.vertices.push(this.geo.vertices[0]);
  this.lines = new THREE.Line(this.geo, lineMat);
  // add points and lines to scene
  parent.add(this.points);
  parent.add(this.lines);
}

NoisyRing.prototype = {
  constructor:NoisyRing,

  update:function(){
    this.lines.rotation.z += this.zRot;
  }
}
