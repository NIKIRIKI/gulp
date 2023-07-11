const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const cleanJS = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const webp = require("gulp-webp");
const clean = require("gulp-clean");

// Обработка стилей
function styles() {
  return src("app/scss/style.scss")
    .pipe(scss())
    .pipe(
      autoprefixer({
        cascade: false,
        overrideBrowserslist: ["last 80 versions"],
      })
    )
    .pipe(cleanCSS())
    .pipe(concat("style.min.css"))
    .pipe(dest("app/css/"))
    .pipe(browserSync.stream());
}

// Обработка скриптов
function scripts() {
  return src(["app/js/*.js", "!app/js/main.min.js"])
    .pipe(cleanJS())
    .pipe(concat("main.min.js"))
    .pipe(dest("app/js/"))
    .pipe(browserSync.stream());
}

// Обработка изображений
function images() {
  return src("app/img/**/*.*")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        })
      )
    )
    .pipe(webp())
    .pipe(dest("app/img/"));
}

// Очистка директории с изображениями в папке app
function cleanImagesApp() {
  return cleanDirectory("app/img/");
}

// Очистка директории с CSS-файлами в папке app
function cleanCssApp() {
  return cleanDirectory("app/css/");
}

// Очистка директории с JS-файлами в папке app
function cleanJsApp() {
  return cleanDirectory("app/js/");
}

// Очистка директории с SCSS-файлами в папке app
function cleanScssApp() {
  return cleanDirectory("app/scss/");
}

// Функция для очистки директории
function cleanDirectory(directory) {
  return src(directory).pipe(clean()).pipe(dest(directory));
}

// Отслеживание изменений в файлах
function watching() {
  watch(["app/scss/style.scss"], styles);
  watch(["app/js/main.js"], scripts);
  watch(["app/img/**/*.*"], images);
  watch(["app/**/*.html"]).on("change", browserSync.reload);
}

// Запуск локального сервера для разработки
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

// Сборка проекта для публикации
function building() {
  return src(
    [
      "app/css/style.min.css",
      "app/js/main.min.js",
      "app/**/*.html",
      "app/img/**/*.*",
    ],
    { base: "app" }
  ).pipe(dest("public"));
}

// Очистка директории public перед сборкой проекта
function cleanPublic() {
  return cleanDirectory("public/");
}

exports.styles = styles;
exports.images = images;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
exports.build = series(cleanPublic, building);
exports.cleanImages = cleanImagesApp;
exports.cleanPublic = cleanPublic;
exports.cleanApp = series(
  cleanImagesApp,
  cleanCssApp,
  cleanJsApp,
  cleanScssApp
);
exports.default = parallel(styles, scripts, browsersync, watching);
