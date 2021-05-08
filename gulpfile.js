const gulp = require('gulp')
	watch = require('gulp-watch')
	browserSync = require('browser-sync').create()
	babel = require('gulp-babel')
	concat = require('gulp-concat')
	rename = require('gulp-rename')
	uglify = require('gulp-uglify');

gulp.task('babel', function() {
	return gulp.src('src/*.jsx')
		.pipe(babel({
			presets: ['@babel/preset-react'],
			plugins: ['@babel/plugin-syntax-jsx']
		}))
		.pipe(gulp.dest('static/'))
});

var jsFiles = ['node_modules/react/umd/react.production.min.js', 'node_modules/react-dom/umd/react-dom.production.min.js' ];

gulp.task('scripts', function() {
	return gulp.src(jsFiles)
		.pipe(concat('bundles.js'))
		.pipe(gulp.dest('static/'));
});

exports.default = gulp.series('babel')

gulp.task('serve', function() {
	browserSync.init({
        server: {
            baseDir: "./static"
        }
    });
	gulp.watch(['*.html', '*.css', 'src/*'], exports.default); 
})