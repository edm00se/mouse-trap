'use strict';

import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('images', () =>
  gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('docs/images'))
    .pipe($.size({title: 'images'}))
);

gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/docs/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('docs'))
    .pipe($.size({title: 'copy'}))
);

gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src([
    'app/styles/**/*.scss',
    'app/styles/**/*.css'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('docs/styles'));
});

gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('docs'));
});

gulp.task('clean', () => del(['.tmp', 'docs/*', '!docs/.git'], {dot: true}));

gulp.task('serve', ['styles'], () => {
  browserSync({
    notify: false,
    logPrefix: 'party',
    server: ['.tmp', 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

gulp.task('serve:docs', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'party',
    server: 'docs',
    port: 3001
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['html', 'images', 'copy'],
    cb
  )
);
