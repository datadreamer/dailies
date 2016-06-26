var camera, scene, renderer, composer;
var width, height;
var group, light1, light2, light3, light4;
var mesh;
var raycaster, raysphere;
var cursor;
var threshold = 0.1;
var xRot = 0;
var yRot = 0;
var zRot = 0.001;
var mouseIsPressed = false;
var keyIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var rotateZ = new THREE.Matrix4().makeRotationZ(zRot);

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  // setup camera and scene
  camera = new THREE.PerspectiveCamera(60, width/height, 100, 5000);
  camera.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1000));
	camera.applyMatrix(new THREE.Matrix4().makeRotationX(1));
  scene = new THREE.Scene();

  // add group object to scene to be rendered
  group = new THREE.Group();
  scene.add(group);

  // add lights
  light1 = new THREE.PointLight( 0x0099ff, 1, 1000 );
  light1.position.set(250, 250, 250);
  scene.add(light1);
  light2 = new THREE.PointLight( 0xffff00, 1, 1000 );
  light2.position.set(-250, -250, 250);
  scene.add(light2);
  light3 = new THREE.PointLight( 0xff0000, 1, 1000 );
  light3.position.set(250, 250, -250);
  scene.add(light3);
  light4 = new THREE.PointLight( 0xff0000, 1, 1000 );
  light4.position.set(-250, -250, -250);
  scene.add(light4);

  // create sphere to use as our mesh
  var spheregeo = new THREE.BoxGeometry( 250, 250, 250, 5, 5, 5);
  var sphere = new THREE.Mesh(spheregeo, new THREE.MeshPhongMaterial({color:0xffffff, side: THREE.DoubleSide, shading: THREE.FlatShading}));
  group.add(sphere);

  // create custom mesh that modifies object vertices with vectors
  mesh = new Mesh(group, sphere);

  // create sphere to use with raycaster
  var raymat = new THREE.MeshBasicMaterial({color: 0xffffff, side:THREE.DoubleSide, transparent:true, opacity:0, blending:THREE["AdditiveBlending"]});
  raysphere = new THREE.Mesh(spheregeo, raymat);
  //group.add(plane); // doesn't need to render to work with raycaster

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // raycaster for interacting with mesh
  raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = threshold;

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
    zRot -= (mouse.x - mouseStart.x) * 0.001;
    rotateZ = new THREE.Matrix4().makeRotationZ(zRot);
  }
}

function mouseReleased(event){
  mouseIsPressed = false;
}

function mouseWheel(event){
  // TODO: fix this so it works
  //camera.position.z += event.deltaY * 0.1;
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
  camera.applyMatrix(rotateZ);
  camera.updateMatrixWorld();

  if(!mouseIsPressed){
    raycaster.setFromCamera(mouse, camera);
  	var intersections = raycaster.intersectObject(raysphere);
    for(var i=0; i<intersections.length; i++){
      //console.log(intersections[i]);
      //cursor.position.copy(intersections[i].point);
      //cursor.position.z = 20;
      mesh.applyForce(intersections[i].point);
      break;
    }
  }

  // update mesh
  mesh.update();

  // render a new frame
  composer.render();
}





function Mesh(parent, obj){
  this.parent = parent;
  this.obj = obj;
  this.points = [];
  this.radius = 100;

  // create meshpoints using vertices from obj
  for(var i=0; i<obj.geometry.vertices.length; i++){
    var mp = new MeshPoint(parent, obj.geometry.vertices[i]);
    this.points.push(mp);
  }

  this.update = function(){
    // update point positions
    for(var i=0; i<this.points.length; i++){
      this.points[i].update();
    }
    this.obj.geometry.verticesNeedUpdate = true;
  };

  this.applyForce = function(clickPos){
    for(var i=0; i<this.points.length; i++){
      // all points are repelled from cursor
      var force = (1 - this.radius/this.points[i].pos.length());
      var diffNorm = new THREE.Vector3();
      diffNorm.subVectors(clickPos, this.points[i].pos);
      diffNorm.normalize();
      //diffNorm.negate();
      diffNorm.multiplyScalar(force * 3);
      this.points[i].vec.add(diffNorm);
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

  this.update = function(){
    // noisy vector
    // this.vec.add(new THREE.Vector3(Math.random()*0.2-0.1,Math.random()*0.2-0.1,Math.random()*0.2-0.1));

    // get the distance of the point from its start position
    var springDist = this.startPos.distanceTo(this.pos);
    if(springDist > 0){
      // get the normalized vector of the spring tether
      var normSpring = new THREE.Vector3();
      normSpring.subVectors(this.startPos, this.pos);
      this.vec.add(normSpring.multiplyScalar(springDist * this.springMult));
    }

    // apply forces
    this.pos.add(this.vec);
    this.vec.multiplyScalar(this.damping);

    // update point opacity and geometry
    // this.obj.material.opacity = this.vec.length();
    // this.obj.geometry.verticesNeedUpdate = true;
  };

}
