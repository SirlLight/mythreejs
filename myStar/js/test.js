window.flag;
var scene = undefined,
    renderer = undefined;

window.camera = undefined;
var particleSystem = undefined,
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
var planetName;
window.stars = [];
var ringArr=[],nameArr=[];
var controls;
var Devices,isDeviceing=0;
var controlBtn=document.getElementById("controlBtn");

var starNames = {}; //指向显示的星星名字对象
var displayName = undefined; //当前显示名字

var clock = new THREE.Clock(); //第一人称控制需要

var canvas = document.getElementById('main');

var raycaster=new THREE.Raycaster(); //指向镭射
var mouse = new THREE.Vector2(); //鼠标屏幕向量

var id=null;
var tempIndex;

var tempStars=[];

//init();
//animate();

function init() {
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
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(200, 50, 0);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    /*orbitControls*/
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance=0;
    controls.maxDistance=800;
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
    Sun.name = '太阳';
    Sun.volume = 12;
    Sun.castShadow = true;
    Sun.receiveShadow = true;
    creatName(Sun);
    Sun.planetName=planetName;
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
    sunSprite.name = '太阳光';

    /*Moon*/
    Moon=new THREE.Mesh(
        new THREE.SphereGeometry(2,32,32),
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture('img/1/moon.jpg')
        })
    );
    Moon.name="月球";
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
                Mercury=initPlanet("水星",0.02,0,mlist[i],20,2);//mercury
                break;
            case 1:
                Venus=initPlanet("金星",0.012,0,mlist[i],35,4);//venus
                break;
            case 2:
                Earth=initPlanet("地球",0.010,0,mlist[i],58,5);//earth
                break;
            case 3:
                Mars=initPlanet("火星",0.008,0,mlist[i],74,4);//mars
                break;
            case 4:
                Jupiter=initPlanet("木星",0.006,0,mlist[i],97,9);//wood
                break;
            case 5:
                Saturn=initPlanet("土星",0.005,0,mlist[i],125,7,true);//saturn
                break;
            case 6:
                Uranus=initPlanet("天王星",0.003,0,mlist[i],150,4);//uranus
                break;
            case 7:
                Neptune=initPlanet("海王星",0.002,0,mlist[i],168,3);//neptune
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
    var particles = 4000; //the numeber of stars

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
    initDeives();
    Devices.connect();
    controlBtn.addEventListener("touchend",this.controlDevice,false);
    this.toggle();

    window.addEventListener('resize', this.onWindowResize, false);
    canvas.addEventListener('mousedown', this.onDocumentMouseDown, false);
    canvas.addEventListener('doubleclick', this.onCanvasDoubleclick , false);

    id=requestAnimationFrame(move);
}

function onCanvasDoubleclick() {
    console.log(camera);
}

function toggle(){
    isDeviceing === 0 ? controls.update() : Devices.update();
    /*requestAnimationFrame(function () {
     return toggle();
     });*/
}

function onDocumentMouseDown(event){
    /* event.preventDefault();*/
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    /*交汇点对象*/
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        /*取第一个交汇对象（最接近相机）*/
        var obj = intersects[0].object;
        var name = obj.name;
        if(name){
            if (id !== null) {
                cancelAnimationFrame(id);
                id = null;
            }
            window.flag=name;
            document.querySelector(".header").style.display="block";
            document.querySelector(".sidebar").style.display="flex";
            document.querySelector(".content").style.display="block";
            document.getElementById("tempFlag").value=name;
            document.querySelector(".controlBtn").style.display="none";
            console.log("after click");
            switch (name) {
                case "水星":
                    tempIndex=0;
                    break;
                case "金星":
                    tempIndex=1;
                    break;
                case "地球":
                    tempIndex=2;
                    break;
                case "火星":
                    tempIndex=3;
                    break;
                case "木星":
                    tempIndex=4;
                    break;
                case "土星":
                    tempIndex=5;
                    break;
                case "天王星":
                    tempIndex=6;
                    break;
                case "海王星":
                    tempIndex=7;
                    break;
                default:
                    break;
            };
            tempStars=stars[tempIndex];
            stars.splice(tempIndex,1);
            //r^3
            var rCube=(stars[tempIndex].volume * 3)/(4 * Math.PI );
            //r
            var r=Math.pow(rCube, 3);
            //星球鱼相机之间的距离
            var axisZ=(5*r)/3;
            //相机视角与星球切线的长度
            var m=(4*r)/3;
            //x和z轴上的差值
            var n=(4*m)/5;
            //相机的x
            //var o=stars[tempIndex].Mesh.position.x+n;
            var o=stars[tempIndex].Mesh.position.x-10*r;
            //相机的z
            var p;
            //p=stars[tempIndex].Mesh.position.z+n;
            p=stars[tempIndex].Mesh.position.z-10*r;
            /*if(stars[tempIndex].Mesh.position.z>0){
                p=stars[tempIndex].Mesh.position.z-n;
            }
            else{
                p=stars[tempIndex].Mesh.position.z+n;
            }*/
            camera.position.set(o+n,r+n,p+n);
            camera.lookAt(new THREE.Vector3(stars[tempIndex].Mesh.position.x,stars[tempIndex].Mesh.position.y,stars[tempIndex].Mesh.position.z));
            console.log("camera.position:");
            console.log(camera.position);
            console.log("star.position:");
            console.log(stars[tempIndex].Mesh.position);
            renderer.render(scene, camera);
            id=requestAnimationFrame(move);
            intersects=undefined;
        }
    }
}

