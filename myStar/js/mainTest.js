var camera,scene,renderer;
var container,controls,clock;

var mouse = new THREE.Vector2();
var raycaster,INTERSECTED;
var spheres=[];
var ringArr=[];
var DoubleSide = THREE.DoubleSide;
var ring;

//Initialize
function init() {
	//create main scene
	scene = new THREE.Scene();

	//create raycaster
	raycaster = new THREE.Raycaster();

	//prepare camera
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
	scene.add(camera);
	camera.position.z = 3200;
	camera.lookAt(scene.position);

	//prepare renderer
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: false
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	//prepare container
	container = document.createElement('div');
	document.getElementById("universe").appendChild(container);
	container.appendChild(renderer.domElement);

	//prepare OrbitControls
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target = scene.position;

	//prepare clock
	clock = new THREE.Clock();

	//perpare skyBox
	var path="img/1/";
	var format=".png";
	var urls=[
		path+'left'+format,path+'right'+format,
		path+'top'+format,path+'bottom'+format,
		path+'front'+format,path+'back'+format
	];
	var textureCube=THREE.ImageUtils.loadTextureCube(urls);
	var shader=THREE.ShaderLib["cube"];
	shader.uniforms["tCube"].value=textureCube;
	var skyMaterial = new THREE.ShaderMaterial({
	    fragmentShader:shader.fragmentShader,
	    vertexShader:shader.vertexShader,
	    uniforms:shader.uniforms,
	    depthWrite:false,
	    side:THREE.BackSide
	});
	var skyMesh=new THREE.Mesh( new THREE.BoxGeometry(10000,10000,10000), skyMaterial);
	scene.add(skyMesh);
	/*var cubeTexture = new THREE.CubeTextureLoader().setPath('img/1/').load(['1.png', '2.png', '3.png', '4.png', '5.png', '6.png']);
	cubeTexture.mapping = THREE.CubeRefractionMapping;
	scene.background = cubeTexture;*/

	//initialize binding gyroscope
	devices = new THREE.DeviceOrientationControls(camera);
	devices.connect();

	var planetRadius = 200;
	var RingsSettings = [{
		radius: planetRadius * 2.7,
		thickness: .03
	}, {
		radius: planetRadius * 2.54,
		thickness: .12
	}, {
		radius: planetRadius * 2.175,
		thickness: .22
	}];

	RingsSettings.forEach(function(ring) {
		var settings = {
			geometry: new THREE.RingGeometry(ring.radius - ring.radius * ring.thickness, ring.radius, 64),
			material: new THREE.MeshBasicMaterial({
				map:THREE.ImageUtils.loadTexture('img/1/saturn.png'),
				side: DoubleSide
			})
		};
		ring = new THREE.Mesh(settings.geometry, settings.material);
		//ring.rotation.x = 1.5;
		ring.position.y=-100;
		scene.add(ring);
		ringArr.push(ring);
	});

	//Meterial list
	var mlist = [
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/sun.jpg')
			}), //0
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/mercury.jpg')
			}), //1
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/venus.jpg')
			}), //2
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/earth.jpg')
			}), //3
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/mars.jpg')
			}), //4
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/wood.png')
			}), //5
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/saturn.png')
			}), //6
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/uranus.jpg')
			}), //7
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/neptune.jpg')
			}), //8
		new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/moon.jpg')
			}) //9
		];
	for (var i = 0; i < 10; i++) {
		switch (i) {
			case 0:
				drawStar(400,"sun", mlist[i]); //sun
				break;
			case 1:
				drawStar(60,"mercury", mlist[i]); //mercury
				break;
			case 2:
				drawStar(90,"venus", mlist[i]); //venus
				break;
			case 3:
				drawStar(100,"earth", mlist[i]); //earth
				break;
			case 4:
				drawStar(80,"mars", mlist[i]); //mars
				break;
			case 5:
				drawStar(280,"wood", mlist[i]); //wood
				break;
			case 6:
				drawStar(260,"saturn", mlist[i]); //saturn
				break;
			case 7:
				drawStar(240,"uranus", mlist[i]); //uranus
				break;
			case 8:
				drawStar(220,"neptune", mlist[i]); //neptune
				break;
			default:
				drawStar(40,"moon", mlist[i]);//moon
		}
	}

	//events
	initMouseControl();
	initDeives();
}

//Create sphere
function drawStar(r,name,material){
	var ball = new THREE.SphereBufferGeometry(r, 30, 30);
    var star = new THREE.Mesh(ball, material);
    star.position.y = -100;
    star.name=name;
    scene.add(star);
    spheres.push(star);
}
//Revolution
function revolution() {
    var timer = Date.now() * 0.000025;
    for (var i = 0; i < spheres.length; i++) {
        spheres[i].rotation.y += .03;
        spheres[i].position.x = 60 * i * (Math.cos(timer * (10 - i)) * 10);
        spheres[i].position.z = 60 * i * (Math.sin(timer * (10 - i)) * 10);
    }
    for(var j=0;j<ringArr.length;j++){
    	ringArr[j].position.x=spheres[6].position.x;
    	ringArr[j].position.z=spheres[6].position.z;
    	ringArr[j].rotation.x=1.7;
    	ringArr[j].rotation.z +=.0025;
    }
}

//Initialize binding event
function initMouseControl(){
	window.addEventListener('resize', onWindowResize, false);
	container.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

var controlBtn=document.getElementById("controlBtn");
var isDeviceing=false;
controlBtn.addEventListener("touchend",controlDevice,false);

//Initialize gyroscope
function initDeives(){
	deviceControl=new THREE.DeviceOrientationControls(camera);
}
//Handle gyroscope
function controlDevice(event){
	if(isDeviceing==true){
		isDeviceing=false;
	}
	else{
		isDeviceing=true;
	}
}

//Animate the scene
function animate(){
	requestAnimationFrame(animate);
	revolution();
	update();
	isDeviceing == false ? initMouseControl() : deviceControl.update();
	render();
}

//Update controls
function update(){
	controls.update(clock.getDelta());
}

//Render the scene
function render(){
	if(renderer){
		renderer.render(scene,camera);
	}
}

//Event star
function starScene(name){
	if(name=="mars"){
		window.location.assign("marsPage.html");
		console.log("marsPage");
	}
}

//Window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

//Event mouse down
function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
    	if (INTERSECTED != intersects[0].object) {
			INTERSECTED = intersects[0].object;
			starScene(INTERSECTED.name);
			console.log(INTERSECTED.name);
		}
	} 
	else {
		INTERSECTED = null;
	}
}

//Initialize main on page load
function initializeMain(){
	init();
	animate();
}

if(window.addEventListener)
	window.addEventListener('load',initializeMain,false);
else if(window.attachEvent)
	window.attachEvent('onload',initializeMain);
else
	window.onload=initializeMain;

$(".star").click(function(){
	$(this).addClass("hide");
	$(".universe").removeClass("hide");
});
