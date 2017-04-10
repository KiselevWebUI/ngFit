'use strict';

var gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    webserver = require('gulp-webserver'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    ngAnnotate = require('gulp-ng-annotate');

var condition = 'builds/development/app/**/about_test.js';
    
var bc = './bower_components/';

gulp.task('js', function(cb){
  pump([
    gulp.src(['builds/development/app/**/*.js', '!builds/development/app/**/*_test.js'])
      ,concat('app.js')
      ,ngAnnotate()
      ,uglify()
      ,gulp.dest('builds/dist/app/')
  ],cb);

});

gulp.task('html', function(){
  gulp.src('builds/development/**/*.html')
      .pipe(gulp.dest('builds/dist/'))
});

gulp.task('sass', function(){
  gulp.src('builds/development/sass/**/*')
      .pipe(sass())
      .pipe(concat('style.min.css'))
      .pipe(csso())
      //.pipe(uglify())
      .pipe(gulp.dest('builds/dist/css/'));
});

gulp.task('img', function(){
  gulp.src('builds/development/img/**/*')
      .pipe(gulp.dest('builds/dist/img/'));
});

gulp.task('watch', function(){
  gulp.watch('builds/development/app/**/*.js', ['js']);
  gulp.watch('builds/development/sass/**/*.scss', ['sass']);
  gulp.watch('builds/development/**/*.html', ['html']);
  gulp.watch('builds/development/img/**/*', ['img']);
});

gulp.task('libs', function(){
  gulp.src([bc+'jquery/dist/jquery.js',
            bc+'bootstrap/dist/js/bootstrap.js',
            bc+'bootstrap-material-design/dist/js/material.js',
            bc+'bootstrap-material-design/dist/js/ripples.js'
          ])
      .pipe(concat('all.dist.concat.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./builds/dist/libs/jquery/'));

  gulp.src(bc+'bootstrap/dist/**/*.*')
      .pipe(gulp.dest('./builds/dist/libs/bootstrap/'));

  gulp.src(bc+'bootstrap-material-design/dist/**/*.*')
      .pipe(gulp.dest('./builds/dist/libs/bootstrap-material-design/'));

  gulp.src([bc+'angular/angular.js',
            bc+'angular-animate/angular-animate.js',
            bc+'angular-cookies/angular-cookies.js',
            bc+'angular-i18n/angular-locale_ru-ru.js',
            bc+'angular-loader/angular-loader.js',
            bc+'angular-resource/angular-resource.js',
            bc+'angular-route/angular-route.js',
            bc+'angular-sanitize/angular-sanitize.js',
            bc+'angular-touch/angular-touch.js',
            bc+'firebase/firebase.js',
            bc+'angularfire/dist/angularfire.js',
            bc+'ngInfiniteScroll/build/ng-infinite-scroll.js',
            bc+'ng-affix/dist/js/ng-affix.js'
          ])
      .pipe(concat('angular.concat.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./builds/dist/libs/angular/'));
});

gulp.task('webserver', function(){
  gulp.src('builds/dist/')
      .pipe(webserver({
        livereload: true,
        open: true/*,
        port: 8080*/
      }));
});

gulp.task('default', [
  'libs',
  'html',
  'img',
  'js',
  'sass',
  'webserver',
  'watch'
]);
