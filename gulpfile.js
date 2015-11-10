'use strict';

var
    browserSync     = require("browser-sync"),
    cssmin          = require('gulp-minify-css'),
    gulp            = require('gulp'),
    imagemin        = require('gulp-imagemin'),
    minifyHTML      = require('gulp-minify-html'),
    notify          = require('gulp-notify'),
    pngquant        = require('imagemin-pngquant'),
    prefixer        = require('gulp-autoprefixer'),
    reload          = browserSync.reload,
    rigger          = require('gulp-rigger'),
    rimraf          = require('rimraf'),
    sass            = require('gulp-sass'),
    sftp            = require('gulp-sftp'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify'),
    watch           = require('gulp-watch')
;

var path = {
    build: {
        html: './build/',
        js: './build/js/',
        css: './build/css/',
        img: './build/img/',
        fonts: './build/fonts/'
    },
    src: {
        html: './src/*.html',
        js: './src/js/main.js',
        style: './src/css/main.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    watch: {
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        style: './src/css/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Blazing"
};

var hosting = {
    host: 'ftp',
    user: 'user',
    pass: 'pass',
    remotePath: 'path'
};

/* ------------------------------------------- */

gulp.task('default', ['build', 'webserver', 'watch']);

/* ------------------------------------------- */

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb)
    .pipe(notify('Сlean Build Done!'));
});

/* ------------------------------------------- */

gulp.task('build:html', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}))
        .pipe(notify('build:html Done!'));
});

gulp.task('build:js', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}))
        .pipe(notify('build:js Done!'));
});

gulp.task('build:style', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['./src/css/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}))
        .pipe(notify('build:style Done!'));
});

gulp.task('build:image', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}))
        .pipe(notify('build:image Done!'));
});

gulp.task('build:fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'build:html',
    'build:js',
    'build:style',
    'build:fonts',
    'build:image'
]);

/* ------------------------------------------- */

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('build:html');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('build:style');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('build:js');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('build:image');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('build:fonts');
    });
});

/* ------------------------------------------------------- */

// SFTP
gulp.task('sftp', ['build'], function() {
    return gulp.src('./build/**/*')
        .pipe(sftp({
            host: hosting.host,
            user: hosting.user,
            pass: hosting.pass,
            remotePath: hosting.remotePath
        }))
        .pipe(notify('sftp Done!'));
});

// Deploy
gulp.task('deploy', ['sftp']);

/* ------------------------------------------------------- */
