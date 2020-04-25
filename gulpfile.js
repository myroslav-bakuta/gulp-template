const {
    task,
    series,
    parallel,
    src,
    dest,
    watch
} = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const terser = require('gulp-terser');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const PATH = {
    scssFile: './assets/scss/style.scss',
    scssFiles: './assets/scss/**/*.scss',
    scssFolder: './assets/scss',
    cssFolder: './assets/css',
    htmlFiles: './*.html',
    jsFiles: ['./assets/js/**/*.js', '!./assets/js/**/*.min.js', '!./assets/js/**/all.js'],
    jsFolder: './assets/js',
    jsDestFolder: './assets/js/all',
    jsAllInOne: 'all.js'
}

const PLUGINS = [autoprefixer({
        overrideBrowserslist: ['last 5 versions', '> 1%'],
        cascade: true
    }),
    mqpacker({
        sort: sortCSSmq
    })
];

function comb() {
    return src(PATH.scssFiles)
        .pipe(csscomb('./.csscomb.json')).on('error', notify.onError((error) => `File: ${error.message}`))
        .pipe(dest(PATH.scssFolder))
        .pipe(notify({
            message: ' ------------ SCSS Combined!',
            sound: false
        }))
}

async function sync() {
    browserSync.reload();
}

function scss() {
    return src(PATH.scssFile)
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(postcss(PLUGINS))
        .pipe(dest(PATH.cssFolder))
        .pipe(notify({
            message: ' ------------ SCSS Compiled!',
            sound: false
        }))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function scssDev() {
    return src(PATH.scssFile, {
            sourcemaps: true
        })
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(postcss(PLUGINS))
        .pipe(dest(PATH.cssFolder, {
            sourcemaps: '.'
        }))
        .pipe(notify({
            message: ' ------------ SCSS with Sourcemaps Compiled!',
            sound: false
        }))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function scssMin() {
    const pluginsExtended = PLUGINS.concat([cssnano({
        preset: 'default'
    })]);

    return src(PATH.scssFile)
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(postcss(pluginsExtended))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(PATH.cssFolder))
        .pipe(notify({
            message: ' ------------ SCSS.min Compiled!',
            sound: false
        }))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function concatJS() {
    return src(PATH.jsFiles)
        .pipe(concat(PATH.jsAllInOne))
        .pipe(dest(PATH.jsFolder))
}

function uglifyJS() {
    return src(PATH.jsFiles)
        .pipe(uglify({
            toplevel: true,
            output: {
                quote_style: 3
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(PATH.jsFolder))
}

function uglifyJSES6() {
    return src(PATH.jsFiles)
        .pipe(terser())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(PATH.jsFolder))
}

function concatMinJSES6() {
    return src(PATH.jsFiles)
        .pipe(concat(PATH.jsAllInOne))
        .pipe(dest(PATH.jsDestFolder))
        .pipe(terser())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(PATH.jsDestFolder))
}

function syncInit() {
    browserSync({
        server: {
            baseDir: './'
        },
        notify: false
    });
}

function watchFiles() {
    syncInit();
    watch(PATH.scssFiles, series(scss, scssMin));
    watch(PATH.htmlFiles, sync);
    watch(PATH.jsFiles, sync);
}

// task('min', scssMin);
// task('scss', scss);
task('comb', comb);
// task('concat', concatJS);
// task('uglify', uglifyJS);
// task('es6', uglifyJSES6);
task('dev', series(scss, scssDev));
task('concatMinJSES6', concatMinJSES6);

task('css', series(scss, scssMin));
task('watch', watchFiles);