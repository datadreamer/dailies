var camera, scene, renderer, composer;
var width, height;
var group;
var planet;
var planetRadius = 500;
var xRot = 0;
var yRot = 0.001;
var zRot = 0;
var mouseIsPressed = false;
var keyIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var texture, textureMat;

// matrices for camera rig
var m = new THREE.Matrix4();  // master
var m1 = new THREE.Matrix4(); // alpha  (X)
var m2 = new THREE.Matrix4().makeRotationY(yRot); // beta   (Y)
var m3 = new THREE.Matrix4(); // gamma  (Z)
m.multiplyMatrices(m1,m2);
var alpha = 0;
var beta = 0;
var gamma = 0;
var damping = 0.97;

setup();
draw();

function setup() {
  width = window.innerWidth;
  height = window.innerHeight;

  // setup camera and scene
  camera = new THREE.PerspectiveCamera(60, width/height, 100, 5000);
  //camera.position.z = 1500;
	camera.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1500));
	//camera.applyMatrix(new THREE.Matrix4().makeRotationX(1));
  scene = new THREE.Scene();

  // add group object to scene to be rendered
  group = new THREE.Group();
  scene.add(group);

  // load texture for planet
  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("blueearth4k.jpg");

  // create planet
  planet = new Planet(group, planetRadius, 64, texture);

  // load city data from file
  var csvRequest = new Request({url:"citiesnum.txt", onSuccess:dataLoaded}).send();

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

function dataLoaded(response){
  lines = response.split("\n");
  var pointgeo = new THREE.Geometry();
  var pointmat = new THREE.PointsMaterial({vertexColors:THREE.VertexColors});
  var max = 0;  // population of largest city
  var lastLat = 0;
  var lastLon = 0;
  var lastPos;
  for(var i=0; i<lines.length; i++){
    var line = lines[i].split(",");
    if(line[3] > max){
      max = line[3];
    }
    var pos = geoToXyz(line[1], line[2], planetRadius);
    var normpop = line[3] / max;
    var c = new THREE.Color();
    //c.setHSL(0.7 - normpop * 0.7, 1, 0.5);
    c.setHSL(normpop * 0.2, 1, 0.5);
    //console.log(line[0], line[1], line[2], pos);
    pointgeo.vertices.push(pos);
    pointgeo.colors.push(c);
    // create curve connecting to previous point
    if(i > 0 && i < 100){
      //createCurve(lastLat, lastLon, line[1], line[2], planetRadius*2, 50);
      createCurve(lastPos, pos, planetRadius, 50, c);
    }
    lastLat = line[1];
    lastLon = line[2];
    lastPos = pos;
  }
  var points = new THREE.Points(pointgeo, pointmat);
  group.add(points);
}

// wtf is this guy doing
// https://brunodigiuseppe.wordpress.com/2015/02/14/flight-paths-with-threejs/

function createCurve(startPos, endPos, elevation, detail, c){
  var dist = startPos.distanceTo(endPos);
  var controlStart = startPos.clone();
  var controlEnd = endPos.clone();
  var xC = (0.5 * (startPos.x + endPos.x));
  var yC = (0.5 * (startPos.y + endPos.y));
  var zC = (0.5 * (startPos.z + endPos.z));
  var mid = new THREE.Vector3(xC, yC, zC);
  var smoothDist = map(dist, 0, 1000, 1, 1.75);
  mid.setLength( elevation * smoothDist );
  controlEnd.add(mid);
  controlStart.add(mid);
  controlEnd.setLength( elevation * smoothDist );
  controlStart.setLength( elevation * smoothDist );
  var curve = new THREE.CubicBezierCurve3(startPos, controlStart, controlEnd, endPos);
  var geo = new THREE.Geometry();
  geo.vertices = curve.getPoints(detail);
  var mat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity: (dist/1000)*0.5, blending:THREE["AdditiveBlending"]});
  var curveObj = new THREE.Line(geo, mat);
  group.add(curveObj);
}

function map( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function geoToXyz(lat, lon, radius){
  // converts latitude and longitude values to an x/y/z coordinate on sphere of size radius
  phi = Math.radians(lat);
  theta = Math.radians(0-lon);
  x = radius * Math.cos(phi) * Math.cos(theta);
  y = radius * Math.sin(phi);
  z = radius * Math.cos(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function xyzToGeo(pos, radius){
  var lat = Math.asin(pos.z / radius);
  var lon = Math.atan2(pos.y, pos.x);
  return [lat, lon];
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

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
    alpha += (mouse.y - mouseStart.y) * 0.001;
    beta -= (mouse.x - mouseStart.x) * 0.001;
    m1.makeRotationX(alpha);
    m2.makeRotationY(beta);
    //m3.makeRotationZ(gamma);
    m.multiplyMatrices(m1,m2);
    //m.multiply(m3);
  }
}

function mouseReleased(event){
  mouseIsPressed = false;
}

function mouseWheel(event){
  // TODO: update camera dollying
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
  alpha *= damping;
  beta *= damping;
  m1.makeRotationX(alpha);
  m2.makeRotationY(beta);
  m.multiplyMatrices(m1,m2);
  camera.applyMatrix(m);
	camera.updateMatrixWorld();

  // DO EVERYTHING HERE

  // render a new frame
  composer.render();
}




function Planet(parent, radius, detail, texture){
  var geo = new THREE.SphereGeometry(radius, detail, detail);
  var mat = new THREE.MeshBasicMaterial({map:texture});
  this.obj = new THREE.Mesh(geo, mat);
  parent.add(this.obj);
}
