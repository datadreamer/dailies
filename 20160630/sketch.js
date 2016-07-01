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
var m1 = new THREE.Matrix4(); // alpha (X)
var m2 = new THREE.Matrix4(); // beta (Y)
var m3 = new THREE.Matrix4(); // gamma (Z)
m.multiplyMatrices(m1,m2);
var alpha = 0;
var beta = 0;
var gamma = 0;
var damping = 0.97;

// data storage for curve animation
var data = [];
var currentCurve;
var currentCityName;
var currentCityNum = 0;
var currentCityPop;
var currentCityPos;

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
  for(var i=0; i<lines.length; i++){
    var line = lines[i].split(",");
    if(line[3] > max){
      max = line[3];
    }
    var pos = geoToXyz(line[1], line[2], planetRadius);
    var normpop = line[3] / max;
    var c = new THREE.Color();
    c.setHSL(normpop * 0.2, 1, 0.5);
    pointgeo.vertices.push(pos);
    pointgeo.colors.push(c);
    // store city info in data array
    data.push([line[0], line[1], line[2], line[3], pos]);
  }
  var points = new THREE.Points(pointgeo, pointmat);
  group.add(points);

  // start animating curves between cities
  var row = data[currentCityNum];
  currentCityName = row[0];
  currentCityPop = row[3];
  currentCityPos = row[4];
  var nextCityPos = data[currentCityNum+1][4]
  currentCurve = new AnimatedCurve(group, currentCityPos, nextCityPos);
  console.log(currentCityNum, currentCityName, currentCityPop);
}

function map(val,  oldMin,  oldMax,  newMin,  newMax){
  return (val - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
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

  if(currentCurve != undefined){
    if(!currentCurve.done){
      currentCurve.update();
    } else {
      if(currentCityNum < data.length-2){
        currentCityNum++;
        var row = data[currentCityNum];
        currentCityName = row[0];
        currentCityPop = row[3];
        currentCityPos = row[4];
        var nextCityPos = data[currentCityNum+1][4]
        currentCurve = new AnimatedCurve(group, currentCityPos, nextCityPos);
        console.log(currentCityNum, currentCityName, currentCityPop);
      }
    }
  }

  // render a new frame
  composer.render();
}




function Planet(parent, radius, detail, texture){
  var geo = new THREE.SphereGeometry(radius, detail, detail);
  var mat = new THREE.MeshBasicMaterial({map:texture, transparent:true, opacity:0.8});
  this.obj = new THREE.Mesh(geo, mat);
  parent.add(this.obj);
}




function AnimatedCurve(parent, startPos, endPos){
  // distance between points
  var dist = startPos.distanceTo(endPos);

  // control points initialized
  var controlStart = startPos.clone();
  var controlEnd = endPos.clone();

  // create midpoint
  var xC = (0.5 * (startPos.x + endPos.x));
  var yC = (0.5 * (startPos.y + endPos.y));
  var zC = (0.5 * (startPos.z + endPos.z));
  var mid = new THREE.Vector3(xC, yC, zC);

  // extend midpoint from center of planet
  var smoothDist = map(dist, 0, 1000, 1, 1.75);
  mid.setLength(planetRadius * smoothDist);

  // add midpoint to control points
  controlEnd.add(mid);
  controlStart.add(mid);
  controlEnd.setLength(planetRadius * smoothDist);
  controlStart.setLength(planetRadius * smoothDist);

  // create curve and get points along the line
  var curve = new THREE.CubicBezierCurve3(startPos, controlStart, controlEnd, endPos);
  this.detail = 60;
  this.points = curve.getPoints(this.detail);

  // create initial geometry (points added and removed until done)
  var geo = new THREE.Geometry();
  geo.vertices = this.points;
  //geo.vertices.push(this.points.shift(), this.points.shift());
  var mat = new THREE.LineBasicMaterial({color:0xffffff});
  this.obj = new THREE.Line(geo, mat);
  parent.add(this.obj);
  this.done = false;
  this.growing = true;
  this.shrinking = false;

  this.update = function(){
    if(this.growing){
      if(this.obj.geometry.vertices.length < this.detail){
        this.obj.geometry.vertices.push(this.points.shift());
      } else {
        this.growing = false;
        this.shrinking = true;
      }
    } else if(this.shrinking){
      if(this.obj.geometry.vertices.length > 2){
        this.obj.geometry.vertices.shift();
      } else {
        parent.remove(this.obj);
        this.shrinking = false;
        this.done = true;
      }
    }
    // always update vertices
    this.obj.geometry.verticesNeedUpdate = true;
  };
}
