// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'),
    replace = require('gulp-replace'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace');

// Config
var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/app/require.config.js') + '; require;');
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'app/startup',
        paths: {
            requireLib: 'bower_modules/requirejs/require'
        },
        include: [
            'requireLib',
            'components/nav-bar/nav-bar',
            'components/home-page/home',
            'components/loading/loading',
            'components/selection/selection',
            'components/filter/filter',
            'components/chart/chart',
            'components/tableview/tableview',
            'components/ukmap/ukmap',
            'components/display-options/display-options',
            'components/sharing/sharing',
            'components/chart-description/chart-description'
        ],
        insertRequire: ['app/startup'],
        bundles: {
            'about': ['text!components/about-page/about.html'],
            'blog': ['components/blog-page/blog']
        }
    });

// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task('js', function () {
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./dist/'));
});

// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', function () {
    var bowerCss = gulp.src('src/bower_modules/bootstrap/dist/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        fontAwesomeCss = gulp.src('src/bower_modules/components-font-awesome/css/font-awesome.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        jqueryuiCss = gulp.src('src/bower_modules/jquery-ui/themes/base/jquery-ui.css'),
        datatablesCss = gulp.src('src/bower_modules/DataTables/media/css/jquery.dataTables.css'),
        appCss = gulp.src('src/css/*.css'),
        combinedCss = es.concat(bowerCss, fontAwesomeCss, jqueryuiCss, datatablesCss, appCss).pipe(concat('css.css')),
        bootstrapFontFiles = gulp.src('./src/bower_modules/bootstrap/dist/fonts/*', { base: './src/bower_modules/bootstrap/dist' }),
        fontAwesomeFontFiles = gulp.src('./src/bower_modules/components-font-awesome/fonts/*', { base: './src/bower_modules/components-font-awesome/' });
    return es.concat(bootstrapFontFiles, fontAwesomeFontFiles, combinedCss)
        .pipe(gulp.dest('./dist/'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('csv', function() {
    gulp.src('./src/data-out/final_data.csv')
        .pipe(gulp.dest('./dist/data-out/'));
    return gulp.src('./src/data-src/meta_file.csv')
        .pipe(gulp.dest('./dist/data-src/'))
});

gulp.task('img', function() {
    return gulp.src('./src/img/*')
        .pipe(gulp.dest('./dist/img/'));
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('default', ['html', 'js', 'css', 'csv', 'img'], function(callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});
