var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var reload = browserSync.reload;

var watchDirs = [
  '*',
  '!client/bower_components/',
  'client/css/*.css',
  'client/js/*.js',
  'client/**/*.html'
];

var bsOptions = {
  server: {
    baseDir: "./"
  },
  port: 4000,
  logConnections: true
};

var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'server/server.js',
    ext: 'js json',
    watch: [
      'server/**/',
      'common/**/'
    ]
  }).on('start', function onStart() {
    if (!called) {
      cb();
    }
    called = true;
  }).on('restart', function onRestart() {
    setTimeout(function reload() {
      browserSync.reload({
        stream: false   //
      });
    }, BROWSER_SYNC_RELOAD_DELAY);
  });
});


gulp.task('serve', function () {
  browserSync(bsOptions);
  gulp.watch(watchDirs, {cwd: './'}, reload);
});

// Default task
gulp.task('default', ['nodemon', 'serve']);


