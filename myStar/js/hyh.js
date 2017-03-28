(function(modules) { // webpackBootstrap
	// The module cache
	var installedModules = {};

	// The require function
	function __webpack_require__(moduleId) {
		// Check if module is in cache
		if(installedModules[moduleId])
			return installedModules[moduleId].exports;

		// Create a new module (and put it into the cache)
		var module = installedModules[moduleId] = {
			exports: {},
			id: moduleId,
			loaded: false
		};

		// Execute the module function
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		// Flag the module as loaded
		module.loaded = true;

		// Return the exports of the module
		return module.exports;
	}

	// expose the modules object (__webpack_modules__)
	__webpack_require__.m = modules;

	// expose the module cache
	__webpack_require__.c = installedModules;

	// __webpack_public_path__
	__webpack_require__.p = "";

	// Load entry module and return exports
	return __webpack_require__(0);
})
/************************************************************************/
([
	/* 0 */
	function(module, exports, __webpack_require__) {
		'use strict';
		var solar = __webpack_require__(1);
		solar.init();
	},
	/* 1 */
	function(module, exports) {
		'use strict';

		/*场景，渲染器，镜头，背景星星，帧率器，第一人称控制*/
		var scene = undefined,
			renderer = undefined,
			camera = undefined,
			particleSystem = undefined,
			control = undefined;

		var Sun = undefined,//太阳
			Mercury = undefined,//水星
			Venus = undefined,//金星
			Earth = undefined,//地球
			Mars = undefined,//火星
			Jupiter = undefined,//木星
			Saturn = undefined,//土星
			Uranus = undefined,//天王星
			Neptune = undefined,//海王星
			Moon=undefined;//月球
		var moonOrbit;//月球轨道
		var sunSprite,sunMaterial;//太阳光
		var stars = [],ringArr=[],nameArr=[];
		var controls;
		var Devices,isDeviceing=0;
		var controlBtn=document.getElementById("controlBtn");

		var cameraFar = 100000; //镜头视距

		var starNames = {}; //指向显示的星星名字对象
		var displayName = undefined; //当前显示名字

		var clock = new THREE.Clock(); //第一人称控制需要

		var canvas = document.getElementById('main');

		var raycaster = new THREE.Raycaster(); //指向镭射
		var mouse = new THREE.Vector2(); //鼠标屏幕向量

		module.exports = {
			/*初始化*/
			init: function init() {
				var _this = this;

				/*canvasSize*/
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;

				/*renderer*/
				renderer = new THREE.WebGLRenderer({ canvas: canvas });
				renderer.shadowMap.enabled = true; //辅助线
				renderer.shadowMapSoft = true; //柔和阴影
				renderer.setClearColor(0xffffff, 0);

				/*scene*/
				scene = new THREE.Scene();

				/*camera*/
				camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, cameraFar);
				camera.position.set(-200, 50, 0);
				camera.lookAt(new THREE.Vector3(0, 0, 0));
				scene.add(camera);

				/*orbitControls*/
				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.target = scene.position;

				/*skyBox*/
				var path = "img/1/";
				var format = '.png';
				var urls= [
					path + 'left' + format , path + 'right' + format,
					path + 'top' + format , path + 'bottom' + format,
					path + 'front' + format , path + 'back' + format,
				];
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

				/*sun skin pic*/
				var sunSkinPic = THREE.ImageUtils.loadTexture('img/1/sun.jpg', {}, function () {
					renderer.render(scene, camera);
				});

				/*sun*/
				Sun = new THREE.Mesh(
					new THREE.SphereGeometry(12, 32, 32), 
					new THREE.MeshLambertMaterial({
						emissive: 0xdd4422,
						map: THREE.ImageUtils.loadTexture('img/1/sun.jpg')
				}));
				Sun.name = 'Sun';
				Sun.castShadow = true;
				Sun.receiveShadow = true;
				scene.add(Sun);

				/*Sunshine*/
				sunMaterial=new THREE.SpriteMaterial({
					//精灵使用的纹理
					map: new THREE.ImageUtils.loadTexture( 'img/glow.png' ),
					//若设置为true，则精灵的位置相对于窗口左上角的x和y来定位，创建中的相机就会被完全忽略
					useScreenCoordinates: true, 
					//粒子的颜色 
					color: 0xFEAB10, 
					//粒子的透明度
					transparent: true, 
					//渲染精灵时所以的融合模式
					blending: THREE.AdditiveBlending
				});
				//sunSprite = this.createSprits(0xFEAB10,'img/glow.png');
				sunSprite = new THREE.Sprite(sunMaterial);
				sunSprite.scale.set(96, 96, 8);
				Sun.add(sunSprite);
				sunSprite.name = 'Sun';

				/*Moon*/
				Moon=new THREE.Mesh( 
					new THREE.SphereGeometry(2,32,32),
					new THREE.MeshPhongMaterial({
						map: THREE.ImageUtils.loadTexture('img/1/moon.jpg')
						})
					);
				Moon.name="Moon";
				Moon.distance=40-8.2;//月球距离太阳距离
				Moon._distance=8.2;//地月距离
				Moon.angle=0;
				Moon.speed=0.082;
				scene.add(Moon);

				/*MoonOrbit*/
				moonOrbit=new THREE.Mesh(
						new THREE.RingGeometry(8, 8.2, 32, 6), 
						new THREE.MeshBasicMaterial({
							color: 0x888888, 
							side: THREE.DoubleSide 
						}));
				moonOrbit.rotation.x=80;
				scene.add(moonOrbit);

				/*MeterialList*/
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
						//initPlanet(name, speed, angle, material, distance, volume, ringMsg)
						case 0:
							Mercury=this.initPlanet("Mercury",0.02,0,mlist[i],20,2);//mercury
							break;
						case 1:
							Venus=this.initPlanet("Venus",0.012,0,mlist[i],35,4);//venus
							break;
						case 2:
							Earth=this.initPlanet("Earth",0.010,0,mlist[i],58,5);//earth
							break;
						case 3:
							Mars=this.initPlanet("Mars",0.008,0,mlist[i],74,4);//mars
							break;
						case 4:
							Jupiter=this.initPlanet("Jupiter",0.006,0,mlist[i],97,9);//wood
							break;
						case 5:
							Saturn=this.initPlanet("Saturn",0.005,0,mlist[i],125,7,true);//saturn
							break;
						case 6:
							Uranus=this.initPlanet("Uranus",0.003,0,mlist[i],150,4);//uranus
							break;
						case 7:
							Neptune=this.initPlanet("Neptune",0.002,0,mlist[i],168,3);//neptune
							break;
						default:
							break;
						}
				}
				stars.push(Mercury);
				stars.push(Venus);
				stars.push(Earth);
				stars.push(Mars);
				stars.push(Jupiter);
				stars.push(Saturn);
				stars.push(Uranus);
				stars.push(Neptune);

				/*ambientLight*/
				var ambient = new THREE.AmbientLight(0x999999);
				scene.add(ambient);

				/*pointLight*/
				var sunLight = new THREE.PointLight(0xddddaa, 1.5, 500);
				scene.add(sunLight);

				/*starsBackground*/
				var particles = 20000; //the numeber of stars

				/*bufferStars*/
				var bufferGeometry = new THREE.BufferGeometry();
				var positions = new Float32Array(particles * 3);
				var colors = new Float32Array(particles * 3);
				var color = new THREE.Color();
				var gap = 1000; //the nearest star
				for (var i = 0; i < positions.length; i += 3) {
					// positions
					
					/*-2gap < x < 2gap */
					var x = Math.random() * gap * 2 * (Math.random() < .5 ? -1 : 1);
					var y = Math.random() * gap * 2 * (Math.random() < .5 ? -1 : 1);
					var z = Math.random() * gap * 2 * (Math.random() < .5 ? -1 : 1);

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
					var vx = undefined,
						vy = undefined,
						vz = undefined;
					if (hasColor) {
						vx = (Math.random() + 1) / 2;
						vy = (Math.random() + 1) / 2;
						vz = (Math.random() + 1) / 2;
					} else {
						vx = 1;
						vy = 1;
						vz = 1;
					}
					color.setRGB(vx, vy, vz);
					colors[i] = color.r;
					colors[i + 1] = color.g;
					colors[i + 2] = color.b;
				}
				bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
				bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
				bufferGeometry.computeBoundingSphere();

				/*starsMaterial*/
				var material = new THREE.PointsMaterial({ size: 6, vertexColors: THREE.VertexColors });
				particleSystem = new THREE.Points(bufferGeometry, material);
				scene.add(particleSystem);

				/*gyroscope*/
				this.initDeives();
				Devices.connect();
				controlBtn.addEventListener("touchend",this.controlDevice,false);
				this.animate();

				window.addEventListener('resize', this.onWindowResize, false);
				window.addEventListener('mousedown', this.onDocumentMouseDown, false);

				/*displayPlanetName*/
				this.displayPlanetName();

				renderer.render(scene, camera);
				requestAnimationFrame(function () {
					return _this.move();
				});
			},

			/*切换陀螺仪*/
			animate:function animate(){
				var _this3=this;
				isDeviceing === 0 ? controls.update() : Devices.update();
				requestAnimationFrame(function () {
					return _this3.animate();
				});
			},

			/*mouseXYZ*/
			onDocumentMouseDown:function onDocumentMouseDown(event){
				event.preventDefault();
				mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			},

			/*update controls*/
			update:function update(){
				controls.update(clock.getDelta());
			},

			/*初始化*/
			initDeives:function initDeives(){
				Devices=new THREE.DeviceOrientationControls(camera);
			},

			/*陀螺仪状态*/
			controlDevice:function controlDevice(event){
				if(isDeviceing===0){
					isDeviceing=1;
				}
				else{
					isDeviceing=0;
				}
			},

			/**
			* 制作星球、轨道及其附属碎星带
			* @param  {[type]} speed    [description]
			* @param  {[type]} angle    [description]
			* @param  {[type]} material [description]
			* @param  {[type]} distance [description]
			* @param  {[type]} volume   [description]
			* @param  {[type]} ringMsg  [description]
			* @return {[type]}          [description]
			*/
			initPlanet: function initPlanet(name, speed, angle, material, distance, volume, ringMsg) {
				var mesh = new THREE.Mesh(new THREE.SphereGeometry(volume, 16, 16), material);
				mesh.position.x = distance;
				mesh.receiveShadow = true;
				mesh.castShadow = true;
				mesh.name = name;

				/*轨道*/
				var track = new THREE.Mesh(
					new THREE.RingGeometry(distance - 0.2, distance + 0.2, 64, 1), 
					new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide })
					);
				track.rotation.x = -Math.PI / 2;
				scene.add(track);

				var star = {
					name: name,
					speed: speed,
					angle: angle,
					distance: distance,
					volume: volume,
					Mesh: mesh
				};

				/*如果有碎星带*/
				if (ringMsg) {
					var RingsSettings=[{
						innerRedius:8.8,
						outerRadius:12.5
					},{
						innerRedius:13,
						outerRadius:15
					},{
						innerRedius:15.2,
						outerRadius:16.2
					}];
					RingsSettings.forEach(function(ring){
						var settings={
							geometry:new THREE.RingGeometry(ring.innerRedius, ring.outerRadius, 64),
							material:new THREE.MeshPhongMaterial({
								map:THREE.ImageUtils.loadTexture('img/1/saturn.png'),
								side: THREE.DoubleSide
							})
						};
						ring=new THREE.Mesh(settings.geometry,settings.material);
						ring.rotation.x = 80;
						scene.add(ring);
						ringArr.push(ring);
					});
					star.ring=ringArr;
				}

				scene.add(mesh);
				return star;
			},

			/*构造星球名*/
			displayPlanetName: function displayPlanetName() {
				for (var i = 0; i < stars.length; i++) {
					nameConstructor(stars[i].name, stars[i].volume);
				}
				nameConstructor('Sun', 12);

				/*根据行星名字和体积构造铭牌*/
				function nameConstructor(name,volume) {
					var planetName = new THREE.Mesh(
						new THREE.TextGeometry(name, {size: 4,height: 4}),
						new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
						);
					planetName.volume = volume;
					planetName.visible = false;
					starNames[name] = planetName;
					//nameArr.push=planetName;
					scene.add(planetName);
				}
			},

			/**
			* 制作太阳光
			* @param  {[type]} color    [description]
			* @param  {[type]} img      [description]
			*/
			createSprits:function createSprits(color,img){
				return new THREE.Sprite(new THREE.SpriteMaterial({
					//精灵使用的纹理
					map: new THREE.ImageUtils.loadTexture( img ),
					//若设置为true，则精灵的位置相对于窗口左上角的x和y来定位，创建中的相机就会被完全忽略
					useScreenCoordinates: false,
					//粒子的颜色
					color: color,
					//粒子的透明度
					transparent: true,
					//渲染精灵时所以的融合模式
					blending: THREE.AdditiveBlending
				}));
			},

			/*行星运动以及点击交汇事件*/
			move: function move() {
				var _this2 = this;

				/*行星公转*/
				for (var i = 0; i < stars.length; i++) {
					this.moveEachStar(stars[i]);
				}

				Moon.angle += Moon.speed;
				if (Moon.angle > Math.PI * Moon.distance) {
					Moon.angle -= Math.PI * Moon.distance;
				}

				/*太阳自转*/
				Sun.rotation.y = Sun.rotation.y == 2 * Math.PI ? 0.0008 * Math.PI : Sun.rotation.y + 0.0008 * Math.PI;
				Moon.rotation.y += .03;

				/*鼠标视角控制*/
				//control.update(clock.getDelta());
				
				/*限制相机在xyz正负400以内*/
				camera.position.x = THREE.Math.clamp(camera.position.x, -400, 400);
				camera.position.y = THREE.Math.clamp(camera.position.y, -400, 400);
				camera.position.z = THREE.Math.clamp(camera.position.z, -400, 400);

				/*鼠标指向行星显示名字*/
				raycaster.setFromCamera(mouse, camera);
				/*交汇点对象*/
				var intersects = raycaster.intersectObjects(scene.children);
				if (intersects.length > 0) {
					/*取第一个交汇对象（最接近相机）*/
					var obj = intersects[0].object;

					var name = obj.name;
					/*把上一个显示隐藏*/
					displayName && (displayName.visible = false);
					/*如果是有设定名字的东西*/
					if (starNames[name]) {
						console.log(obj);
						starNames[name].visible = true;
						displayName = starNames[name];
						/*复制行星位置*/
						displayName.position.copy(obj.position);
						/*文字居中*/
						displayName.geometry.center();
						/*显示在行星的上方（y轴）*/
						displayName.position.y = starNames[name].volume + 4;
						/*面向相机*/
						displayName.lookAt(camera.position);
					}
				} else {
					displayName && displayName.visible && (displayName.visible = false);
				}
				renderer.render(scene, camera);

				requestAnimationFrame(function () {
					return _this2.move();
				});
			},

			/*每个星球位置变动*/
			moveEachStar: function moveEachStar(star) {
				star.angle += star.speed;
				if (star.angle > Math.PI * star.distance) {
					star.angle -= Math.PI * star.distance;
				}

				//自转
				star.Mesh.rotation.y += .03;
				sunMaterial.rotation += .1;

				star.Mesh.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));

				/*ring*/
				if(star.ring){
					for(var i=0;i<star.ring.length;i++){
						star.ring[i].position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
					}
				}
				/*moon and moonOrbit*/
				if(star.name=="Earth"){
					Moon.position.set((star.distance * Math.sin(star.angle))+( Moon._distance* Math.sin(Moon.angle)), 0, (star.distance * Math.cos(star.angle))+( Moon._distance* Math.cos(Moon.angle)));
					moonOrbit.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
				}
			},

			/*onWindowResize*/
			onWindowResize:function onWindowResize(){
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			}
		};
	}
]);