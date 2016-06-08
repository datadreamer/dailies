var camera, scene, renderer;
var width, height;
var texture;
var group;
var minSpriteSize = 16;
var maxSpriteSize = 32;
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

  camera = new THREE.PerspectiveCamera(60, width/height, 100, 5000);
  camera.position.z = 1500;
  scene = new THREE.Scene();

  // create sprites
  var numSprites = 50;
  var radius = 200;
  var spacing = 50;
  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("gradient.png");
  group = new THREE.Group();
  var mat = new THREE.SpriteMaterial({map: texture});

  var a = 0;
  var angle = (Math.PI*2) / (numSprites / 3);

  for (var i=0; i < numSprites; i++) {
    // clone material and adjust color
    material = mat.clone();
    material.color.setHSL(0.15, 1, 0.5 + Math.random()*0.5);
    material.map.offset.set(-0.5,-0.5);
    material.map.repeat.set(2,2);
    material.transparent = true;
    material.blending = THREE["AdditiveBlending"];

    a += angle;
    // generate position on helix
    var x = Math.cos(a) * radius;
    var y = i*spacing - (numSprites*(spacing/2));
    var z = Math.sin(a) * radius;

    // create new sprite with unique material
    var sprite = new THREE.Sprite(material);
    sprite.position.set(x,y,z);
    var size = (Math.random() * (maxSpriteSize-minSpriteSize)) + minSpriteSize;
    sprite.scale.set(size, size, 1.0);

    // create opposite pairing
    var x2 = Math.cos(a+Math.PI) * radius;
    var z2 = Math.sin(a+Math.PI) * radius;
    var material2 = material.clone();
    material2.color.setHSL(0, 1, 0.5 + Math.random()*0.5);
    var sprite2 = new THREE.Sprite(material2);
    sprite2.position.set(x2,y,z2);
    var size = (Math.random() * (maxSpriteSize-minSpriteSize)) + minSpriteSize;
    sprite2.scale.set(size, size, 1.0);

    // create line connecting pair
    var lineMaterial = new THREE.LineBasicMaterial({color:0xffffff});
    lineMaterial.transparent = true;
    lineMaterial.opacity = Math.random()*0.25 + 0.1;
    lineMaterial.blending = THREE["AdditiveBlending"];
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x2, y, z2)
    );
    var line = new THREE.Line(geometry, lineMaterial);

    // create line connecting to next point on helix
    if(i < numSprites){
      // connect first helix
      var x3 = Math.cos(a+angle) * radius;
      var y3 = (i+1)*spacing - (numSprites*(spacing/2));
      var z3 = Math.sin(a+angle) * radius;
      var helixGeometry = new THREE.Geometry();
      helixGeometry.vertices.push(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x3, y3, z3)
      );
      var helixLine = new THREE.Line(helixGeometry, lineMaterial);

      // connect second helix
      var x4 = Math.cos(a+angle + Math.PI) * radius;
      var z4 = Math.sin(a+angle + Math.PI) * radius;
      var helixGeometry2 = new THREE.Geometry();
      helixGeometry2.vertices.push(
        new THREE.Vector3(x2, y, z2),
        new THREE.Vector3(x4, y3, z4)
      );
      var helixLine2 = new THREE.Line(helixGeometry2, lineMaterial);
    }

    // add sprite to group object
    group.add(sprite);
    group.add(sprite2);
    group.add(line);
    group.add(helixLine);
    group.add(helixLine2);
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
  // xRot *= damping;
  // yRot *= damping;

  // render a new frame
  renderer.clear();
  renderer.render(scene, camera);

}
