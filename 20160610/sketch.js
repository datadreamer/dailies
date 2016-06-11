var camera, scene, renderer, composer;
var width, height;
var texture, textureMat;
var group;
var font;
var horizontalClusters = [];
var connectingClusters = [];
var xRot = 0;
var yRot = -0.002;
var minSpriteSize = 8;
var maxSpriteSize = 24;
var mouseIsPressed = false;
var mouse = new THREE.Vector2();
var mouseStart = new THREE.Vector2();
var labels = [];

var loader = new THREE.FontLoader();
loader.load( 'helvetiker_bold.typeface.json', function (f) {
  font = f;
  setup();
  draw();
});

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

  // load texture for particle sprites
  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("gradient.png");
  textureMat = new THREE.SpriteMaterial({map:texture, transparent:true, blending:THREE["AdditiveBlending"]});
  textureMat.map.offset.set(-0.5,-0.5);
  textureMat.map.repeat.set(2,2);

  var radius = 200;
  var numLines = 20;
  var linesPerTwist = 10;
  var spacing = (radius*5) / linesPerTwist;
  var a = 0;
  var angle = (Math.PI*2) / linesPerTwist;

  for (var i=0; i < numLines; i++) {
    a += angle;
    // generate position on helix
    var x = Math.cos(a) * radius;
    var y = i*spacing - (numLines*(spacing/2));
    var z = Math.sin(a) * radius;

    // create opposite pairing
    var x2 = Math.cos(a+Math.PI) * radius;
    var z2 = Math.sin(a+Math.PI) * radius;

    // create NoisyLineCluster connecting positions on helix
    var noisyLineCluster = new NoisyLineCluster(group, new THREE.Vector3(x,y,z), new THREE.Vector3(x2,y,z2), 5, 10, 50);

    // create vertical clusters connecting to last horizontal cluster on helix
    if(i > 0){
      var last = horizontalClusters[horizontalClusters.length-1];
      // connect based on startGeo/endGeo
      var leftCluster = new ConnectingLineCluster(group, last.startGeo, noisyLineCluster.startGeo, 2, 30);
      var rightCluster = new ConnectingLineCluster(group, last.endGeo, noisyLineCluster.endGeo, 2, 30);
      connectingClusters.push(leftCluster, rightCluster);
    }
    horizontalClusters.push(noisyLineCluster);
  }

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
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

  // // rotate group object using vectors from mouse activity
  group.rotation.x += xRot;
  group.rotation.y += yRot;

  // render a new frame
  //renderer.clear();
  //renderer.render(scene, camera);
  composer.render();
}





function NoisyLine(parent, startPos, endPos, segments, noise, colormode){
  this.startPos = startPos;
  this.endPos = endPos;
  // measure distance along each axis and length for each segment
  var xseg = (endPos.x - startPos.x) / segments;
  var yseg = (endPos.y - startPos.y) / segments;
  var zseg = (endPos.z - startPos.z) / segments;
  this.geo = new THREE.Geometry();

  var colors = [];
  // for each segment grab position with some noise added
  for(var i=0; i<=segments; i++){
    var xpos = (i * xseg) + startPos.x + ((Math.random()*noise) - (noise/2));
    var ypos = (i * yseg) + startPos.y + ((Math.random()*noise) - (noise/2));
    var zpos = (i * zseg) + startPos.z + ((Math.random()*noise) - (noise/2));
    this.geo.vertices.push(new THREE.Vector3(xpos, ypos, zpos));
    colors[i] = new THREE.Color(0xffffff);
    if(colormode == 0){
      colors[i].setHSL(i*0.02, 1, 0.5);
    } else if(colormode == 1){
      colors[i].setHSL(0.2 - i*0.02, 1, 0.5);
    } else if(colormode == 2){
      colors[i].setHSL(0.35 + i*0.02, 1, 0.5);
    } else if(colormode == 3){
      colors[i].setHSL(0.55 - i*0.02, 1, 0.5);
    }


    // create new sprite with unique material
    var spriteMat = textureMat.clone();
    spriteMat.color.setHSL(0.15, 1, 1);
    spriteMat.opacity = Math.random()*0.5;
    var sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(xpos, ypos, zpos);
    var size = (Math.random() * (maxSpriteSize-minSpriteSize)) + minSpriteSize;
    sprite.scale.set(size, size, 1.0);
    parent.add(sprite);
  }
  this.geo.colors = colors;

  // setup material and objects for points and lines
  var pointMat = new THREE.PointsMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.8 + 0.2, blending:THREE["AdditiveBlending"]});
  var lineMat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.5 + 0.2, blending:THREE["AdditiveBlending"],  vertexColors:THREE.VertexColors});
  var points = new THREE.Points(this.geo, pointMat);
  var lines = new THREE.Line(this.geo, lineMat);

  parent.add(points);
  parent.add(lines);
}





