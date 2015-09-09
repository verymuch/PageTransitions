(function( window, undefined ) {

var document = window.document,
	version = '0.0.1',

	_PageTransitions = window.pageTransitions ,	//防冲突备用

	_pt = window.pt,							//防冲突备用

	PageTransitions = function( config ) {
		return new PageTransitions.prototype.init( config );
	};

PageTransitions.prototype = {

	version: version,
	
	constructor: PageTransitions,
	
	element: '.pt',						//执行页面过渡的最外层元素,注意此处带有.
			
	index: '-1',						//默认显示的页面
	
	count: '0',							//页面总数

	loop: 'false',						//是否支持循环，默认为不可循环

	direction: 'vertical',				//页面过渡方向，默认为竖直方向

	transitionType: 'slide',			//页面过渡类型，默认为 slide 滑动 

	selectors: {
		ptPage: 'pt-page',				//过渡页的类名
		current: 'pt-page-current' 		//当前显示页
	}, 

	//初始化
	init: function( config ) {
		var self = this,
			selectors = self.selectors;

		/*** 初始化配置属性 ***/
		if( config && $.isPlainObject( config ) ) {
			for( var option in config ) {
				if( option in self ) {	//只配置PageTransitions设有的配置属性
					this[ option ] = config[ option ];
				}
			}
		}

		//初始化DOM, 页面过渡所有页面
		/*** 需要优先执行，后续需要使用$element来注册事件 **/
		self.$element = $( self.element );
		self.$ptPages = self.$element.children( '.' + selectors.ptPage );
		self.count = self.$ptPages.length;

		/*** 初始化当前配置下的过渡动画类类名 ***/
		self.initTransitionClassName();

		/*** 初始化动画结束事件名、是否正在动画、是否支持css动画 ***/
		self.initAnimEndEventName();

		//如果初始页为 -1 且 count > 0 ,将初始页置为0
		if( self.count > 0 && self.index == -1 ) {
			self.index = 0 ;
		}

		//初始化过渡页面(保存原始class列表)
		self.initPtPages( self.$ptPages );

		//为所有过渡页面绑定swipe事件
		self.bindSwipeEvent();

		//返回this
		return this;

	},

	//伪on函数：当在this上调用on时，视为在页面过渡元素上调用on，监听事件
	on: function( event, callback ) {
		this.$element.on( event, callback );
	},

	//伪trigger函数：当在this上调用trigger时，视为在页面过渡元素上调用trigger，监听事件
	trigger: function( event ) {
		this.$element.trigger( event );
	},

	/* 切换页面 */
	/*
	 ** parameter **
	 * @inIndex: 进入页序号，即将切换进入的页面 *
	 * @type（可缺省）: 判断当前的期望动作是上一页还是下一页  *
	*/
	switch: function( inIndex, type ) {
		var self = this;
		
		/*** 支持负数switch ***/
		if( inIndex < 0 ) {
			inIndex += self.count;
		}

		/* switch做容错处理 */
		//当传入的inIndex大于页面总数时，返回false
		if( inIndex > self.count ) return false;

		//如果正在进行动画，不进行切换页面动作
		if( self.isAnimating ) return false;

		var outIndex = self.index,
			//type区分是往前还是往后（并不只是上一页下一页）
			type = ( type != undefined ) ? type : ( outIndex < inIndex ) ? 'next' : 'prev',
			
			$outPage = $( self.$ptPages[ outIndex ] ),
			$inPage = $( self.$ptPages[ inIndex ] ),
			direction = self.direction;

		//修改动画状态
		self.isAnimating = true;
		// 修改当前选中项
		self.index = inIndex;

		/* 监测动画结束 */
		//为$outPage、$inPage页绑定动画结束事件
		$outPage.on( self.animEndEventName, function() {
			$outPage.off( self.animEndEventName );
			self.endOutPage = true;
			if( self.endInPage ) {
				self.onEndAnimation( $outPage, $inPage );
			}
		});
		$inPage.on( self.animEndEventName, function() {
			$inPage.off( self.animEndEventName );
			self.endInPage = true;
			if( self.endOutPage ) {
				self.onEndAnimation( $outPage, $inPage );
			}
		});
		//如果不支持css动画，手动调用动画结束函数
		if( !self.support ) {
			self.onEndAnimation( $outPage, $inPage );
		}

		//根据direction 和 type 添加动画
		if( direction == 'vertical' ) {
			if( type == 'next' ) {
				$outPage.addClass( self.upOutClass );
				$inPage.addClass( self.upInClass + ' pt-page-current' );
			}else if( type == 'prev' ) {
				$outPage.addClass( self.downOutClass );
				$inPage.addClass( self.downInClass + ' pt-page-current' );
			}
		}else if( direction == 'horizonal') {
			if( type == 'next' ) {
				$outPage.addClass( self.leftOutClass );
				$inPage.addClass( self.leftInClass + ' pt-page-current' );
			}else if( type == 'prev' ) {
				$outPage.addClass( self.rightOutClass );
				$inPage.addClass( self.rightInClass + ' pt-page-current' );
			}
		}
	},

	/* 切换到下一个，成功返回true */
	prev: function() {
		var prev = this.getPrevIndex();
		//prev == -1 时 不做过渡
		if( prev != -1 ) {
			this.switch(prev, 'prev');
			return true;
		}
		return false;
	},

	/* 切换到下一个，成功返回true */
	next: function() {
		var next = this.getNextIndex();
		//next == -1 时 不做过渡
		if( next != -1 ) { 	
			this.switch(next, 'next');
			return true;
		}
		return false;
	},

	/* 获取上一个选项 */
	getPrevIndex: function() {
		var from = this.index,
			to = -1,
			count = this.count;

		//可循环时，计算上一个选项index
		if( this.loop ) {
			to = (from - 1 + count) % count;
		}
		//不可循环时，计算index(不可超出范围)
		else if( (from - 1) >= 0 ) {
			to = from - 1;
		}

		return to;
	},

	/* 获取下一个选项 */
	getNextIndex: function() {
		var from = this.index,
			to = -1,
			count = this.count;

		//可循环时，计算上一个选项index
		if( this.loop ) {
			to = ( from + 1 ) % count;
		}
		//不可循环时，计算index(不可超出范围)
		else if( ( from + 1 ) < count ) {
			to = from + 1;
		}

		return to;
	},

	/* 动画结束时调用 */
	onEndAnimation: function( $outPage, $inPage ) {
		this.endOutPage = false;
		this.endInPage = false;
		this.resetPage( $outPage, $inPage );
		this.isAnimating = false;
		this.trigger( 'afterSwitch' );
	},

	/* 动画结束后，重置页面class列表 */
	resetPage: function( $outPage, $inPage ) {
		$outPage.attr( 'class', $outPage.data('originalClassList') );
		$inPage.attr( 'class', $inPage.data('originalClassList') + ' pt-page-current' );
	},

	/* 为所有页面过渡页面绑定swipe事件 */
	bindSwipeEvent: function() {
		var self = this,
			direction = self.direction;

		/*
			在手机浏览器下，touchmove事件，需要在阻止document触发touchmove事件，才能在元素上触发touchmove事件
		 */
		document.addEventListener('touchmove', function (event) {
                       event.preventDefault();
                    }, false);

		if( direction == 'vertical' ) {
		    self.$ptPages.on({
		        swipeDown: function( e ) {
		            e.stopPropagation();
		            self.prev();
		        },
		        swipeUp: function( e ) {
		            e.stopPropagation();
		            self.next();
		        }
		    });
		}else if( direction == 'horizonal' ) {
		    self.$ptPages.on({
		        swipeRight: function( e ) {
		            e.stopPropagation();
		            self.prev();
		        },
		        swipeLeft: function( e ) {
		            e.stopPropagation();
		            self.next();
		        }
		    });
		}
	},

	/* 初始化过渡页面 */
	/* 存储页面的原始class列表 过渡结束后恢复原列表 */
	initPtPages: function( $pages ) {
		//将所有过渡页面的原始class列表保存
		$pages.each(function() {
			var $page = $( this );
			$page.data( 'originalClassList', $page.attr( 'class' ) );
		});
		//给当前页添加class 
		$pages.eq( this.index ).addClass( this.selectors.current );
	},
	
	/*** 判断是否支持css动画、是否正在进行动画、离开页动画是否完成、进入页动画是否完成、以及设置动画结束事件名 ***/
	initAnimEndEventName: function() {
		var self = this;
		var animEndEventNames = {
			'WebkitAnimation' : 'webkitAnimationEnd',
			'OAnimation' : 'oAnimationEnd',
			'msAnimation' : 'MSAnimationEnd',
			'animation' : 'animationend'
		};
		self.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];
		self.isAnimating = false;
		self.endOutPage = false;
		self.endInPage = false;
		self.support = Modernizr.cssanimations;
		
	},

	/* 此处代码繁多 主要是根据不同的过渡类型 生成过渡动画class 可跳过 */
	/* 根据transitionType和direction的值 生成页面过渡Class类名 */
	initTransitionClassName: function() {
		var self = this,
			transitionType = self.transitionType,
			direction = self.direction;
		switch( transitionType ) {
			/* 划入划出 */
			case 'slide':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class           
					self.upInClass = 'pt-page-moveFromBottom';
					self.upOutClass = 'pt-page-moveToTop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTop';
					self.downOutClass = 'pt-page-moveToBottom';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRight';
					self.leftOutClass = 'pt-page-moveToLeft';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeft';
					self.rightOutClass = 'pt-page-moveToRight';
				}
				break;
			/* 淡出滑入 */
			case 'fadeOutSlideIn':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottom pt-page-ontop';
					self.upOutClass = 'pt-page-fade';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTop pt-page-ontop';
					self.downOutClass = 'pt-page-fade';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRight pt-page-ontop';
					self.leftOutClass = 'pt-page-fade';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeft pt-page-ontop';
					self.rightOutClass = 'pt-page-fade';
				}
				break;
			/* 淡入淡出 */
			case 'fade':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottomFade';
					self.upOutClass = 'pt-page-moveToTopFade';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTopFade';
					self.downOutClass = 'pt-page-moveToBottomFade';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRightFade';
					self.leftOutClass = 'pt-page-moveToLeftFade';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeftFade';
					self.rightOutClass = 'pt-page-moveToRightFade';
				}
				break;
			/* 渐出滑入 */
			case 'easingOutSlideIn':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottom';
					self.upOutClass = 'pt-page-moveToTopEasing pt-page-ontop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTop';
					self.downOutClass = 'pt-page-moveToBottomEasing pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRight';
					self.leftOutClass = 'pt-page-moveToLeftEasing pt-page-ontop';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeft';
					self.rightOutClass = 'pt-page-moveToRightEasing pt-page-ontop';
				}
				break;
			/* 缩小退出 滑入 */
			case 'scaleDownOutSlideIn':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottom pt-page-ontop';
					self.upOutClass = 'pt-page-scaleDown';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTop pt-page-ontop';
					self.downOutClass = 'pt-page-scaleDown';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRight pt-page-ontop';
					self.leftOutClass = 'pt-page-scaleDown';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeft pt-page-ontop';
					self.rightOutClass = 'pt-page-scaleDown';
				}
				break;
			/* 缩小进入、退出 */
			case 'scaleDown':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUpDown pt-page-delay300';
					self.upOutClass = self.downOutClass = 'pt-page-scaleDown';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUpDown pt-page-delay300';
					self.leftOutClass = self.rightOutClass = 'pt-page-scaleDown'
				}
				break;
			/* 放大进入、退出 */
			case 'scaleUp':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUp pt-page-delay300';
					self.upOutClass = self.downOutClass = 'pt-page-scaleDownUp';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUp pt-page-delay300';
					self.leftOutClass = self.rightOutClass = 'pt-page-scaleDownUp'
				}
				break;
			/* 放大进入 滑动退出 */
			case 'scaleUpInSlideOut':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-scaleUp';
					self.upOutClass = 'pt-page-moveToTop pt-page-ontop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-scaleUp';
					self.downOutClass = 'pt-page-moveToBottom pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-scaleUp';
					self.leftOutClass = 'pt-page-moveToLeft pt-page-ontop';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-scaleUp';
					self.rightOutClass = 'pt-page-moveToRight pt-page-ontop';
				}
				break;
			/* 放大进入、缩小退出 */
			case 'scaleUpInScaleDownOut':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUpCenter pt-page-delay400';
					self.upOutClass = self.downOutClass = 'pt-page-scaleDownCenter';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUpCenter pt-page-delay400';
					self.leftOutClass = self.rightOutClass = 'pt-page-scaleDownCenter'
				}
				break;
			/* 以各边旋转退出 滑动进入 */
			case 'SlideInRotateOut':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
					self.upOutClass = 'pt-page-rotateBottomSideFirst';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
					self.downOutClass = 'pt-page-rotateTopSideFirst';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
					self.leftOutClass = 'pt-page-rotateRightSideFirst';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
					self.rightOutClass = 'pt-page-rotateLeftSideFirst';
				}
				break;
			/* 翻转进入、退出 */
			case 'flip':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-flipInBottom pt-page-delay500';
					self.upOutClass = 'pt-page-flipOutTop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-flipInTop pt-page-delay500';
					self.downOutClass = 'pt-page-flipOutBottom';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-flipInRight pt-page-delay500';
					self.leftOutClass = 'pt-page-flipOutLeft';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-flipInLeft pt-page-delay500';
					self.rightOutClass = 'pt-page-flipOutRight';
				}
				break;
			/* 旋转掉落 */
			/*********此处可做调整，分别从四个角掉落**********/
			case 'rotateFall':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUp';
					self.upOutClass = self.downOutClass = 'pt-page-rotateFall pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUp';
					self.leftOutClass = self.rightOutClass = 'pt-page-rotateFall pt-page-ontop'
				}
				break;
			/* 转圈进入、退出 */
			case 'rotateCircle':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-rotateInNewspaper pt-page-delay500';
					self.upOutClass = self.downOutClass = 'pt-page-rotateOutNewspaper';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-rotateInNewspaper pt-page-delay500';
					self.leftOutClass = self.rightOutClass = 'pt-page-rotateOutNewspaper'
				}
				break;
			/* 滑动进入、推门而出 */
			case 'slideInPushOut':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottom';
					self.upOutClass = 'pt-page-rotatePushTop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTop';
					self.downOutClass = 'pt-page-rotatePushBottom';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRight';
					self.leftOutClass = 'pt-page-rotatePushLeft';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeft';
					self.rightOutClass = 'pt-page-rotatePushRight';
				}
				break;
			/* 拉门而入、推门而出 */
			case 'pullInPushOut':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-rotatePullBottom pt-page-delay180';
					self.upOutClass = 'pt-page-rotatePushTop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-rotatePullTop pt-page-delay180';
					self.downOutClass = 'pt-page-rotatePushBottom';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-rotatePullRight pt-page-delay180';
					self.leftOutClass = 'pt-page-rotatePushLeft';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-rotatePullLeft pt-page-delay180';
					self.rightOutClass = 'pt-page-rotatePushRight';
				}
				break;
			/* 淡入滑动而入、打开而出 */
			case 'slideFadeInFoldOut':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-moveFromBottomFade';
					self.upOutClass = 'pt-page-rotateFoldTop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-moveFromTopFade';
					self.downOutClass = 'pt-page-rotateFoldBottom';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-moveFromRightFade';
					self.leftOutClass = 'pt-page-rotateFoldLeft';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-moveFromLeftFade';
					self.rightOutClass = 'pt-page-rotateFoldRight';
				}
				break;
			/* 关闭而入、淡入滑动而出 */
			case 'foldInSlideFadeOut':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-rotateUnfoldBottom';
					self.upOutClass = 'pt-page-moveToTopFade';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-rotateUnfoldTop';
					self.downOutClass = 'pt-page-moveToBottomFade';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-rotateUnfoldRight';
					self.leftOutClass = 'pt-page-moveToLeftFade';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-rotateUnfoldLeft';
					self.rightOutClass = 'pt-page-moveToRightFade';
				}
				break;
			/* room而入、room而出 */
			case 'room':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-rotateRoomTopIn';
					self.upOutClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-rotateRoomBottomIn';
					self.downOutClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-rotateRoomLeftIn';
					self.leftOutClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-rotateRoomRightIn';
					self.rightOutClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
				}
				break;
			/* 魔方而入、魔方而出 */
			case 'cube':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-rotateCubeTopIn';
					self.upOutClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-rotateCubeBottomIn';
					self.downOutClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-rotateCubeLeftIn';
					self.leftOutClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-rotateCubeRightIn';
					self.rightOutClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
				}
				break;
			/* 飞入、飞出 */
			case 'carousel':
				if( direction == 'vertical' ) {
					//向上滑动时，进入和离开页面的class
					self.upInClass = 'pt-page-rotateCarouselTopIn';
					self.upOutClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
					//向下滑动时，进入和离开页面的class
					self.downInClass = 'pt-page-rotateCarouselBottomIn';
					self.downOutClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//向左滑动时，进入和离开页面的class
					self.leftInClass = 'pt-page-rotateCarouselLeftIn';
					self.leftOutClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
					//向右滑动时，进入和离开页面的class
					self.rightInClass = 'pt-page-rotateCarouselRightIn';
					self.rightOutClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
				}
				break;
			/* 挤入挤出 */
			/*********此处可做调整，分别从四个方向**********/
			case 'side':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-rotateSidesIn pt-page-delay200';
					self.upOutClass = self.downOutClass = 'pt-page-rotateSidesOut';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-rotateSidesIn pt-page-delay200';
					self.leftOutClass = self.rightOutClass = 'pt-page-rotateSidesOut'
				}
				break;
		}
	}

};

PageTransitions.prototype.init.prototype = PageTransitions.prototype;

window.pt = window.PageTransitions = PageTransitions;

})(window);
