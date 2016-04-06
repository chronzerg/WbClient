var g = require('gulp'),
    $ = require('gulp-load-plugins')();


// Configuration
// =============

var js = {
    input: '_js',
    output: 'js'
};

var css = {
    input: '_css',
    output: 'css'
};

var require = {
    // Source folder
    baseUrl: js.input,

    // Entry point
    name: 'wishbanana',
    insertRequire: ['wishbanana'],

    // Include the RequireJS lib in our build so we don't have
    // to include it as a separate file.
    include: ['requireLib'],

    // External modules which aren't located in the source folder.
    paths: {
        requireLib: '../bower_components/requirejs/require',
        jquery:     '../bower_components/jquery/dist/jquery',
        imagesloaded: '../bower_components/imagesloaded/imagesloaded.pkgd'
    }
}

// JS Tasks
// ========

g.task('js', () => {
    return g.src(js.input + '/wishbanana.js')
        .pipe($.sourcemaps.init())
        .pipe($.requirejsOptimize(require))
        .pipe($.sourcemaps.write())
        .pipe(g.dest(js.output));
});


// CSS Tasks
// ==========

g.task('css', () => {
    var sass = $.sass().on('error', $.sass.logError);

    var autoprefixer = $.autoprefixer({
        browsers: ['last 2 versions', 'ie >= 9']
    });

    return g.src(css.input + '/wishbanana.scss')
        .pipe($.sourcemaps.init())
        .pipe(sass)
        .pipe(autoprefixer)
        .pipe($.sourcemaps.write())
        .pipe(g.dest(css.output));
});


// Clean Tasks
// ===========

g.task('clean-css', () => {
    return g.src(css.output).pipe($.clean());
});

g.task('clean-js', () => {
    return g.src(js.output).pipe($.clean());
})

g.task('clean', ['clean-css', 'clean-js']);


// Watch Tasks
// ===========

g.task('watch', ['default'], () => {
    g.watch(css.input + '/*.scss', ['css']);
    g.watch(js.input + '/*.js', ['js']);
});


// Default Task
// ============

g.task('default', ['css', 'js']);