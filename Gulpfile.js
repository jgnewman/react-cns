var gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    del = require('del'),
    run = require('gulp-run'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    cns = require('cream-and-sugar'),
    through = require('through'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
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
  return gulp.src('dist/**', { read: false })
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
  return gulp.src(package.paths.scss)
  .pipe(sass())
  .pipe(concat(package.dest.style))
  .pipe(gulp.dest(package.dest.dist));
})
.task('sass:min', function() {
  return gulp.src(package.paths.scss)
  .pipe(sass())
  .pipe(concat(package.dest.style))
  .pipe(cssmin())
  .pipe(gulp.dest(package.dest.dist));
})

/** JavaScript compilation */
.task('js', function() {
  return browserify({entries: [package.paths.app], extensions: ['.cns', '.cream']})
  .transform(creamify)
  .bundle()
  .pipe(source(package.dest.app))
  .pipe(gulp.dest(package.dest.dist));
})
.task('js:min', function() {
  return browserify({entries: [package.paths.app], extensions: ['.cns', '.cream']})
  .transform(creamify)
  .bundle()
  .pipe(source(package.dest.app))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest(package.dest.dist));
})

.task('watch', function () {
  return gulp.watch(
    [package.paths.js, package.paths.jsx, package.paths.html, package.paths.scss],
    function () { return sequence('sass', 'js', browserSync.reload) }
  );
})

.task('watch:min', function () {
  return gulp.watch(
    [package.paths.js, package.paths.jsx, package.paths.html, package.paths.scss],
    function () { return sequence('sass:min', 'js:min', browserSync.reload) }
  );
})

/**
 * Compiling resources and serving application
 */
.task('serve', function(done) {
  return sequence('clean', 'sass', 'js', 'server', 'watch', done);
})
.task('serve:min', function(done) {
  return sequence('clean', 'sass:min', 'js:min', 'server', 'watch:min', done);
});
