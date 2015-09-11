$(function(){
	var a = PageTransitions({
		element: $("#pt-main"),
		index: 1,
		loop: true,
		direction: 'horizonal', 		//默认为垂直
		transitionType: 'rotateCircle',
		selectors: {
			ptPage: 'pt-page'
		},
		test: 'aaaa'
	});
	// var b = PageTransitions({
	// 	element: $(".pt-pt"),
	// 	index: 1,
	// 	loop: true,
	// 	direction: 'horizonal', 		//默认为垂直
	// 	transitionType: 'rotateCircle',
	// 	selectors: {
	// 		ptPage: 'pt-page'
	// 	},
	// 	test: 'aaaa'
	// });
	// a.upInClass = "pt-page-rotateInNewspaper"
	console.log(a);
	a.$element.on('afterSwitch',function(){
		console.log('页面过渡完成');
		console.log(a);
	});
	
	// setTimeout(function(){
	// 	a.switch(-1);
	// },1000);
});