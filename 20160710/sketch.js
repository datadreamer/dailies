var camera, scene, renderer, composer;
var width, height;
var group;
var raycaster, raysphere;
var threshold = 0.1;
var light1, light2, light3, light4;
var mouseIsPressed = false;
var mouse = new THREE.Vector2();
var blocks = [];
var lastRelease = Date.now();
var releaseRate = 150;
var cursorRadius = 100;

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  // setup camera and scene
  camera = new THREE.PerspectiveCamera(60, width/height, 100, 10000);
	camera.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1500));
  scene = new THREE.Scene();

  // add group object to scene to be rendered
  group = new THREE.Group();
  scene.add(group);

  // create plane to use with raycaster
  var geo = new THREE.Geometry();
  geo.vertices.push(
    new THREE.Vector3(-width/2, -height/2, 0),
    new THREE.Vector3(width/2, -height/2, 0),
    new THREE.Vector3(width/2, height/2, 0),
    new THREE.Vector3(-width/2, height/2, 0)
  );
  geo.faces.push(new THREE.Face3(0,1,2));
  geo.faces.push(new THREE.Face3(0,2,3));

  var meshmat = new THREE.MeshBasicMaterial({color: 0xffffff, side:THREE.DoubleSide, transparent:true, opacity:0, blending:THREE["AdditiveBlending"]});
  plane = new THREE.Mesh(geo, meshmat);
  raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = threshold;

  var ld = 300; // light distance
  light1 = new THREE.PointLight(0x0099ff, 1, 1000);
  light1.position.set(ld, ld, ld);
  scene.add(light1);
  light2 = new THREE.PointLight(0x00ff00, 1, 1000);
  light2.position.set(-ld, ld, -ld);
  scene.add(light2);
  light3 = new THREE.PointLight(0x0000ff, 1, 1000);
  light3.position.set(ld, -ld, -ld);
  scene.add(light3);
  light4 = new THREE.PointLight(0xffffff, 1, 1000);
  light4.position.set(-ld, -ld, ld);
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

  renderer.domElement.addEventListener('mousemove', mouseMoved, false);
  renderer.domElement.addEventListener('mousedown', mousePressed, false);
  renderer.domElement.addEventListener('mouseup', mouseReleased, false);
  // update everything when window is resized
  window.addEventListener('resize', onWindowResize, false);
}

function mousePressed(event){
  mouseIsPressed = true;
}

function mouseReleased(event){
  mouseIsPressed = false;
}

function mouseMoved(event){
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersections = raycaster.intersectObject(plane);
  for(var i=0; i<intersections.length; i++){
    console.log(intersections[i].point);
    // create object at intersection point
    if(Date.now() - lastRelease > releaseRate){
      blocks.push(new Block(group, intersections[i].point));
      lastRelease = Date.now();
    }
    break;
  }
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

  for(var i=blocks.length-1; i>=0; i--){
    blocks[i].update(blocks, i);
    if(blocks[i].dead){
      blocks.splice(i,1);
    }
  }



  // render a new frame
  composer.render();
}





function Block(parent, pos){
  this.parent = parent;
  this.size = 100;
  this.pos = pos;
  this.vec = new THREE.Vector3(0,0,0);
  this.damping = 0.95;
  this.repelForce = 0.3;

  this.birth = Date.now();
  this.dead = false;
  this.growing = true;
  this.holding = false;
  this.shrinking = false;

  this.growStart = this.birth;
  this.holdStart = 0;
  this.shrinkStart = 0;
  this.growDuration = 500;
  this.holdDuration = 5000;
  this.shrinkDuration = 3000;

  var geo = new THREE.BoxGeometry(this.size, this.size, this.size);
  var mat = new THREE.MeshPhongMaterial({color:0xffffff, transparent:true, opacity:1});
  this.obj = new THREE.Mesh(geo, mat);
  this.obj.position.copy(this.pos);
  this.obj.scale.set(0.00001,0.00001,0.00001);
  parent.add(this.obj);

  this.update = function(blocks, id){
    // noisy vector
    this.vec.add(new THREE.Vector3(Math.random()*0.2-0.1,Math.random()*0.2-0.1,Math.random()*0.2-0.1));

    // repel from other blocks
    for(var i=0; i<blocks.length; i++){
      if(i != id){
        var dist = this.pos.distanceTo(blocks[i].pos);
        if(dist < (this.size*2) && dist > 0){
          var force = (1 - (this.size*2)/dist);
          var diffNorm = new THREE.Vector3();
          diffNorm.subVectors(blocks[i].pos, this.pos);
          diffNorm.normalize();
          diffNorm.multiplyScalar(force * this.repelForce);
          this.vec.add(diffNorm);
        }
      }
    }

    // block always falling back towards center
    // var dist = this.pos.length();
    // this.vec.sub(this.pos.clone().multiplyScalar(dist * 0.00001));
    // var dist = 0 - this.pos.y;
    // this.vec.y += dist * 0.01;

    // apply forces
    this.pos.add(this.vec);
    this.vec.multiplyScalar(this.damping);
    this.obj.position.copy(this.pos);
    // orient object rotation to always face center
    this.obj.lookAt(new THREE.Vector3(0,0,0));
    this.obj.geometry.verticesNeedUpdate = true;

    if(this.growing){
      var p = (Date.now() - this.growStart) / this.growDuration;
      if(p < 1){
        var sp = this.sinProgress(p);
        this.obj.scale.set(sp,sp,sp);
    } else {
        this.growing = false;
        this.holding = true;
        this.growStart = Date.now();
      }
    } else if(this.holding){
      var p = (Date.now() - this.growStart) / this.holdDuration;
      if(p >= 1){
        this.holding = false;
        this.shrinking = true;
        this.growStart = Date.now();
      }
    } else if(this.shrinking){
      var p = (Date.now() - this.growStart) / this.shrinkDuration;
      if(p < 1){
        var sp = this.sinProgress(p);
        this.obj.scale.set(1-sp,1-sp,1-sp);
        this.obj.material.opacity = 1-sp;
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
