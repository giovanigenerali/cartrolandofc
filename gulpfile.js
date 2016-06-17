/*
 * CartrolandoFC (http://cartrolandofc.com)
 * Developed by WGenial (http://wgenial.com.br)
 */

// Includes and Plug-ins
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin  = require('gulp-cssmin');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var watch = require('gulp-watch');
var bower = require('gulp-bower');
var folder_bower = "bower_components";
var replace = require('gulp-replace');
var copy = require('gulp-copy');
var del = require('del');
var replace = require('gulp-replace');
var autoprefixer = require('gulp-autoprefixer');
var ngAnnotate = require('gulp-ng-annotate');
var inject = require('gulp-inject');

// Javascripts files
var javascript_files = [
	'bower_components/jquery/dist/jquery.js',
	'bower_components/bootstrap/dist/js/bootstrap.js',
	'bower_components/angular/angular.js',
	'bower_components/angularUtils-pagination/dirPagination.js',
	'src/js/estatisticas.js',
	'src/js/scripts.js',
];

// CSS files
var css_files = [
	'bower_components/bootstrap/dist/css/bootstrap.css',
	'src/css/style.css',
	'src/css/team.css',
	'src/css/responsive.css'
];

// HTML files
var html_files = [
	'index.html',
	'parciais-rodada.html',
	'estatisticas.html'
];

// Cleanup files
gulp.task('cleanup', function() {
	del(['./**/.DS_Store']);
});

// Javascript Tasks
gulp.task('js', ['cleanup'], function() {
	var timestamp = Math.round(new Date()/1000);
	var filename = 'scripts-'+ timestamp +'.min.js';
	gulp
		.src(javascript_files)
		.pipe(ngAnnotate())
		.pipe(concat(filename))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'))
		.pipe(notify({message: 'Javascript - tasks completed'}))
	// reset build
	del(['build/js/*']);
	return gulp.src(html_files, { base: './' })
		.pipe(replace(/<script src="\/build\/js\/.*>/g,'<script src="/build/js/'+ filename +'" type="text/javascript"></script>'))
		.pipe(gulp.dest('./'));
});

// CSS Tasks

// Main tasks
gulp.task('css', ['cleanup'], function() {
	var timestamp = Math.round(new Date()/1000);
	var filename = 'styles-'+ timestamp +'.min.css';
	gulp
		.src(css_files)
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(concat(filename))
		.pipe(sourcemaps.init())
		.pipe(cssmin())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build/css'))
		.pipe(notify({message: 'CSS - tasks completed'}));
	// reset build
	del(['build/css/*']);
	return gulp.src(html_files, { base: './' })
		.pipe(replace(/<link href="\/build\/css\/.*>/g,'<link href="/build/css/'+ filename +'" rel="stylesheet" type="text/css">'))
		.pipe(gulp.dest('./'));
});

// Watch JS and CSS files
gulp.task('watch', function() {
	gulp.watch(javascript_files, ['js']);
	gulp.watch(css_files, ['css']);
});

// Bower tasks
gulp.task('bower-clean', function() {
	del(['build/','bower_components/']);
});

gulp.task('bower', ['bower-clean'], function() {
	bower().pipe(gulp.dest('bower_components'));
});

// Default task
gulp.task('default', ['watch']);