function update(){
    controls.update(clock.getDelta());
}

function initDeives(){
    Devices=new THREE.DeviceOrientationControls(camera);
}

function controlDevice(event){
    if(isDeviceing===0){
        isDeviceing=1;
    }
    else{
        isDeviceing=0;
    }
}

function initPlanet(name, speed, angle, material, distance, volume, ringMsg) {
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

    creatName(star);
    star.planetName=planetName;
    scene.add(mesh);
    return star;
}

function createSprits(color,img){
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
}

function creatName(star) {
    var options = {
        size: 4, //字号大小，一般为大写字母的高度
        height: 10, //文字的厚度
        weight: 'normal', //值为'normal'或'bold'，表示是否加粗
        font: 'FZLanTingHeiS-UL-GB', //字体，默认是'helvetiker'，需对应引用的字体文件
        style: 'normal', //值为'normal'或'italics'，表示是否斜体
        bevelThickness: 1, //倒角厚度
        bevelSize: 1, //倒角宽度
        curveSegments: 30,//弧线分段数，使得文字的曲线更加光滑
        bevelEnabled: false, //布尔值，是否使用倒角，意为在边缘处斜切
    };
    planetName = new THREE.Mesh(
        new THREE.TextGeometry(star.name, options),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    planetName.volume = star.volume;
    planetName.visible = true;
    scene.add(planetName);
}

function move() {
    /*行星公转*/
    for (var i = 0; i < stars.length; i++) {
        moveEachStar(stars[i]);
    }

    Moon.angle += Moon.speed;
    if (Moon.angle > Math.PI * Moon.distance) {
        Moon.angle -= Math.PI * Moon.distance;
    }

    /*太阳自转*/
    Sun.rotation.y = Sun.rotation.y == 2 * Math.PI ? 0.0008 * Math.PI : Sun.rotation.y + 0.0008 * Math.PI;
    Sun.planetName.geometry.center();
    Sun.planetName.position.y=Sun.volume+4;
    Sun.planetName.lookAt(camera.position);
    /*月球自转*/
    Moon.rotation.y += .03;

    renderer.render(scene, camera);

    id=requestAnimationFrame(move);
}

function moveEachStar(star) {
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
    if(star.planetName){
        star.planetName.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
        star.planetName.geometry.center();
        star.planetName.position.y=star.volume+4;
        star.planetName.lookAt(camera.position);
    }
    /*moon and moonOrbit*/
    if(star.name=="Earth"){
        Moon.position.set((star.distance * Math.sin(star.angle))+( Moon._distance* Math.sin(Moon.angle)), 0, (star.distance * Math.cos(star.angle))+( Moon._distance* Math.cos(Moon.angle)));
        moonOrbit.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
    }
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setCameraPos(index) {
    console.log("setCameraPos");
    camera.position.set(stars[index].Mesh.position.x,stars[index].Mesh.position.y,stars[index].Mesh.position.z);
    console.log(camera.position);
    camera.lookAt(new THREE.Vector3(stars[index].Mesh.position.x,stars[index].Mesh.position.y,stars[index].Mesh.position.z))
}