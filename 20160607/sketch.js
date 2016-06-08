var camera, scene, renderer;
var width, height;
var texture;
var group;
var minSpriteSize = 256;
var maxSpriteSize = 512;
var xRot = 0.001;
var yRot = 0.0012;
var damping = 0.97;
var mouseIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(60, width/height, 100, 2000);
  camera.position.z = 1500;
  scene = new THREE.Scene();

  // create sprites
  var numSprites = 200;
  var radius = 500;
  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("gradient.png");
  group = new THREE.Group();
  var mat = new THREE.SpriteMaterial({map: texture});

  for (var i=0; i < numSprites; i++) {
    // generate random position
    var x = Math.random() - 0.5;
    var y = Math.random() - 0.5;
    var z = Math.random() - 0.5;

    // clone material and adjust color
    material = mat.clone();
    material.color.setHSL(Math.random()*0.3 + 0.5, 1, 0.5);
    material.map.offset.set(-0.5,-0.5);
    material.map.repeat.set(2,2);
    material.transparent = true;
    material.blending = THREE["AdditiveBlending"];

    // create new sprite with unique material
    var sprite = new THREE.Sprite(material);
    sprite.position.set(x,y,z);
    sprite.position.normalize();
    sprite.position.multiplyScalar(radius);
    var size = (Math.random() * (maxSpriteSize-minSpriteSize)) + minSpriteSize;
    sprite.scale.set(size, size, 1.0);

    // add sprite to group object
    group.add(sprite);
  }

  // add group object to scene to be rendered
  scene.add(group);

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  renderer.domElement.addEventListener('mousemove', mouseMoved, false);
	renderer.domElement.addEventListener('mousedown', mousePressed, false);
	renderer.domElement.addEventListener('mouseup', mouseReleased, false);
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

function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function draw() {
  requestAnimationFrame(draw);

  // rotate group object using vectors from mouse activity
  group.rotation.x += xRot;
  group.rotation.y += yRot;

  // dampen rotation vector to prevent madness
  xRot *= damping;
  yRot *= damping;

  // render a new frame
  renderer.clear();
  renderer.render(scene, camera);

}
