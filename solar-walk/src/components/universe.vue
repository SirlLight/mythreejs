<template>
  <div class="pageview">
    <div ref="controlBtn" id="controlBtn" class="controlBtn">
      <img src="../assets/img/controlIconae.png" alt="">
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
  import '../utils/three.js'
  import '../utils/DeviceOrientationControls.js'
  import '../utils/FirstPersonControls.js'
  import '../utils/OrbitControls.js'
  import '../utils/helvetiker_regular.typeface.js'

  export default {
    name: 'universe',
    data(){
      return{
        scene:null,
        renderer:null,
        camera:null,
        particleSystem:null,
        control:null,
        Sun:null,
        Mercury:null,
        Venus:null,
        Earth:null,
        Mars:null,
        Jupiter:null,
        Saturn:null,
        Uranus:null,
        Neptune:null,
        Moon:null,
        moonOrbit:null,
        sunSprite:null,
        sunMaterial:null,
        stars:[],
        ringArr:[],
        controls:null,
        Devices:0,
        isDeviceing:0,
        starNames:{},
        displayName:null,
        clock:null,
        raycaster:null,
        mouse:null
      }
    },
    methods:{
      //初始化
      init(){
        let canvas=document.getElementsByTagName("canvas");
        console.log(canvas);
        /*canvas*/
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;
        /*renderer*/
        this.renderer=new THREE.WebGLRenderer({canvas:canvas});
        this.renderer.setClearColor(0xffffff);
        /*scene*/
        this.scene=new THREE.Scene();
        /*camera*/
        this.camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,100000);
        this.camera.position.set(-200,50,0);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.scene.add(this.camera);
      },
    },
    created(){
      this.init();
      console.log("canvas组件："+new Date());
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "../utils/reset";
  .controlBtn{
    width: 30px;
    height: 30px;
    img{
      width: 100%;
      height:100%;
    }
  }
</style>
