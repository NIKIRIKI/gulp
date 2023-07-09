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

function scripts() {
  return src(["app/js/*.js", "!app/js/main.min.js"])
    .pipe(cleanJS())
    .pipe(concat("main.min.js"))
    .pipe(dest("app/js/"))
    .pipe(browserSync.stream());
}

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

function cleanImagesApp() {
  return src("app/img/").pipe(clean()).pipe(dest("app/img"));
}

function cleanCssApp() {
  return src("app/css/").pipe(clean()).pipe(dest("app/css"));
}

function cleanJsApp() {
  return src("app/js/").pipe(clean()).pipe(dest("app/js"));
}

function cleanScssApp() {
  return src("app/scss/").pipe(clean()).pipe(dest("app/scss"));
}

function watching() {
  watch(["app/scss/style.scss"], styles);
  watch(["app/js/main.js"], scripts);
  watch(["app/img/**/*.*"], images);
  watch(["app/**/*.html"]).on("change", browserSync.reload);
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

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

function cleanPublic() {
  return src("public/").pipe(clean()).pipe(dest("public"));
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
