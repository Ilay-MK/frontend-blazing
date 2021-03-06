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
    uncss           = require('gulp-uncss'),
    useref          = require('gulp-useref'),
    watch           = require('gulp-watch'),
    wiredep         = require('wiredep').stream
;

/* ------------------- */

var path = {
    build: {
        html: './build/',
        searchHTML: './build/**/*.html',
        js: './build/js/',
        css: './build/css/',
        searchCSS: './build/css/**/*.css',
        img: './build/img/',
        fonts: './build/fonts/'
    },
    src: {
        html: './src/*.html',
        htmlBase: './src/template/base/*.html',
        htmlToBase: './src/template/base/',
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
    clean: './build/',
    dirBuild: './build/',
    dist: './build/**/*',
    maps: './maps/',
    bowerComponents: './bower_components',
    bowerConfig: './bower.json'
};

/* ------------------- */

var crossBrousersCompatibility = {
    brousers: [
        'last 20 versions',
        '> 0%',
        'ie 6',
        'ie 7',
        'ie 8',
        'ie 9',
        'Firefox ESR',
        'Opera 12.1'
    ],
    cascade: false
};

/* ------------------- */

var config = {
    server: {
        baseDir: path.dirBuild
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

gulp.task('default', ['build', 'webserver', 'watch:build']);
gulp.task('wiredep+cdn+watch', ['wiredep+cdn', 'watch:wiredep+cdn']);

/* ------------------------------------------- */

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean:build', function (cb) {
    rimraf(path.clean, cb);
});

/* ------------------------------------------- */

gulp.task('build:html', function () {
    var opts = {
        empty: false, // do not remove empty attributes
        cdata: true, // do not strip CDATA from scripts
        comments: false, // do not remove comments
        conditionals: true, // do not remove conditional internet explorer comments
        spare: true, // do not remove redundant attributes
        quotes: false, // do not remove arbitrary quotes
        loose: false // preserve one whitespace
    };

    gulp.src(path.src.html)
        .pipe(sourcemaps.init())
        .pipe(rigger())
        /*.pipe(minifyHTML(opts))*/
        .pipe(sourcemaps.write(path.maps))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}))
        .pipe(notify('build:html Done!'));
});

gulp.task('build:js', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write(path.maps))
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
            browsers: crossBrousersCompatibility.brousers,
            cascade: crossBrousersCompatibility.cascade
        }))
        .pipe(minifyCss())
        .pipe(sourcemaps.write(path.maps))
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
    gulp.src(path.src.htmlBase)
        .pipe(wiredep({
            directory: path.bowerComponents
        }))
        .pipe(gulp.dest(path.src.htmlToBase))
        .pipe(reload({stream: true}))
        .pipe(notify('Wiredep Done!'));
});

// Watch Wiredep
gulp.task('watch:wiredep', function() {
    gulp.watch(path.bowerConfig, ['wiredep']);
})

// Google CDN
gulp.task('cdn', function() {
    return gulp.src(path.src.htmlBase)
        .pipe(googlecdn(require(path.bowerConfig)))
        .pipe(gulp.dest(path.src.htmlToBase))
        .pipe(reload({stream: true}))
        .pipe(notify('GoogleCDN Done!'));
});

// Watch Google CDN
gulp.task('watch:cdn', function() {
    gulp.watch(path.bowerConfig, ['cdn']);
})

/* ---------------------- */

// Google CDN
gulp.task('wiredep+cdn', function() {
    return gulp.src(path.src.htmlBase)
        // Wiredep
        .pipe(wiredep({
            directory: path.bowerComponents
        }))
        .pipe(gulp.dest(path.src.htmlToBase))
        .pipe(reload({stream: true}))
        .pipe(notify('Wiredep Done!'))
        // CDN
        .pipe(googlecdn(require(path.bowerConfig)))
        .pipe(gulp.dest(path.src.htmlToBase))
        .pipe(reload({stream: true}))
        .pipe(notify('GoogleCDN Done!'));
});

// Watch:wiredep+cdn
gulp.task('watch:wiredep+cdn', function() {
    gulp.watch(path.bowerConfig, ['wiredep+cdn']);
})

/* ------------------------------------------------------- */

// Useref {useref} concat *.js/*.css -> vendor/main
gulp.task('useref', function() {
    var assets = useref.assets();

    return gulp.src(path.build.searchHTML)
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss({
            compatibility: 'ie8'
        })))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(path.dirBuild))
        .pipe(reload({stream: true}))
        .pipe(notify('Useref Done!'));
});


/* ------------------------------------------------------- */

// Uncss
gulp.task('uncss', function () {
    return gulp.src(path.build.searchCSS)
        .pipe(uncss({
            html: [path.build.searchHTML]
        }))
        .pipe(minifyCss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(notify('UnCSS Done!'));
});

/* ------------------------------------------------------- */

// SFTP
gulp.task('sftp', ['build'], function() {
    return gulp.src(path.dist)
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
