<template>
  <div class="pageView third">
    <universe/>
  </div>
</template>

<script>
  import universe from './universe'

  export default {
    name: 'third',
    components:{universe},
    data(){
      return{
      }
    },
    methods:{
    },
    mounted(){
    },
    created(){
      console.log("3组件："+new Date())
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import "../utils/reset";
  .third{
    background-color: #999966;
  }
</style>
