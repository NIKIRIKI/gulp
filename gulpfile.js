const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const cleanJS = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const webp = require("gulp-webp");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
const makeDir = require("make-dir");
const fs = require("fs");
const svgSprite = require("gulp-svg-sprite");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
const include = require("gulp-include");
const babel = require("gulp-babel");
const avifWebpHTML = require("gulp-avif-webp-html");
const gutil = require("gulp-util");

function html() {
  return src("app/*.html")
    .pipe(newer("app/"))
    .pipe(avifWebpHTML())
    .pipe(dest("app/"));
}

function pages() {
  return src("app/pages/*.html")
    .pipe(
      include({
        includePaths: "app/components",
      })
    )
    .pipe(dest("app"))
    .pipe(browserSync.stream());
}

// Создание начальной структуры проекта
function start() {
  (async () => {
    const paths = await Promise.all([
      makeDir("app"),
      makeDir("app/components"),
      makeDir("app/css"),
      makeDir("app/img"),
      makeDir("app/img/src"),
      makeDir("app/js"),
      makeDir("app/scss"),
      makeDir("app/scss/base"),
      makeDir("app/scss/blocks"),
      makeDir("app/pages"),
      makeDir("app/fonts"),
      makeDir("app/fonts/src"),
      makeDir("public"),
    ]);
  })();
  fs.writeFile("app/pages/index.html", "", (err) => {
    if (err) throw err;
  });
  fs.writeFile("app/js/main.js", "", (err) => {
    if (err) throw err;
  });
  fs.writeFile("app/scss/style.scss", "", (err) => {
    if (err) throw err;
  });
  fs.writeFile("app/scss/base/reset.scss", "", (err) => {
    if (err) throw err;
  });
  fs.writeFile("app/scss/base/vars.scss", "", (err) => {
    if (err) throw err;
  });
  fs.writeFile("app/scss/base/base.scss", "", (err) => {
    if (err) throw err;
  });
}

// Обработка спрайтов
function sprite() {
  return src("app/img/src/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest("app/img/"));
}

// Обработка шрифтов
function fonts() {
  return src("app/fonts/src/**/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("app/fonts/dist/**/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts/"));
}

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
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(cleanJS())
    .pipe(concat("main.min.js"))
    .pipe(dest("app/js/"))
    .pipe(browserSync.stream());
}

// Обработка изображений
function images() {
  return src(["app/img/src/**/*.*", "!app/img/src/**/*.svg"])
    .pipe(newer("app/img/"))
    .pipe(avif({ quality: 50 }))
    .pipe(src(["app/img/src/**/*.*", "!app/img/src/**/*.svg"]))
    .pipe(newer("app/img/"))
    .pipe(webp())
    .pipe(src(["app/img/src/**/*.*", "!app/img/src/**/*.svg"]))
    .pipe(newer("app/img/"))
    .pipe(imagemin())
    .pipe(dest("app/img/"));
}

// Конвертация изображения в формат webp
function convertWebp() {
  return src(["app/img/src/**/*.*", "!app/img/src/**/*.svg"])
    .pipe(webp())
    .pipe(dest("app/img/dist/"));
}

// Конвертация изображения в формат avif
function convertAvif() {
  return src(["app/img/src/**/*.*", "!app/img/src/**/*.svg"])
    .pipe(avif({ quality: 50 }))
    .pipe(dest("app/img/dist/"));
}

// Очистка директории с изображениями в папке app
function cleanImages() {
  return cleanDirectory("app/img/dist/");
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
// Очистка директории public перед сборкой проекта
function cleanPublic() {
  return cleanDirectory("public/");
}

// Запуск локального сервера для разработки
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

// Отслеживание изменений в файлах
function watching() {
  watch(
    [
      "app/scss/style.scss",
      "app/scss/base/**/*.scss",
      "app/scss/blocks/**/*.scss",
    ],
    styles
  );
  watch(["app/js/main.js"], scripts);
  watch(["app/components/*", "app/pages/*"], pages);
  watch(["app/img/src"], images);
  watch(["app/fonts/src"], fonts);
  watch(["app/**/*.html", "app/pages/**/*.html"], html).on(
    "change",
    browserSync.reload
  );
}

// Сборка проекта для публикации
function building() {
  return src(
    [
      "app/css/style.min.css",
      "app/js/main.min.js",
      "app/**/*.html",
      "!app/pages/**/*.*",
      "app/fonts/**/*.*",
      "!app/fonts/src/**/*.*",
      "app/img/*",
      "app/fonts/dist/**/*.*",
      "app/img/dist/**/*.svg",
      "app/img/dist/**/sprite.svg",
    ],
    { base: "app" }
  ).pipe(dest("public"));
}

// Экспорт функций
exports.styles = styles;
exports.images = images;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
exports.build = series(cleanPublic, building);
exports.cleanImages = cleanImages;
exports.cleanPublic = cleanPublic;
exports.cleanApp = series(cleanImages, cleanCssApp, cleanJsApp, cleanScssApp);
exports.cleanDirectory = cleanDirectory;
exports.convertWebp = convertWebp;
exports.convertAvif = convertAvif;
exports.default = parallel(styles, scripts, browsersync, pages, watching);
exports.start = start;
exports.sprite = sprite;
exports.fonts = fonts;
exports.pages = pages;
exports.html = html;
