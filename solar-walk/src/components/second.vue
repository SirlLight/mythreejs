<template>
  <div class="pageView second">
    <h1>second</h1>
  </div>
</template>

<script>
  export default {
    name: 'second',
    created(){
      console.log("2组件："+new Date());
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "../utils/reset";
  .second{
    background-color: #ea445a;
  }
</style>
