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
var texture, textureMat;
var minSpriteSize = 8;
var maxSpriteSize = 24;

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

  // load texture for particle sprites
  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("gradient.png");
  textureMat = new THREE.SpriteMaterial({map:texture, transparent:true, blending:THREE["AdditiveBlending"]});

  var radius = 300;
  var num = 300;
  var blobsa = 4 * Math.PI * (radius*radius);     // surface area of blob
  var size = Math.sqrt((blobsa / num) / Math.PI); // radius of blob point
  // create mesh (parent, gridx, gridy, width, height);
  mesh = new Mesh(group, 10, 10, 1000, 1000);

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
      zRot += (mouse.x - mouseStart.x) * 0.001;
    } else {
      // applying force to mesh points
      // for(var n=0; n<mesh.points.length; n++){
      //   mesh.points[n].vec.x += (mouse.x - mouseStart.x) * 0.1;
      //   mesh.points[n].vec.y += (mouse.y - mouseStart.y) * 0.1;
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

  if(mouseIsPressed && keyIsPressed){
    mesh.applyGravity();
  }

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
  this.radius = Math.sqrt(gx*gx + gy*gy);

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
      var mp = new MeshPoint(parent, pos, gx, gy, x, y, sx*2);
      this.points.push(mp);
    }
  }

  // create lines between meshpoints
  for(var i=0; i<this.points.length; i++){
    this.points[i].findNeighbors(this.points, i);
  }

  this.update = function(){
    // update point positions
    for(var i=0; i<this.points.length; i++){
      this.points[i].update(this.points, i);
    }
    // draw lines between points
    for(var i=0; i<this.points.length; i++){
      this.points[i].drawLines(this.points, i);
    }
  };

  this.applyGravity = function(){
    for(var i=0; i<this.points.length; i++){
      // all points are attracted towards center of mesh
      var force = (1 - this.radius/this.points[i].pos.length());
      var diffNorm = this.points[i].pos.clone();
      diffNorm.normalize();
      diffNorm.negate();
      diffNorm.multiplyScalar(force);
      this.points[i].vec.add(diffNorm);
    }
  }
}





function MeshPoint(parent, pos, gx, gy, x, y, size){
  this.parent = parent;
  this.pos = pos;
  this.gx = gx; // grid dimensions
  this.gy = gy;
  this.x = x;   // grid position of this point
  this.y = y;
  this.size = size;
  this.vec = new THREE.Vector3(0,0,0);
  this.startPos = pos.clone();
  this.damping = 0.95;
  this.springMult = 0.02;
  this.siblingForce = 0.5;
  this.repelForce = 0.1;
  this.linemat = new THREE.LineBasicMaterial({color:0x0099ff, blending:THREE["AdditiveBlending"], transparent:true, opacity:0.3});
  this.linemat.color.setHSL(Math.random()*0.1 + 0.5, 1, 0.5);
  this.facemat = new THREE.MeshLambertMaterial({color:0xffffff, shading:THREE.FlatShading, side:THREE.DoubleSide});

  // create point object
  var geo = new THREE.Geometry();
  geo.vertices.push(this.pos);
  var mat = new THREE.PointsMaterial({color:0xffffff, blending:THREE["AdditiveBlending"], transparent:true, opacity:0.5});
  this.obj = new THREE.Points(geo, mat);
  parent.add(this.obj);

  // create sprite
  var spriteMat = textureMat.clone();
  //spriteMat.color.setHSL(0.15, 1, 1);
  //spriteMat.opacity = Math.random()*0.5;
  this.sprite = new THREE.Sprite(spriteMat);
  this.sprite.position.copy(this.pos);
  var size = (Math.random() * (maxSpriteSize-minSpriteSize)) + minSpriteSize;
  this.sprite.scale.set(size, size, 1.0);
  parent.add(this.sprite);

  // arrays for force direction algorithm
  this.connections = [];  // Three.Line objects
  this.siblings = [];     // MeshPoint objects
  this.neighbors = [];    // MeshPoint objects

  this.update = function(points, id){
    // noisy vector
    this.vec.add(new THREE.Vector3(Math.random()*0.2-0.1,Math.random()*0.2-0.1,Math.random()*0.2-0.1));

    for(var i=0; i<points.length; i++){
      if(i != id){
        dist = this.pos.distanceTo(points[i].pos);
        // meshpoint repelled from other meshpoints.
        if(dist < this.size && dist > 0){
          var force = (1 - this.size/dist);
          var diffNorm = new THREE.Vector3();
          diffNorm.subVectors(points[i].pos, this.pos);
          diffNorm.normalize();
          diffNorm.multiplyScalar(force * this.repelForce);
          this.vec.add(diffNorm);
        }
      }
    }

    // meshpoint attracted to neighboring meshpoints.
    for(var i=0; i<this.siblings.length; i++){
      dist = this.pos.distanceTo(this.siblings[i].pos);
      if(dist > this.size){
        var force = (1 - this.size/dist);
        var diffNorm = new THREE.Vector3();
        diffNorm.subVectors(this.siblings[i].pos, this.pos);
        diffNorm.normalize();
        diffNorm.multiplyScalar(force * this.siblingForce);
        this.vec.add(diffNorm);
      }
    }

    // meshpoint always falling back towards 0 z
    var dist = 0 - this.pos.z;
    this.vec.z += dist * 0.01;

    // apply forces
    this.pos.add(this.vec);
    this.vec.multiplyScalar(this.damping);

    // update point and sprite opacity and geometry
    this.obj.material.opacity = this.vec.length()*0.5;
    this.obj.geometry.verticesNeedUpdate = true;
    var spriteOpacity = Math.min(Math.max(this.vec.length()*0.1, 0.05), 0.5);
    this.sprite.material.opacity = spriteOpacity;
    this.sprite.position.copy(this.pos);

  };

  this.findNeighbors = function(points, id){
    if(this.x < this.gx-1){
      // connect to next point to the right
      this.siblings.push(points[id+1]);
    }
    if(this.x > 0){
      // connect to neighbor on left
      this.siblings.push(points[id-1]);
    }
    if(this.y > 0){
      // connect to point above
      this.siblings.push(points[id-this.gx]);
    }
    if(this.y < this.gy-1){
      // connect to neighbor below
      this.siblings.push(points[id+this.gx]);
    }
  };

  this.drawLines = function(points, id){
    var dist;
    // for each point with id less than this...
    for(var i=0; i<id; i++){
      dist = this.pos.distanceTo(points[i].pos);
      // if within connecting distance...
      if(dist < this.size && dist > 0){
        // check if already drawing a line to this point
        if(this.connections.hasOwnProperty("L"+i)){
          // if so, update location and opacity according to distance
          this.connections["L"+i].geometry.verticesNeedUpdate = true;
          this.connections["L"+i].material.opacity = ((this.size - dist) / this.size);
        } else {
          // if not, create a new line to this point, opacity by distance
          var geo = new THREE.Geometry();
          geo.vertices.push(this.pos, points[i].pos);
          var line = new THREE.Line(geo, this.linemat.clone());
          line.material.opacity = ((this.size - dist) / this.size);
          this.parent.add(line);
          this.connections["L"+i] = line;
          this.neighbors.push(i);
        }
      }
    }
    // going backwards, for each connection...
    for(var i=this.neighbors.length-1; i>=0; i--){
      var pid = this.neighbors[i];
      var dist = this.pos.distanceTo(points[pid].pos);
      if(dist > this.size){
        // remove line
        var line = this.connections["L"+pid];
        this.parent.remove(line);
        this.neighbors.splice(i,1);
        delete this.connections["L"+pid];
      }
    }
  };
}
