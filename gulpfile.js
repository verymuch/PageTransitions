/******** 参考网站1： http://www.techug.com/gulp *************/
/******** 参考网站2： http://www.cnblogs.com/2050/p/4198792.html *************/

var gulp = require('gulp'),//安装gulp 加载gulp
	sass = require('gulp-ruby-sass'),//编译css
	autoprefixer = require('gulp-autoprefixer'),//
	minifycss = require('gulp-minify-css'),//压缩css
	jshint = require('gulp-jshint'),//监测js代码
	uglify = require('gulp-uglify'),//压缩（丑化）js
	minifyhtml = require('gulp-minify-html'),//压缩html
	imagemin = require('gulp-imagemin'),//图片压缩
	rename = require('gulp-rename'),//重命名文件
	clean = require('gulp-clean'),//清理文件夹
	concat = require('gulp-concat'),//合并文件
	notify = require('gulp-notify'),//更改通知
	cache = require('gulp-cache'),//图片快取，只有改动过的图片会进行压缩
	livereload = require('gulp-livereload'),//即时重载
	plugins = require('gulp-load-plugins'),//自动加载插件
	pngquant = require('imagemin-pngquant'),//imagemin中 压缩png
	tinypng = require('gulp-tinypng');

//压缩样式文件
gulp.task('styles',function(){
	return gulp.src('dev/css/**/*.css')
		.pipe(rename({suffix:'.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('production/mincss'))
		.pipe(livereload())
		.pipe(notify({message:'css文件压缩完成'}));
});

//JSHint,拼接以及压缩js 
gulp.task('scripts',function(){
	return gulp.src('dev/js/**/*.js')
		// .pipe(jshint())
		// .pipe(jshint.reporter())
		// // .pipe(concat('all.js'))//合并匹配到的js文件并命名为"all.js"
		// .pipe(gulp.dest('js/jshint'))
		.pipe(rename({suffix:'.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('production/minjs'))
		.pipe(livereload())
		.pipe(notify({message:'js文件压缩完成'}));
});

//图片压缩
gulp.task('images',function(){
	return gulp.src('dev/images/**/*')
		.pipe(cache(imagemin({optimizationLevel: 1, progressive: true, interlaced: true})))
		.pipe(gulp.dest('production/minimages'))
		.pipe(livereload())
		.pipe(notify({message:'图片压缩完成'}));
});

//html文件压缩
gulp.task('htmls',function(){
	gulp.src('dev/html/**/*.html')
		.pipe(minifyhtml())
		.pipe(livereload())
		.pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest('production/minhtml'))
		.pipe(notify({message:'html文件压缩完成'}));
});

//清理目的文件夹 会删除指定文件目录
gulp.task('clean',function(){
	return gulp.src(['production/mincss','production/minjs','production/minimages',,'production/minhtml'],{})
		.pipe(clean());
});

//建立预设(默认)任务
gulp.task('default', ['clean'], function(){
	gulp.start('styles','scripts','images','htmls');
});

//建立监视任务
gulp.task('watch',function(){

	livereload.listen();//调用listen()方法

	//监视所有css文档
	gulp.watch('dev/css/**/*.css',['styles']);

	//监视所有js文档
	gulp.watch('dev/js/**/*.js',['scripts']);

	//监视所有图片文档
	gulp.watch('dev/images/**/*',['images']);

	//监视所有html文档
	gulp.watch('dev/html/**/*.html',['htmls']);

});