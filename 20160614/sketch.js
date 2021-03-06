var camera, scene, renderer, composer;
var width, height;
var group;
var blob;
var xRot = 0;
var yRot = 0;
var zRot = 0;
var mouseIsPressed = false;
var keyIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var blobs = [];

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

  var radius = 300;
  var num = 100;
  var blobsa = 4 * Math.PI * (radius*radius);     // surface area of blob
  var size = Math.sqrt((blobsa / num) / Math.PI); // radius of blob point
  // create blob (parent, radius, size, num, hue);
  blobs.push(new Blob(group, radius, size*2, num, 0.5));

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
      for(var i=0; i<blobs.length; i++){
        for(var n=0; n<blobs[i].points.length; n++){
          blobs[i].points[n].vec.x += (mouse.x - mouseStart.x) * 0.1;
          blobs[i].points[n].vec.y += (mouse.y - mouseStart.y) * 0.1;
        }
      }
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

  // update blob
  for(var i=0; i<blobs.length; i++){
    blobs[i].update();
  }

  // render a new frame
  composer.render();
}




function Blob(parent, radius, size, num, hue){
  this.radius = radius;
  this.points = [];
  this.geo = new THREE.Geometry();
  this.mat = new THREE.PointsMaterial({color:0xffffff, blending:THREE["AdditiveBlending"], vertexColors:THREE.VertexColors});
  var linemat = new THREE.LineBasicMaterial({color:0xffffff, blending:THREE["AdditiveBlending"], transparent:true, opacity:0.1});

  // create blobpoints
  var colors = [];
  for(var i=0; i<num; i++){
    var pos = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
    pos.normalize();
    pos.multiplyScalar(radius);
    var c = new THREE.Color(0,0,0);
    c.setHSL(hue, 1, 0.5 + Math.random()*0.5);
    colors.push(c);
    this.points.push(new BlobPoint(parent, pos, radius, size));
    this.geo.vertices.push(pos);
  }
  this.geo.colors = colors;

  // create point objects to render
  this.obj = new THREE.Points(this.geo, this.mat);
  this.lines = new THREE.Line(this.geo, linemat);
  parent.add(this.obj);
  parent.add(this.lines);

  this.update = function(){
    for(var i=0; i<this.points.length; i++){
      this.points[i].update(this.points, i);
      this.obj.geometry.vertices[i].copy(this.points[i].pos);
    }
    this.obj.geometry.verticesNeedUpdate = true;
  };
}





function BlobPoint(parent, pos, radius, size){
  this.pos = pos;
  this.radius = radius;
  this.size = size;
  this.vec = new THREE.Vector3(0,0,0);
  this.startPos = pos.clone();
  this.damping = Math.random()*0.03 + 0.95;
  this.siblingForce = 0.5;
  this.repelForce = 0.1;

  this.update = function(points, id){
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
    for(var i=0; i<points.length; i++){
      dist = this.pos.distanceTo(points[i].pos);
      if(dist < this.size && dist > 0){
        var force = (1 - this.size/dist);
        var xdiffNorm = (points[i].pos.x-this.pos.x) / dist;
        var ydiffNorm = (points[i].pos.y-this.pos.y) / dist;
        var zdiffNorm = (points[i].pos.z-this.pos.z) / dist;
        this.vec.x += xdiffNorm * force * this.repelForce;
        this.vec.y += ydiffNorm * force * this.repelForce;
        this.vec.z += zdiffNorm * force * this.repelForce;
      }

      // 2.5. blobpoint attracted to older sibling blob
      if(i == id-1){
        if(dist > this.size){
          var force = (1 - this.size/dist);
          var xdiffNorm = (points[i].pos.x-this.pos.x) / dist;
          var ydiffNorm = (points[i].pos.y-this.pos.y) / dist;
          var zdiffNorm = (points[i].pos.z-this.pos.z) / dist;
          this.vec.x += xdiffNorm * force * this.siblingForce;
          this.vec.y += ydiffNorm * force * this.siblingForce;
          this.vec.z += zdiffNorm * force * this.siblingForce;
        }
      }
    }

    // apply forces
    this.pos.x += this.vec.x;
    this.pos.y += this.vec.y;
    this.pos.z += this.vec.z;
    this.vec.x *= this.damping;
    this.vec.y *= this.damping;
    this.vec.z *= this.damping;
  };
}