function NoisyLineCluster(parent, startPos, endPos, count, segments, noise){
  this.startPos = startPos;
  this.endPos = endPos;
  this.startGeo = new THREE.Geometry();
  this.endGeo = new THREE.Geometry();

  // scramble color mode to get genetic pairing for this line cluster
  var colorscramble = Math.random();
  var colormode = 0;  // red to yellow
  var letter1 = "A";   // adenine
  var letter2 = "T";
  if(colorscramble >= 0.25 && colorscramble < 0.5){
    colormode = 1;    // yellow to red
    letter1 = "T";     // thymine
    letter2 = "A";
  } else if(colorscramble >= 0.5 && colorscramble < 0.75){
    colormode = 2;    // blue to green
    letter1 = "G";     // guanine
    letter2 = "C";
  } else if(colorscramble > 0.75){
    colormode = 3;    // green to blue
    letter1 = "C";     // cytosine
    letter2 = "G";
  }

  // create letters to identify chemical pairing
  var textMat = new THREE.MeshBasicMaterial({color: 0xffffff});
  var textGeo1 = new THREE.TextGeometry(letter1, {font: font, size: 14, height: 2, curveSegments: 2});
  var textMesh1 = new THREE.Mesh(textGeo1, textMat);
  textMesh1.position.x = startPos.x;
  textMesh1.position.y = startPos.y;
  textMesh1.position.z = startPos.z;
  parent.add(textMesh1);
  var textGeo2 = new THREE.TextGeometry(letter2, {font: font, size: 14, height: 2, curveSegments: 2});
  var textMesh2 = new THREE.Mesh(textGeo2, textMat);
  textMesh2.position.x = endPos.x;
  textMesh2.position.y = endPos.y;
  textMesh2.position.z = endPos.z;
  parent.add(textMesh2);
  labels.push(textMesh1, textMesh2);

  // create multiple NoisyLine objects with unique positions
  var lines = new Array(count);
  for(var i=0; i<count; i++){
    lines[i] = new NoisyLine(parent, startPos, endPos, segments, noise, colormode);
  }

  // connect all noisylines by segment vertices
  for(var i=0; i<=segments; i++){
    var geo = new THREE.Geometry();
    // add point from each noisyline
    for(var n=0; n<lines.length; n++){
      geo.vertices.push(lines[n].geo.vertices[i]);
    }
    if(segments > 2){
      geo.vertices.push(lines[0].geo.vertices[i]);
    }
    // store start and end vertex clusters
    if(i == 0){
      this.startGeo = geo.clone();
    } else if(i == segments){
      this.endGeo = geo.clone();
    }

    // create line material and object and add to parent
    var lineMat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.15 + 0.05, blending:THREE["AdditiveBlending"]});
    if(colormode == 0){
      lineMat.color.setHSL(i*0.02, 1, 0.5);
    } else if(colormode == 1){
      lineMat.color.setHSL(0.2 - i*0.02, 1, 0.5);
    } else if(colormode == 2){
      lineMat.color.setHSL(0.35 + i*0.02, 1, 0.5);
    } else if(colormode == 3){
      lineMat.color.setHSL(0.55 - i*0.02, 1, 0.5);
    }
    var line = new THREE.Line(geo, lineMat);
    parent.add(line);
  }
}




function ConnectingLineCluster(parent, startGeo, endGeo, segments, noise){
  this.startGeo = startGeo;
  this.endGeo = endGeo;

  // create multiple VerticalLine objects with unique positions
  var lines = new Array(startGeo.vertices.length);
  for(var i=0; i<startGeo.vertices.length; i++){
    lines[i] = new ConnectingLine(parent, startGeo.vertices[i], endGeo.vertices[i], segments, noise);
  }

  // connect all VerticalLines by segment vertices
  for(var i=1; i<segments; i++){
    var geo = new THREE.Geometry();
    // add point from each noisyline
    for(var n=0; n<lines.length; n++){
      geo.vertices.push(lines[n].geo.vertices[i]);
    }
    if(segments > 2){
      geo.vertices.push(lines[0].geo.vertices[i]);
    }

    // create line material and object and add to parent
    var lineMat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.15 + 0.05, blending:THREE["AdditiveBlending"]});
    var line = new THREE.Line(geo, lineMat);
    parent.add(line);
  }
}




function ConnectingLine(parent, startPos, endPos, segments, noise){
  this.startPos = startPos;
  this.endPos = endPos;
  // measure distance along each axis and length for each segment
  var xseg = (endPos.x - startPos.x) / segments;
  var yseg = (endPos.y - startPos.y) / segments;
  var zseg = (endPos.z - startPos.z) / segments;
  this.geo = new THREE.Geometry();

  this.geo.vertices.push(startPos); // first position
  // for each segment grab position with some noise added
  for(var i=1; i<segments; i++){
    var xpos = (i * xseg) + startPos.x + ((Math.random()*noise) - (noise/2));
    var ypos = (i * yseg) + startPos.y + ((Math.random()*noise) - (noise/2));
    var zpos = (i * zseg) + startPos.z + ((Math.random()*noise) - (noise/2));
    this.geo.vertices.push(new THREE.Vector3(xpos, ypos, zpos));
  }
  this.geo.vertices.push(endPos); // last position

  // setup material and objects for points and lines
  var pointMat = new THREE.PointsMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.8 + 0.2, blending:THREE["AdditiveBlending"]});
  var lineMat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:Math.random()*0.2 + 0.05, blending:THREE["AdditiveBlending"]});
  var points = new THREE.Points(this.geo, pointMat);
  var lines = new THREE.Line(this.geo, lineMat);
  parent.add(points);
  parent.add(lines);
}
