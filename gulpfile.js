/**
 * Created by FoxyGirl on 15.03.2017.
 */
"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var sourcemaps = require('gulp-sourcemaps');
var mqpacker = require("css-mqpacker");
var sortCSSmq = require('sort-css-media-queries');
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var uglify = require("gulp-uglify");
var gutil = require('gulp-util');
var run = require("run-sequence");
var del = require("del");
var concat = require("gulp-concat");
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'img/logo-favicon.svg',
        dest: 'img/favicons',
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#ffffff',
                margin: '21%'
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'whiteSilhouette',
                backgroundColor: '#ffd200',
                onConflict: 'override'
            },
            androidChrome: {
                pictureAspect: 'shadow',
                themeColor: '#ffffff',
                manifest: {
                    name: 'PHOTOBOOK',
                    display: 'browser',
                    orientation: 'notSet',
                    onConflict: 'override'
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            compression: 5,
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
    gulp.src([ '*.html' ])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('.'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});

gulp.task("style", function() {
    gulp.src("sass/style.scss")
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({browsers: [
                "last 1 version",
                "last 2 Chrome versions",
                "last 2 Firefox versions",
                "last 2 Opera versions",
                "last 2 Edge versions",
                "IE 10",
                "IE 11"
            ]}),
            mqpacker({
                sort: sortCSSmq
                // sort: sortCSSmq.desktopFirst
            })
        ]))
        .pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("scripts", function() {
    // return gulp.src(["!js/picturefill.min.js", "js/*.js"])
    return gulp.src(["js/load.js","js/*script.js"])
        .pipe(concat("scripts.min.js"))
        // .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest("build/js"));
});

gulp.task("images", function() {
    return gulp.src("build/img/**/*.{png,jpg,gif}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
    return gulp.src("img/icons/*.svg")
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("img"));
});

gulp.task('svg-clean', function () {
    return gulp.src('img/*' +
        '.svg')
        .pipe(svgmin({
            plugins: [{
                removeViewBox: false
            }, {
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            },
                {
                convertColors: {
                    names2hex: false,
                    rgb2hex: false
                }
            }, {
                removeDimensions: false
            }]
        }))
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest('img'));
});

gulp.task("copy", function() {
    return gulp.src([
        "fonts/*.*",
        "img/*.*",
        "js/picturefill.min.js",
        "*.html"
    ], {
        base: "."
    })
        .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
    return del("build");
});

gulp.task("copy:html", function() {
    return gulp.src([
        "*.html"
    ], {
        base: "."
    })
        .pipe(gulp.dest("build"));
});

gulp.task("copy:img", function() {
    // return gulp.src([
    //     "*.html"
    // ], {
    //     base: "."
    // })
    //     .pipe(gulp.dest("build"));
    return gulp.src("build/img/**/*.{png,jpg,gif}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("build", function(fn) {
    run(
        "clean",
        "copy",
        "style",
        "images",
        "scripts",
        fn
    );
});

gulp.task("watch:html", ["copy:html"], function(done) {
    server.reload(),
        done();
});

gulp.task("watch:img", ["copy:img"], function(done) {
    server.reload(),
        done();
});

gulp.task("watch:js", ["scripts"], function(done) {
    server.reload(),
        done();
});

gulp.task("serve", function() {
    server.init({
        server: "./build",
        notify: false,
        open: true,
        ui: false
    });

    gulp.watch("sass/**/*.*", ["style"]);
    gulp.watch("img/**/*.*", ["watch:img"]);
    gulp.watch("js/**/*.*", ["watch:js"]);
    gulp.watch("*.html", ["watch:html"]);
});

