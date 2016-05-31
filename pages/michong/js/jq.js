 //地图设置map_fanwei.html
    $(function(){
        $(".map_t_fanwei ul li").click(function(){
            var index=$(this).index();
            $(".map_t_fanwei ul li").removeClass("on");
            $(this).addClass("on");
            if(index==0){
                $(this).find("img").attr("src","images/map_t_6_on.png");
                $(".map_t_fanwei ul li:eq(1) img").attr("src","images/map_t_1.png");
                $(".shanlan_shezhi").hide();
            }else{
                $(this).find("img").attr("src","images/map_t_1_on.png");
                $(".map_t_fanwei ul li:eq(0) img").attr("src","images/map_t_6.png");
                $(".shanlan_shezhi").show();

            }
        })
    })
 //地图设置map_fanwei.html
    $(function(){
        $(".map_t li").click(function(){
            var index=$(this).index()+1;
            $(".map_t li").removeClass("on");
            $(".map_t li").eq(0).find("img").attr("src","images/map_t_1.png");
            $(".map_t li").eq(1).find("img").attr("src","images/map_t_2.png");
            $(".map_t li").eq(2).find("img").attr("src","images/map_t_3.png");
            $(".map_t li").eq(3).find("img").attr("src","images/map_t_4.png");
            $(".map_t li").eq(4).find("img").attr("src","images/map_t_5.png");
            $(this).addClass("on");
            $(this).find("img").attr("src","images/map_t_"+index+"_on.png");

        })
    })
//定位模式,shezhi.html
$(function(){
    $(".icon-down").toggle(
        function(){
        $(this).addClass("icon-down-top");
        $(this).siblings(".icon-down-content").show();
    },
    function(){
        $(this).removeClass("icon-down-top");
        $(this).siblings(".icon-down-content").hide();
    });
})
//底部
    $(function(){
        $(".map_bottom li").mousedown(function(){
            $(".map_bottom li").removeClass("on");
            $(this).addClass("on");
        })
   })
//震动唤醒dingwei,shezhi.html
$(function(){
var trackBar1 = document.getElementById("trackBar1");
trackBar1.min = 1;
trackBar1.max = 100;
trackBar1.step = 1;
trackBar1.value = 1;
trackBar1.addEventListener("change",function(){
    var trackBar1value=document.getElementById("trackBar_1");
    trackBar1value.value=this.value;
});
})
//上传间隔,shezhi.html
$(function(){
var trackBar2 = document.getElementById("trackBar2");
trackBar2.min = 1;
trackBar2.max = 100;
trackBar2.step = 1;
trackBar2.value = 1;
trackBar2.addEventListener("change",function(){
    var trackBar2value=document.getElementById("trackBar_2");
    trackBar2value.value=this.value;
});
})
