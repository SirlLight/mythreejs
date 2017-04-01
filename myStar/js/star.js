/**
 * Created by yonghui.huang on 2017/3/31.
 */
var canvas = document.getElementById('star1');
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ canvas: canvas });

renderer.setSize(canvas.clientWidth, canvas.clientHeight);

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;
function render() {
    requestAnimationFrame(render);
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
    renderer.render(scene, camera);
}
render();