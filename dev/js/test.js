$(function(){
	var a = new PageTransitions({
		element: $("#pt-main"),
		index: 1,
		loop: true,
		direction: 'vertical', 		//默认为垂直
		transitionType: 'cube'
	});
	a.on('afterSwitch',function(){
		console.log('页面过渡完成');
		console.log(a);
	});
	setTimeout(function(){
		a.switch(8);
	},1000);
});