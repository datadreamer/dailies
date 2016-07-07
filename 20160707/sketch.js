var camera, scene, renderer, composer;
var width, height;
var group;
var controls;
var light1, light2, light3, light4;
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
var lastRelease = Date.now();
var releaseRate = 150;

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

  // light n the middle of the boxes
  light1 = new THREE.PointLight(0x0000ff, 1, 1000);
  light1.position.set(0, 0, 500);
  scene.add(light1);
  // light in front, near camera
  light2 = new THREE.PointLight(0xff00ff, 1, 1000);
  light2.position.set(0, 0, 700);
  scene.add(light2);
  // light below
  light3 = new THREE.PointLight(0xff0000, 1, 1000);
  light3.position.set(0, -700, 0);
  scene.add(light3);
  // light above
  light4 = new THREE.PointLight(0x00ff99, 1, 1000);
  light4.position.set(0, 700, 0);
  scene.add(light4);

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

  for(var i=blocks.length-1; i>=0; i--){
    blocks[i].update();
    if(blocks[i].dead){
      blocks.splice(i,1);
    }
  }

  if(Date.now() - lastRelease > releaseRate){
    blocks.push(new Block(group));
    lastRelease = Date.now();
  }

  // render a new frame
  composer.render();
}





function Block(parent){
  this.parent = parent;
  this.growing = true;
  this.holding = false;
  this.shrinking = false;
  this.dead = false;
  this.growStart = Date.now();
  this.growDuration = 1000;
  this.holdDuration = 3000;
  this.shrinkDuration = 1000;
  this.r = width/3;
  this.rot = 0 - Date.now() * 0.001;

  var geo = new THREE.BoxGeometry(30, 1000, 30);
  var mat = new THREE.MeshPhongMaterial({color:0xffffff, transparent:true, opacity:0});
  this.obj = new THREE.Mesh(geo, mat);
  this.obj.scale.set(1,0.00001,1);
  this.targetPos = new THREE.Vector3(Math.sin(Date.now() * 0.001) * this.r, Math.cos(Date.now() * 0.001) * this.r, 0);
  //this.obj.position.set(Math.sin(Date.now() * 0.001) * (this.r+(100*Math.random())), Math.cos(Date.now() * 0.001) * (this.r+(100*Math.random())), 0);
  //this.obj.rotation.set(Math.PI/2, this.rot, 0);
  //this.obj.rotation.set(Math.random()*2 - 1, Math.random()*2 - 1, Math.random()*2 - 1);
  //this.obj.rotation.set(Date.now() * 0.001,Date.now() * 0.001,Date.now() * 0.001);
  parent.add(this.obj);

  this.update = function(){
    if(this.growing){
      var p = (Date.now() - this.growStart) / this.growDuration;
      if(p < 1){
        var sp = this.sinProgress(p);
        this.obj.scale.set(1,sp,1);
        this.obj.material.opacity = sp;
        this.obj.position.copy(this.targetPos.clone().multiplyScalar(sp));
        this.obj.rotation.set(Math.PI/2, this.rot - ((1-sp)*Math.PI), 0);
      } else {
        this.growing = false;
        this.holding = true;
        this.growStart = Date.now();
      }
    } else if(this.holding){
      var p = (Date.now() - this.growStart) / this.holdDuration;
      if(p < 1){
        // do nothing, just wait ass hole.
      } else {
        this.holding = false;
        this.shrinking = true;
        this.growStart = Date.now();
      }
    } else if(this.shrinking){
      var p = (Date.now() - this.growStart) / this.shrinkDuration;
      if(p < 1){
        var sp = this.sinProgress(p);
        this.obj.scale.set(1,1-sp,1);
        this.obj.material.opacity = 1-sp;
        this.obj.position.copy(this.targetPos.clone().multiplyScalar(1+sp));
        this.obj.rotation.set(Math.PI/2, this.rot - (sp*Math.PI), 0);
      } else {
        this.shrinking = false;
        this.dead = true;
        this.parent.remove(this.obj);
      }
    }
  };

  this.sinProgress = function(p){
    return -0.5 * (Math.cos(Math.PI*p) - 1);
  };
}
