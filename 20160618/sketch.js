var camera, scene, renderer, composer;
var width, height;
var group;
var mesh;
var xRot = 0;
var yRot = 0;
var zRot = 0.001;
var mouseIsPressed = false;
var keyIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();

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
  group.rotation.x = -Math.PI * 0.33;

  var radius = 300;
  var num = 300;
  var blobsa = 4 * Math.PI * (radius*radius);     // surface area of blob
  var size = Math.sqrt((blobsa / num) / Math.PI); // radius of blob point
  // create mesh (parent, gridx, gridy, width, height);
  mesh = new Mesh(group, 20, 20, 1000, 1000);

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
    if(!keyIsPressed){
      // rotating group
      yRot += (mouse.x - mouseStart.x) * 0.001;
      xRot -= (mouse.y - mouseStart.y) * 0.001;
    } else {
      // applying force to blob points
      // for(var i=0; i<blobs.length; i++){
      //   for(var n=0; n<blobs[i].points.length; n++){
      //     blobs[i].points[n].vec.x += (mouse.x - mouseStart.x) * 0.1;
      //     blobs[i].points[n].vec.y += (mouse.y - mouseStart.y) * 0.1;
      //   }
      // }
    }
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

  // update mesh
  mesh.update();

  // render a new frame
  composer.render();
}





function Mesh(parent, gx, gy, w, h){
  this.parent = parent;
  this.gx = gx;
  this.gy = gy;
  this.w = w;
  this.h = h;

  // create meshpoints
  this.points = [];
  var sx = w / gx;
  var sy = h / gy;
  for(var y=0; y<gy; y++){
    for(var x=0; x<gx; x++){
      var xpos = (x * sx) - (w / 2) + (sx/2);
      var ypos = (y * sy) - (h / 2) + (sy/2);
      var zpos = 0;
      var pos = new THREE.Vector3(xpos, ypos, zpos);
      var mp = new MeshPoint(parent, pos);
      this.points.push(mp);
    }
  }

  this.update = function(){
    // update point positions
    for(var i=0; i<this.points.length; i++){
      this.points[i].update();
    }
    // draw lines between points
    for(var i=0; i<this.points.length; i++){
      //this.points[i].drawLines(this.points, i);
    }
  }
}





function MeshPoint(parent, pos){
  this.parent = parent;
  this.pos = pos;
  this.vec = new THREE.Vector3(0,0,0);
  this.startPos = pos.clone();
  this.damping = Math.random()*0.03 + 0.95;
  this.springMult = 0.01;
  this.repelForce = 0.1;
  this.linemat = new THREE.LineBasicMaterial({color:0x0099ff, blending:THREE["AdditiveBlending"], transparent:true, opacity:0.2});
  // create point object
  var geo = new THREE.Geometry();
  geo.vertices.push(this.pos);
  var mat = new THREE.PointsMaterial({color:0xffffff, blending:THREE["AdditiveBlending"], transparent:true, opacity:0.5});
  this.obj = new THREE.Points(geo, mat);
  parent.add(this.obj);

  this.update = function(){
    // noisy vector
    this.vec.add(new THREE.Vector3(Math.random()*0.2-0.1,Math.random()*0.2-0.1,Math.random()*0.2-0.1));

    // get the distance of the point from its start position
    var springDist = this.startPos.distanceTo(this.pos);
    if(springDist > 0){
      // get the normalized vector of the spring tether
      var normSpring = new THREE.Vector3();
      normSpring.subVectors(this.startPos, this.pos);
      this.vec.add(normSpring.multiplyScalar(springDist * this.springMult));
    }

    // apply forces
    this.pos.x += this.vec.x;
    this.pos.y += this.vec.y;
    this.pos.z += this.vec.z;
    this.vec.x *= this.damping;
    this.vec.y *= this.damping;
    this.vec.z *= this.damping;

    // update point opacity and geometry
    this.obj.material.opacity = this.vec.length();
    this.obj.geometry.verticesNeedUpdate = true;
  }
}
