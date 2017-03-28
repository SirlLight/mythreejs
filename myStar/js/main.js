var camera,scene,renderer;
var container,controls,clock;

var mouse = new THREE.Vector2();
var raycaster,INTERSECTED;
var spheres=[];
var ringArr=[];
var planets=[];
var DoubleSide = THREE.DoubleSide;
var ring,Sun;
var pointLight,ambientLight;

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
	container = document.getElementById("main");/*
	document.getElementById("main").appendChild(container);*/
	container.appendChild(renderer.domElement);

	//prepare OrbitControls
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target = scene.position;

	//prepare clock
	clock = new THREE.Clock();

	//perpare skyBox
	/*var cubeTexture = new THREE.CubeTextureLoader().setPath('img/1/').load(['left.png', 'right.png', 'top.png', 'bottom.png', 'front.png', 'back.png']);
	cubeTexture.mapping = THREE.CubeRefractionMapping;
	scene.background = cubeTexture;*/
	/*skyBox*/
				var path = "img/1/";
				var format = '.png';
				var urls= [
					path + 'left' + format , path + 'right' + format,
					path + 'top' + format , path + 'bottom' + format,
					path + 'front' + format , path + 'back' + format,
				];
				//var urls=[img[0],img[1],img[2],img[3],img[4],img[5]];
				var textureCube = THREE.ImageUtils.loadTextureCube(urls);
				var shader = THREE.ShaderLib['cube'];
				shader.uniforms['tCube'].value = textureCube;
				var material = new THREE.ShaderMaterial({
					fragmentShader:shader.fragmentShader,
					vertexShader:shader.vertexShader,
					uniforms:shader.uniforms,
					depthWrite:false,
					side:THREE.BackSide
				});
				var cubeMesh = new THREE.Mesh(new THREE.CubeGeometry(1000,1000,1000),material);
				scene.add(cubeMesh);

	//perpare ambientLight
	ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( ambientLight );

	//perpare pointLight
	pointLight = new THREE.PointLight(0xffffff,1.5,20000,0.3);
    //light.position.set(offsetX,0,0);
    scene.add(pointLight); 

	//initialize binding gyroscope
	devices = new THREE.DeviceOrientationControls(camera);
	devices.connect();

	//背景星星
	var particles = 20000; //星星数量
	/*buffer做星星*/
	var bufferGeometry = new THREE.BufferGeometry();
	var positions = new Float32Array(particles * 3);
	var colors = new Float32Array(particles * 3);
	var color = new THREE.Color();
	var gap = 900; // 定义星星的最近出现位置
	for (var i = 0; i < positions.length; i += 3) {
		// positions
		/*-2gap < x < 2gap */
		var x = Math.random() * gap * 100 * (Math.random() < .5 ? -1 : 1);
		var y = Math.random() * gap * 100 * (Math.random() < .5 ? -1 : 1);
		var z = Math.random() * gap * 100 * (Math.random() < .5 ? -1 : 1);

		/*找出x,y,z中绝对值最大的一个数*/
		var biggest = Math.abs(x) > Math.abs(y) ? Math.abs(x) > Math.abs(z) ? 'x' : 'z' : Math.abs(y) > Math.abs(z) ? 'y' : 'z';
		var pos = { x: x, y: y, z: z };

		/*如果最大值比n要小（因为要在一个距离之外才出现星星）则赋值为n（-n）*/
		if (Math.abs(pos[biggest]) < gap) pos[biggest] = pos[biggest] < 0 ? -gap : gap;

		x = pos['x'];
		y = pos['y'];
		z = pos['z'];

		positions[i] = x;
		positions[i + 1] = y;
		positions[i + 2] = z;

		// colors
		/*70%星星有颜色*/
		var hasColor = Math.random() > 0.3;
		var vx = undefined,vy = undefined,vz = undefined;

		if (hasColor) {
			vx = (Math.random() + 1) / 2;
			vy = (Math.random() + 1) / 2;
			vz = (Math.random() + 1) / 2;
		} else {
			vx = 1;
			vy = 1;
			vz = 1;
		}

		/*let vx = ( Math.abs(x) / n*2 ) ;
		var vy = ( Math.abs(y) / n*2 ) ;
		var vz = ( Math.abs(z) / n*2 ) ;*/

		color.setRGB(vx, vy, vz);
		colors[i] = color.r;
		colors[i + 1] = color.g;
		colors[i + 2] = color.b;
	}
	bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
	bufferGeometry.computeBoundingSphere();

	/*星星的material*/
	var material = new THREE.PointsMaterial({ size: 6, vertexColors: THREE.VertexColors });
	particleSystem = new THREE.Points(bufferGeometry, material);
	scene.add(particleSystem); 

	//Moon
	var Moon=new THREE.Mesh( new THREE.SphereGeometry(40, 32, 32), new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/moon.jpg')
			})
	);
	Moon.name="Moon";
	Moon.castShadow=true;
	Moon.receviceShadow=true;
	scene.add(Moon);

	//Sun
	var Sun=new THREE.Mesh( new THREE.SphereGeometry(400, 32, 32), new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/sun.jpg')
			})
	);
	Sun.name="Sun";
	Sun.castShadow=true;
	Sun.receviceShadow=true;
	scene.add(Sun);

	//Sunshine
    var sunSprite = createSprits(0xFEAB10,'img/glow.png');
    sunSprite.scale.set(3200, 3200, 8);
    Sun.add(sunSprite);

	//Rings of the Saturn
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
		ring.position.y=10;
		scene.add(ring);
		ringArr.push(ring);
	});

	//Meterial list
	var mlist = [
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/mercury.jpg')
			}), //0
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/venus.jpg')
			}), //1
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/earth.jpg')
			}), //2
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/mars.jpg')
			}), //3
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/wood.png')
			}), //4
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/saturn.png')
			}), //5
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/uranus.jpg')
			}), //6
		new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('img/1/neptune.jpg')
			})//7
		];
	for (var i = 0; i < 8; i++) {
		switch (i) {
			case 0:
				createPlanet("Mercury",0.010,0,mlist[i],600,60);
				//drawStar(60,"mercury", mlist[i]); //mercury
				break;
			case 1:
				createPlanet("Venus",0.009,0,mlist[i],850,90);
				//drawStar(90,"venus", mlist[i]); //venus
				break;
			case 2:
				createPlanet("Earth",0.008,0,mlist[i],1140,100);
				//drawStar(100,"earth", mlist[i]); //earth
				break;
			case 3:
				createPlanet("Mars",0.007,0,mlist[i],1420,80);
				//drawStar(80,"mars", mlist[i]); //mars
				break;
			case 4:
				createPlanet("Jupiter",0.006,0,mlist[i],1880,280);
				//drawStar(280,"wood", mlist[i]); //wood
				break;
			case 5:
				createPlanet("Saturn",0.005,0,mlist[i],2520,260);
				//drawStar(260,"saturn", mlist[i]); //saturn
				break;
			case 6:
				createPlanet("Uranus",0.004,0,mlist[i],3120,240);
				//drawStar(240,"uranus", mlist[i]); //uranus
				break;
			case 7:
				createPlanet("Neptune",0.003,0,mlist[i],3680,220);
				//drawStar(220,"neptune", mlist[i]); //neptune
				break;
			default:
				//createPlanet("Moon",0.01,0,mlist[i],750,40);
				//drawStar(40,"moon", mlist[i]);//moon
				break;
		}
	}

	//events
	initMouseControl();
	initDeives();
}

