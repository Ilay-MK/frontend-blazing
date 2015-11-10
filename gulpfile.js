'use strict';

var
    browserSync     = require("browser-sync"),
    googlecdn       = require('gulp-google-cdn'),
    gulp            = require('gulp'),
    gulpif          = require('gulp-if'),
    imagemin        = require('gulp-imagemin'),
    minifyCss       = require('gulp-minify-css'),
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
    useref          = require('gulp-useref'),
    watch           = require('gulp-watch'),
    wiredep         = require('wiredep').stream
;

/* ------------------- */

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

/* ------------------- */

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Blazing"
};

/* ------------------- */

var hosting = {
    host: 'ftp',
    user: 'user',
    pass: 'pass',
    remotePath: 'path'
};

/* ------------------------------------------- */

gulp.task('default', ['wiredep+cdn', 'watch:wiredep+cdn']);
gulp.task('start', ['build', 'webserver', 'watch']);

/* ------------------------------------------- */

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean:build', function (cb) {
    rimraf(path.clean, cb);
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
        .pipe(sourcemaps.write('./maps'))
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
        .pipe(prefixer({
            browsers: ['last 20 versions', '> 0%', 'ie 6', 'ie 7', 'ie 8', 'ie 9', 'Firefox ESR', 'Opera 12.1'],
            cascade: false
        }))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('./maps'))
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

gulp.task('watch:build', function(){
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

/* ------------------------------------------- */

// Wiredep
gulp.task('wiredep', function() {
    gulp.src('./src/template/base/*.html')
        .pipe(wiredep({
            directory: "./bower_components"
        }))
        .pipe(gulp.dest('./src/template/base/'))
        .pipe(reload({stream: true}))
        .pipe(notify('Wiredep Done!'));
});

// Watch Wiredep
gulp.task('watch:wiredep', function() {
    gulp.watch('bower.json', ['wiredep']);
})

// Google CDN
gulp.task('cdn', function() {
    return gulp.src('./src/template/base/*.html')
        .pipe(googlecdn(require('./bower.json')))
        .pipe(gulp.dest('./src/template/base/'))
        .pipe(reload({stream: true}))
        .pipe(notify('GoogleCDN Done!'));
});

// Watch Google CDN
gulp.task('watch:cdn', function() {
    gulp.watch('bower.json', ['cdn']);
})

/* ---------------------- */

// Google CDN
gulp.task('wiredep+cdn', function() {
    return gulp.src('./src/template/base/*.html')
        // Wiredep
        .pipe(wiredep({
            directory: "./bower_components"
        }))
        .pipe(gulp.dest('./src/template/base/'))
        .pipe(reload({stream: true}))
        .pipe(notify('Wiredep Done!'))
        // CDN
        .pipe(googlecdn(require('./bower.json')))
        .pipe(gulp.dest('./src/template/base/'))
        .pipe(reload({stream: true}))
        .pipe(notify('GoogleCDN Done!'));
});

// Watch:wiredep+cdn
gulp.task('watch:wiredep+cdn', function() {
    gulp.watch('bower.json', ['wiredep+cdn']);
})

/* ------------------------------------------------------- */

// Useref {useref} concat *.js/*.css -> vendor/main
gulp.task('useref', function() {
    var assets = useref.assets();

    return gulp.src('./build/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss({
            compatibility: 'ie8'
        })))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('./build'))
        .pipe(reload({stream: true}))
        .pipe(notify('Useref Done!'));
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
