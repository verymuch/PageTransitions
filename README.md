##简介
PageTransition是一款实现了手机浏览器中多种页面过渡效果的插件。
##如何使用？
###html
|默认类名	|作用	|
|-----------:|:----	|
|pt-perspective	|页面过渡容器	|
|pt-page	|页面过渡单页	|
|pt-page-current	|当前页	|

·<div id="pt-main" class="pt-perspective">
	<div class="pt-page pt-page-1 ">
	</div>
	<div class="pt-page pt-page-2">
	</div>
	<div class="pt-page pt-page-3">
	</div>
	<div class="pt-page pt-page-4">
	</div>
	<div class="pt-page pt-page-5">
	</div>
	<div class="pt-page pt-page-6">
	</div>
</div>·

###Javascript
引用依赖文件：zepto基础库、zepto touch模块、modernizr/widget

·<script src="../../module/zepto/zepto.js"></script>
<script src="../../module/zepto/touch.js"></script>
<script src="../../module/modernizr.custom.js"></script>
<script src="../../module/widget.1.0.2.js"></script>
<script src="../../production/minjs/PageTransitions.min.js"></script>·

###CSS
default为rest css文件
animation为所有页面过渡效果 css文件
components为插件基础css文件
·<link rel="stylesheet" href="../../production/mincss/default.min.css">
<link rel="stylesheet" href="../../production/mincss/animations.min.css">
<link rel="stylesheet" href="../../production/mincss/components.min.css">·

##可配置参数
·var config = {
	element: '.pt-perspective', 	//PageTransitions元素
	index: 0, 						//初始状态，当前元素
	loop: false,					//是否可循环，默认为false，不可循环
	direction: 'vertical',			//页面过渡方向，默认为垂直方向
	transitionType: 'slide',		//切换页面的过渡效果吗，默认为slide
}·

##对外接口方法
pt = new PageTransitions(config);
pt.next();			//切换到下一页
pt.prev();			//切换到上一页
pt.switch;			//切换到指定页，传入参数n


##事件
pt.on('afterSwitch',function(){});		//页面过渡完成后，触发事件