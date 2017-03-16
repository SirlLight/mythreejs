<template>
  <div id="app">
    <div id="viewport"
         class="viewport"
         @touchstart="onTouchStart($event)"
         @touchmove="onTouchMove($event)"
         @touchend="onTouchEnd($event)"
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
      pageHeight:0,
      viewport:null,
      maxHeight:0,
      pageView:null,
      startY:0,
      endY:0,
      pageNum:0,
      isMove:false,
      currentPosition:0
    }
  },
  methods:{
    onload(){
      this.pageHeight = document.body.clientHeight;
      this.viewport = document.getElementById('viewport');
      this.pageViewLen = this.viewport.getElementsByTagName('div').length;
      this.maxHeight = - this.pageHeight * (this.pageViewLen-1);
      this.viewport.style.webkitTransform='translate(0px,0px)';
      console.log("pageViewLen:"+this.pageViewLen);
    },
    onTouchStart(e){
      this.startY=e.touches[0].clientY;
      this.isMove=true;
      console.log(this.startY);
    },
    onTouchMove(e){
      console.log("move");
      let self=this;
      if(self.isMove){
        self.endY=e.touches[0].clientY;
        let moveLength=self.startY-self.endY;
        if(moveLength>0){
          if(self.currentPosition<=self.maxHeight){
            return
          }
        }else {
          if(self.currentPosition>=0){
            return
          }
        }
        this.viewport.style.webkitTransform = 'translate(0px,'+ (self.currentPosition-moveLength) +'px)';
      }
    },
    onTouchEnd(e){
      this.endY=e.changedTouches[0].clientY;
      console.log("endY:"+this.endY);
      if(this.isMove){
        this.transform(this.startY,this.endY);
      }
    },
    transform(start,end){
      let self=this;
      let temp;
      if(start-end>0) {
        console.log("down");
        self.pageNum--;
        temp=self.pageNum*self.pageHeight;
        if(temp<=-(self.pageViewLen*self.pageHeight)){
          self.pageNum=-(self.pageViewLen-1);
          return;
        }
      }else{
        console.log("up");
        self.pageNum++;
        temp=self.pageNum*self.pageHeight;
        if(temp>0){
          self.pageNum=0;
          return;
        }
      }
      console.log(self.pageNum);
      self.currentPosition=temp;
      self.viewport.style.webkitTransform='translate(0px,'+temp+'px)';
    }
  },
  mounted(){
    this.onload();
  },
  created(){
    /*this.onload();*/
  }
}
</script>

<style lang="less" rel="stylesheet/less">
  @import "utils/reset";
  html{
    height: 100%;
    body{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }
  #app {
    height: 100%;
    display: flex;
    overflow: hidden;
    .viewport{
      width: 100%;
      -webkit-transform: translateY(0px);
      -webkit-transition: -webkit-transform 500ms;
    }
  }
</style>
