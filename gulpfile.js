const gulp = require('gulp');
const fs = require('fs');
const child_process = require('child_process');
const compiler = require('google-closure-compiler').gulp();
const zip = require('gulp-zip');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const checkFilesize = require('gulp-check-filesize');
const {Packer} = require('roadroller');
const glob = require('glob');
const {createCanvas, loadImage} = require('canvas');
const {execSync} = require('child_process');

function init(cb) {
  if (!fs.existsSync('./tmp/gfx')) {
    fs.mkdirSync('./tmp/gfx');
  }
  cb();
}

function writeJS(data) {
  const js = `
/**
 * @type {Array<{w: number, x: number, h: number, y: number, n: string}>}
 */
export const spriteData = ${data};
  `;
  fs.writeFileSync('./src/generated/sprite-data.js', js);
}

async function packImages(cb) {
  const input = glob.sync('./gfx/**/*.png');
  const size = Math.ceil(Math.sqrt(input.length));
  const data = [];

  const images = input.map((path, index) => new Promise((res) => {
    loadImage(path).then((img) => {
      const name = path.replace('./gfx/', '').replaceAll('/', '-').replace('.png', '');
      const x = (index % size) * 17;
      const y = Math.floor(index / size) * 17;
      data.push({n: name, x, y});
      res({
        img, x, y
      });
    });
  }));

  const imgData = await Promise.all(images);
  const canvas = createCanvas(size * 17, size * 17);
  const ctx = canvas.getContext('2d');
  imgData.forEach((entry) => {
    ctx.drawImage(entry.img, entry.x, entry.y, 16, 16);
  });

  writeJS(JSON.stringify(data));
  const out = fs.createWriteStream('./tmp/hades.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => {
    execSync('cwebp ./tmp/hades.png -lossless -m 6 -q 100 -o ./docs/hades.webp');
    cb();
  });
}

function optimize() {
  return gulp.src(['./src/js/**/*.js', './src/generated/*.js'], {base: './'})
    .pipe(compiler({
      compilation_level: 'ADVANCED',
      //compilation_level: 'SIMPLE',
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT_NEXT',
      language_out: 'ECMASCRIPT_2020',
      js_output_file: 'main.js',
      rewrite_polyfills: 'false',
      module_resolution: 'NODE'
    }, {
      platform: ['native', 'javascript']
    }))
    .pipe(gulp.dest('tmp/'));
}

async function roadroll(cb) {
  if (!process.env.USE_RR) {
    const jsFile = fs.readFileSync('./tmp/main.js');
    fs.writeFileSync('./tmp/main.rr.js', jsFile);
    cb();
    return;
  }

  const jsFile = fs.readFileSync('./tmp/main.js');
  const inputs = [
    {
      data: jsFile.toString(),
      type: 'js',
      action: 'eval',
    },
  ];

  const options = {
    optimize: 2
  };
  const packer = new Packer(inputs, options);
  await packer.optimize();
  const {firstLine, secondLine} = packer.makeDecoder();
  fs.writeFileSync('./tmp/main.rr.js', firstLine + secondLine);

  cb();
}

function compileCSS() {
  return gulp.src('src/main.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('tmp/'));
}

function ship() {
  return gulp.src(['src/index.html'])
    .pipe(replace('<style/>', `<style>${fs.readFileSync('./tmp/main.css')}</style>`))
    .pipe(replace('<script/>', `<script>${fs.readFileSync('./tmp/main.rr.js')}</script>`))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('docs'));
}

function zipDocs() {
  return gulp.src('docs/**/*.*')
    .pipe(zip('submission.zip'))
    .pipe(gulp.dest('./'));
}

function advzip(cb) {
  child_process.exec('advzip -4 -z submission.zip', (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    cb();
  });
}

function checkZip() {
  return gulp.src('submission.zip')
    .pipe(checkFilesize({
      fileSizeLimit: 13312 // 13312 === 13kb
    }));
}

const baseFullBuild = gulp.series(
  init,
  packImages,
  gulp.parallel(compileCSS, optimize),
  roadroll,
  ship
);

function watch() {
  gulp.watch('src/js/**/*.js', {ignoreInitial: true}, baseFullBuild);
  gulp.watch('src/**/*.css', {ignoreInitial: true}, baseFullBuild);
  gulp.watch('src/**/*.html', {ignoreInitial: true}, baseFullBuild);
}

exports.watch = gulp.series(baseFullBuild, watch);

exports.default = gulp.series(
  baseFullBuild,
  zipDocs,
  advzip,
  checkZip
);
