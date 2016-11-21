var gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    del = require('del'),
    run = require('gulp-run'),
    sass = require('gulp-sass'),
    cns = require('cream-and-sugar'),
    through = require('through'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create(),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sequence = require('run-sequence'),
    package = require('./package.json'),
    creamify = require('creamify')
    reload = browserSync.reload;

/**
 * Cleaning dist/ folder
 */
gulp.task('clean', function(cb) {
  return gulp.src(['css/**', 'js/**'], { read: false })
             .pipe(clean());
})

/**
 * Running livereload server
 */
.task('server', function() {
  browserSync.init({
    server: {
     baseDir: './'
    }
  });
})

/**
 * sass compilation
 */
.task('sass', function() {
  return gulp.src('scss/app.scss')
  .pipe(sass())
  .pipe(concat('app.css'))
  .pipe(gulp.dest('css'));
})

/**
 * js compilation
 */
.task('js', function() {
  return browserify({entries: ['cream/app.cream'], extensions: ['.cns', '.cream']})
  .transform(creamify)
  .bundle()
  .pipe(source('app.js'))
  .pipe(gulp.dest('js'));
})

/**
 * watch files and recompile
 */
.task('watch', function () {
  return gulp.watch(
    ['cream/**/*.cream', 'cream/**/*.cns', 'scss/**/*.scss', 'index.html'],
    function () {
      return sequence('sass', 'js', browserSync.reload);
    }
  );
})

/**
 * compile resources and run a server
 */
.task('serve', function(done) {
  return sequence('clean', ['sass', 'js'], 'server', 'watch', done);
});;
