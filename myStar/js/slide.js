(function(window,document){
    var currentPosition = 0; //记录当前页面位置
    var viewport =  document.querySelector('#viewport');
    var pageview = document.querySelectorAll('.pageview');
    viewport.style.webkitTransform = "translate(0,0)";
    console.log("currentPosition:"+currentPosition);

    var app = {
        init:function(){
           document.addEventListener('DOMContentLoaded',function(){
               app.bindTouchEvent(); //绑定触摸事件
           }.bind(app),false);
        }(),

        //绑定触摸事件
        bindTouchEvent:function(){
           var pageHeight = document.body.clientHeight; //页面高度
           var maxHeight = - pageHeight * (pageview.length-1); //页面滑动最后一页的位置
           var startX,startY;
           var initialPos = 0;  // 手指按下的屏幕位置
           var moveLength = 0;  // 手指当前滑动的距离
           var direction = "top"; //滑动的方向
           var isMove = false; //是否滑动

           /*手指放在屏幕上*/
           document.addEventListener("touchstart",function(e){
               var touch = e.touches[0];
               startX = touch.pageX;
               startY = touch.pageY;
               initialPos = currentPosition;   //本次滑动前的初始位置
               viewport.style.webkitTransition = ""; //取消动画效果
               isMove = false; 
           }.bind(this),false);

           /*手指在屏幕上滑动*/
           document.addEventListener("touchmove",function(e){
               var touch = e.touches[0];
               var deltaX = touch.pageX - startX;
               var deltaY = touch.pageY - startY;
               if (Math.abs(deltaY) > Math.abs(deltaX)){
                   moveLength = deltaY;
                   var translate = initialPos + deltaY; //当前需要移动到的位置
                   //如果translate>0 或 < maxHeight,则表示页面超出边界
                   if (translate <=0 && translate >= maxHeight){
                       this.transform.call(viewport,translate);
                       isMove = true;
                   }
                   direction = deltaY>0?"bottom":"top"; //判断手指滑动的方向
               }
           }.bind(this),false);

           /*手指离开屏幕时，计算最终需要停留在哪一页*/
           document.addEventListener("touchend",function(e){
               var translate = 0;
               if (isMove){
                    //使用动画过渡让页面滑动到最终的位置
                    viewport.style.webkitTransition = "0.3s ease -webkit-transform";
                    translate = direction == 'top'?currentPosition-pageHeight+moveLength:currentPosition+pageHeight-moveLength;
                    //如果最终位置超过边界位置，则停留在边界位置
                    translate = translate > 0 ? 0 : translate; //上边界
                    translate = translate < maxHeight ? maxHeight : translate; //下边界
                    //执行滑动
                    this.transform.call(viewport,translate);
                }
           }.bind(this),false);
       },

       //页面移动
        transform:function(translate){
           this.style.webkitTransform = "translate(0,"+translate+"px)";
           currentPosition = translate;
           console.log("currentPosition:"+currentPosition);
        }
    }
})(window,document);
