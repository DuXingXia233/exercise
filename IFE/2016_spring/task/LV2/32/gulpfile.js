var gulp = require("gulp");

// 压缩 JS 文件必要模块
var minifyJS = require("gulp-uglify");
// 压缩 CSS 文件必要模块
var minifyCSS = require("gulp-minify-css");

// 合并文件 必要模块
var concat = require("gulp-concat");

// 重命名文件 必要模块
var rename = require("gulp-rename");


// 压缩 JS task  名： minigy
gulp.task("compressJS", function() {

	// 获取在 ./src/js目录下的所有js文件
	gulp.src(["./src/js/common.js", "./src/js/FormModel.js","./src/js/Validator.js", "./src/js/Factory.js", "./src/js/createForm.js", "./src/js/task.js"])
		// 合并文件到新文件 index.js
		.pipe(concat("index.js"))
		// 压缩
		.pipe(minifyJS())
		.pipe(rename({
			suffix: ".min"
		}))
		// 另存到 ./dist/js 目录下
		.pipe(gulp.dest("./dist/js"));

	
});
// 压缩 CSS task 名: compressCSS
gulp.task("compressCSS", function() {
	// 同理
	gulp.src("./src/css/*.css")
		.pipe(minifyCSS())
		.pipe(gulp.dest("./dist/css"));
});
// 监测文件变动 task 名: watchjs
gulp.task("watchjs", function() {
	// 检测 ./src/js 目录下所有js文件, 任意变动 触发 gulp中任务名为 compressJS task
	gulp.watch("./src/js/*.js", ["compressJS"]);

	// 同理
	gulp.watch("./src/css/*.css", ["compressCSS"]);
});

// 默认task  调用此任务自动执行 compressJS 和 watchjs task
gulp.task("default", ["compressCSS", "compressJS", "watchjs"]);