/**
* createPlanet
* @param  {[type]} name     [description]行星名字
* @param  {[type]} speed    [description]角速度
* @param  {[type]} angle    [description]初始角度
* @param  {[type]} material [description]材质
* @param  {[type]} distance [description]距离圆心的距离
* @param  {[type]} r        [description]体积
* @param  {[type]} ringMsg  [description]碎星带
* @return {[type]} star     [description]星球对象
*/
function createPlanet(name,speed,angle,material,distance,r,ringMsg){
	var mesh=new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), material);
	mesh.position.x=distance;
	mesh.receviceShadow=true;
	mesh.castShadow=true;
	mesh.name=name;

	//轨道
	var track=new THREE.Mesh( new THREE.RingGeometry(distance - 0.2, distance + 1.5, 64, 1), new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide }));
	track.rotation.x=-Math.PI/2;
	scene.add(track);

	var star={
		name:name,
		speed:speed,
		angle:angle,
		distance:distance,
		r:r,
		Mesh:mesh
	};

	scene.add(mesh);
	planets.push(star);
	return star;
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
    	ringArr[j].position.x=planets[5].Mesh.position.x;
    	ringArr[j].position.z=planets[5].Mesh.position.z;
    	ringArr[j].rotation.x=1.7;
    	ringArr[j].rotation.z +=.0025;
    }
}
//MoveEachStar
function moveEachStar(star){
	star.angle+=star.speed;
	if(star.angle>Math.PI*star.distance){
		star.angle-=Math.PI*star.distance;
	}
	//Autoroatation
	star.Mesh.rotation.y += .03;
	//太阳自转
	//Sun.rotation.y = Sun.rotation.y == 2 * Math.PI ? 0.0008 * Math.PI : Sun.rotation.y + 0.0008 * Math.PI;
	
	star.Mesh.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
	
}
//move
function move(){
	for(var i=0;i<planets.length;i++){
		moveEachStar(planets[i]);
	}
}
//Initialize binding event
function initMouseControl(){
	window.addEventListener('resize', onWindowResize, false);
	container.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

/**
 * Light of Sun
 * @returns {THREE.ShaderSprite.sprite|{vertexShader, fragmentShader}|*|THREE.ShaderLib.sprite}
 */
function createSprits(color,img){
    return new THREE.Sprite(new THREE.SpriteMaterial(
        {
            //精灵使用的纹理
            map: new THREE.ImageUtils.loadTexture( img ),
            //若设置为true，则精灵的位置相对于窗口左上角的x和y来定位，创建中的相机就会被完全忽略
            useScreenCoordinates: false, 
            //粒子的颜色 
            color: 0xFEAB10, 
            //粒子的透明度
            transparent: true, 
            //渲染精灵时所以的融合模式
            blending: THREE.AdditiveBlending
        }));
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
	move();
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
			//starScene(INTERSECTED.name);
			alert(INTERSECTED.name);
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
