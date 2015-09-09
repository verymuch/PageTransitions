$(function(){
	var a = PageTransitions({
		element: $("#pt-main"),
		index: 1,
		loop: true,
		direction: 'vertical', 		//默认为垂直
		transitionType: 'carousel'
	});
	console.log(a);
	a.$element.on('afterSwitch',function(){
		console.log('页面过渡完成');
		console.log(a);
	});
	
	// setTimeout(function(){
	// 	a.switch(-1);
	// },1000);
});