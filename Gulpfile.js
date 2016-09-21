var gulp = require('gulp'),
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
    browserSync = require('browser-sync'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sequence = require('run-sequence'),
    package = require('./package.json'),
    reload = browserSync.reload;

function cream() {
  var buf = '';

  function write(data) {
    buf += data;
  }

  function end() {
    this.queue(cns.compileCode(buf.toString(), null, { finalize: true }));
    this.queue(null);
  }

  return function () {
    return through(write, end);
  };
}

/**
 * Cleaning dist/ folder
 */
gulp.task('clean', function(cb) {
  del(['dist/**'], cb);
})

/**
 * Running livereload server
 */
.task('server', function() {
  browserSync({
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
  return browserify({entries: package.paths.app, transform: [cream()]})
  .bundle()
  .pipe(source(package.dest.app))
  .pipe(gulp.dest(package.dest.dist));
})
.task('js:min', function() {
  return browserify({entries: package.paths.app, transform: [cream()]})
  .bundle()
  .pipe(source(package.dest.app))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest(package.dest.dist));
})

/**
 * Compiling resources and serving application
 */
.task('serve', ['clean', 'sass', 'js', 'server'], function() {

  return gulp.watch([
    package.paths.js, package.paths.jsx, package.paths.html, package.paths.scss
  ], [
   'sass', 'js', browserSync.reload
  ]);
})
.task('serve:minified', ['clean', 'sass:min', 'js:min', 'server'], function() {
  return gulp.watch([
    package.paths.js, package.paths.jsx, package.paths.html, package.paths.scss
  ], [
   'sass:min', 'js:min', browserSync.reload
  ]);
});
