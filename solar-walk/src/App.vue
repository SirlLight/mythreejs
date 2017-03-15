<template>
  <div id="app">
    <div id="viewport"
         class="viewport"
         @touchstart="onTouchStart"
         @touchmove="onTouchMove"
         @touchend="onTouchEnd"
    >
      <first></first>
      <second></second>
      <third></third>
    </div>
  </div>
</template>

<script>
import first from './components/first'
import second from './components/second'
import third from './components/third'

export default {
  name: 'app',
  components: {first,second,third},
  data(){
    return{

    }
  },
  methods:{
    onTouchStart(){
      console.log("start");
    },
    onTouchMove(){
      console.log("move");
    },
    onTouchEnd(){
      console.log("end");
    }
  }
}
</script>

<style lang="less" rel="stylesheet/less">
  @import "utils/reset";
  html, body {
    height: 100%;
    position: relative;
  }
  #app {
    height: 100%;
    display: flex;
    .viewport{
      width: 100%;
      height:300%;
      display: -webkit-flex;
      flex-direction:column;
      overflow: hidden;
      -webkit-transform: translate3d(0,0,0);
      position: relative;
    }
  }
</style>
