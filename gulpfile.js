var gulp = require('gulp'),
    sass = require('gulp-sass'), //编译sass
    nodemon = require('gulp-nodemon'), //启动express
    config = require('./config'), //配置文件
    path = require('path'), //路径工具
    rename = require('gulp-rename'), //更改文件名称
    uglify = require('gulp-uglify'), //压缩js
    cssnano = require('gulp-cssnano'), //压缩css
    autoprefixer = require('gulp-autoprefixer'), //浏览器版本自动处理浏览器前缀
    concat = require('gulp-concat'), //合并文件
    browserSync = require('browser-sync').create('Jc server'), //热部署工具
    imagemin = require('gulp-imagemin'), //图片压缩工具
    base64 = require('gulp-base64'), //图片转换base64
    gulpEjs = require('gulp-ejs'), //模版引擎
    runSequence = require('run-sequence'),//执行任务顺序插件
    del     = require('del');       //删除文件


var reload = browserSync.reload;
// path 定义
var BASEDIR = './'
var RESOURCES = './static/' + config.styles

var FLIEPATHS = {
    'css': path.join(RESOURCES, 'css/**/*.css'),
    'scss': path.join(RESOURCES, 'sass/**/*.scss'),
    'js': path.join(RESOURCES, 'js/**/*.js'),
    'images': path.join(RESOURCES, 'images/**/*'),
    'view': path.join(BASEDIR, 'views/**/*index.html')
};
// 编译 scss
gulp.task('scss', function() {
    return gulp.src(path.join(BASEDIR, FLIEPATHS.scss))
        .pipe(sass({
            /**
             * 嵌套输出方式 nested
             * 展开输出方式 expanded 
             * 紧凑输出方式 compact 
             * 压缩输出方式 compressed
             */
            outputStyle: config.globalConfig.env === 'production' ? 'compressed' : 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(path.join(RESOURCES, 'css')))
        .pipe(browserSync.reload({ stream: true }));
})
//express启动任务
gulp.task('dev:watch', function() {
    nodemon({
        script: BASEDIR + 'server.js',
        ignore: ['.vscode', '.idea', 'node_modules'],
        env: {
            'NODE_ENV': 'development'
        }
    });

    browserSync.init(null, {
        proxy: 'http://localhost:' + config.port,
        files: [FLIEPATHS.css, FLIEPATHS.view],
        notify: false,
        open: true,
        port: 5000
    })

    gulp.watch(FLIEPATHS.view).on("change", browserSync.reload);
});
//express启动任务
gulp.task('dev:server', function() {
    nodemon({
        script: BASEDIR + 'server.js',
        ignore: ['.vscode', '.idea', 'node_modules'],
        env: {
            'NODE_ENV': 'ie'
        }
    });
});
//清空已生成的html文件， 保留文件夹
gulp.task('clean', function(cb) {
    var paths = [];
    paths.push(path.join(RESOURCES, 'pages/**/*.html'));    
    paths.push(path.join(RESOURCES, 'error.html'));    
    paths.push(path.join(RESOURCES, 'index.html'));
    return del(paths, cb);
});
//清空已生成的html文件， 保留文件夹
gulp.task('cleancss', function(cb) {
    var paths = [];
    paths.push(path.join(RESOURCES, 'css/'));    
    return del(paths, cb);
});
//生成静态html文件
gulp.task('RESOURCESHtml', function() {
    var selfPath = [FLIEPATHS.view, "!RESOURCES/layout/**/*.html"];
    return gulp.src(selfPath)
        .pipe(gulpEjs({
            rootPath: config.rootPath,
            styles: config.styles,
            menuId: config.menuId,
            message: '错误输出信息位置'
        }))
        .pipe(gulp.dest(path.join(RESOURCES)));
});
//把sass文件夹下的图片移动到css文件夹下
gulp.task('move:img', function() {
    var jpg = path.join(BASEDIR, 'sass/**/*.jpg'),
        png = path.join(BASEDIR, 'sass/**/*.png'),
        svg = path.join(BASEDIR, 'sass/**/*.svg');
    return gulp.src([jpg,png,svg])
        .pipe(base64({
            extensions: ['svg', 'png', /\.jpg#datauri$/i],
            maxImageSize: 8 * 1024, // bytes 
        }))
        .pipe(gulp.dest(path.join(RESOURCES, 'css')));
});
//把小于8k的png图片转换成base64
gulp.task('imageBase64', function() {
    return gulp.src(FLIEPATHS.css)
        .pipe(base64({
            extensions: ['svg', 'png', /\.jpg#datauri$/i],
            maxImageSize: 8 * 1024, // bytes 
        }))
        .pipe(gulp.dest(path.join(RESOURCES, 'css')));
});
//压缩图片
gulp.task('imagemin', function() {
    return gulp.src(FLIEPATHS.image)
        .pipe(imagemin())
        .pipe(gulp.dest(path.join(RESOURCES, 'images')));
});

//压缩css
gulp.task('cssmin', function() {
    return gulp.src(path.join(RESOURCES, 'css/main.css'))
        .pipe(cssnano())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.join(RESOURCES, 'css')));
});
//压缩js
gulp.task('jsmin', function() {
    var selfPath = [FLIEPATHS.js, "!RESOURCES/js/**/*.min.js"];
    return gulp.src(selfPath)
        //排除混淆关键字
        .pipe(uglify({ mangle: { except: ['require', 'exports', 'module', '$'] } }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.join(RESOURCES, 'js')));
});

// 监听文件变动
gulp.task('watch:sass', function() {
    gulp.watch(FLIEPATHS.scss, ['scss' ,'move:img'])
})


//普通发布
gulp.task('build', (cd)=>{
    runSequence('clean', ['cleancss'] ,['scss'] ,['move:img'],[ 'imageBase64', 'RESOURCESHtml'], cd);
});
//启动开发环境服务
gulp.task('dev', (cd)=>{
    runSequence('clean',['dev:watch', 'watch:sass'] ,cd);
});
//启动开发环境服务
gulp.task('devie', (cd)=>{
    runSequence('clean',['dev:server', 'watch:sass'] ,cd);
});