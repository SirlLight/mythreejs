<template>
  <div class="pageView first">
    <h1>first</h1>
  </div>
</template>

<script>
export default {
  name: 'first',
  created(){
    console.log("1组件："+new Date());
  }
}
</script>

<style lang="less" rel="stylesheet/less">
  @import "../utils/reset";
  .pageView{
    width: 100%;
    height: 100%;
  }
  .first{
    background: url("../assets/4.jpg");
    background-size: 100%;
  }
</style>
