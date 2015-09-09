##简介
PageTransition是一款实现了手机浏览器中多种页面过渡效果的插件。

##如何使用？
###demo演示
[在线演示地址](http://qxu1589920370.my3w.com/PageTransitions/production/minhtml/test.min.html '页面过渡在线演示') （请按照第二步进行预览）

1.  下载源码，使用chrome浏览器，打开dev目录下的test.html或者production目录下的test.min.html
2.  请用正确的姿势打开————使用手机模拟预览（参考下图）
	* F12打开开发者工具
	* 先点击左上角的手机模拟
	* 在勾选红色方框中三个复选框
	* 选择一款手机模式
	![手机模拟](http://i3.tietuku.com/750455166c3e5270.png)

###html
|默认类名	|作用	|
|-----------:|:----	|
|pt	|页面过渡容器	|
|pt-page	|页面过渡单页	|
|pt-page-current	|当前页	|

	<div id="pt-main" class="pt-perspective">
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
	</div>

###Javascript
引用依赖文件：zepto基础库、zepto touch模块、modernizr

	<script src="../../module/zepto/zepto.js"></script>
	<script src="../../module/zepto/touch.js"></script>
	<script src="../../module/modernizr.custom.js"></script>
	<script src="../../production/minjs/PageTransitions.min.js"></script>

###CSS
default为rest css文件  
animation为所有页面过渡效果 css文件  
components为插件基础css文件  

	<link rel="stylesheet" href="../../production/mincss/default.min.css">
	<link rel="stylesheet" href="../../production/mincss/animations.min.css">
	<link rel="stylesheet" href="../../production/mincss/components.min.css">

###可配置参数
	var config = {
		element: '.pt-perspective', 	//PageTransitions元素
		index: 0, 						//初始状态，当前元素
		loop: false,					//是否可循环，默认为false，不可循环
		direction: 'vertical',			//页面过渡方向，默认为垂直方向
		transitionType: 'slide',		//切换页面的过渡效果吗，默认为slide
	}

###页面过渡效果可选参数
|类型	|效果描述	|
|-----------:|:----	|
|slide	|滑入滑出	|
|fadeOutSlideIn	|淡入滑出	|
|fade	|淡入淡出	|
|easingOutSlideIn	|渐出滑入	|
|scaleDownOutSlideIn	|缩小退出 滑入	|
|scaleDown	|缩小进入、退出	|
|scaleUp	|放大进入、退出	|
|scaleUpInSlideOut	|放大进入 滑动退出	|
|scaleUpInScaleDownOut	|放大进入、缩小退出	|
|SlideInRotateOut	|以各边旋转退出 滑动进入	|
|flip	|翻转进入、退出	|
|rotateFall	|旋转掉落	|
|rotateCircle	|转圈进入、退出	|
|slideInPushOut	|滑动进入、推门而出	|
|pullInPushOut	|拉门而入、推门而出	|
|slideFadeInFoldOut	|淡入滑动而入、打开而出	|
|foldInSlideFadeOut	|关闭而入、淡入滑动而出 |
|room	|魔方而入、魔方而出	|
|carousel	|飞入、飞出	|
|side	|挤入挤出	|


###开启页面过渡
	pt = PageTransitions(config);

###对外接口方法

* pt.next();			//切换到下一页
* pt.prev();			//切换到上一页
* pt.switch;			//切换到指定页，传入参数n，n可以为负数（从后面开始计数，-1为最后一页）


###事件
	pt.on('afterSwitch',function(){});		//页面过渡完成后，触发事件