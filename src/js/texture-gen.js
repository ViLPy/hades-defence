import {appResourceLoader} from './resources';

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  return [canvas, ctx];
}

/**
 * @param {string} name
 * @param {string} targetName
 * @param {string} fgColor
 * @param {string=} bgColor
 * @param {number=} alpha
 * @return {HTMLCanvasElement}
 */
export function colorPattern(name, targetName, fgColor, bgColor, alpha = 1) {
  const fg = fgColor.replaceAll(/[^\d,]/g, '').split(',').map(n => +n);
  const bg = bgColor ? bgColor.replaceAll(/[^\d,]/g, '').split(',').map(n => +n) : undefined;

  const sprite = appResourceLoader.getImage(name);
  const img = sprite.img;

  const [canvas, targetCtx] = createCanvas(sprite.w, sprite.h);
  if (bg) {
    const [r, g, b] = bg;
    targetCtx.fillStyle = `rgb(${r},${g},${b})`;
    targetCtx.fillRect(0, 0, sprite.w, sprite.h);
  }
  const targetDataObj = targetCtx.getImageData(0, 0, sprite.w, sprite.h);
  const targetData = targetDataObj.data;

  const [, originalCtx] = createCanvas(sprite.w, sprite.h);
  originalCtx.drawImage(img, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
  const originalData = originalCtx.getImageData(0, 0, sprite.w, sprite.h).data;

  for (let i = 0; i < originalData.length; i += 4) {
    if (bg) {
      const originalAlpha = originalData[i + 3] / 255;
      targetData[i] = originalAlpha * originalData[i] / 255 * fg[0] + (1 - originalAlpha) * targetData[i];
      targetData[i + 1] = originalAlpha * originalData[i] / 255 * fg[1] + (1 - originalAlpha) * targetData[i];
      targetData[i + 2] = originalAlpha * originalData[i] / 255 * fg[2] + (1 - originalAlpha) * targetData[i];
      targetData[i + 3] = 255 * alpha;
    } else {
      targetData[i] = originalData[i] / 255 * fg[0];
      targetData[i + 1] = originalData[i + 1] / 255 * fg[1];
      targetData[i + 2] = originalData[i + 2] / 255 * fg[2];
      targetData[i + 3] = originalData[i + 3] * alpha;
    }
  }
  targetCtx.putImageData(targetDataObj, 0, 0);
  appResourceLoader.addImage(targetName, canvas, 0, 0, sprite.w, sprite.h);

  return canvas;
}

export function rainbowSprite(name, targetName, alpha = 1) {
  const hsl = [[255, 0, 0], [255, 98, 0], [255, 191, 0], [221, 255, 0], [128, 255, 0], [30, 255, 0], [0, 255, 64], [0, 255, 162], [0, 255, 255], [0, 157, 255], [0, 64, 255], [34, 0, 255], [127, 0, 255], [225, 0, 255], [255, 0, 191], [255, 0, 93]];
  const sprite = appResourceLoader.getImage(name);
  const img = sprite.img;

  const [canvas, targetCtx] = createCanvas(sprite.w, sprite.h);
  const targetDataObj = targetCtx.getImageData(0, 0, sprite.w, sprite.h);
  const targetData = targetDataObj.data;

  const [, originalCtx] = createCanvas(sprite.w, sprite.h);
  originalCtx.drawImage(img, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
  const originalData = originalCtx.getImageData(0, 0, sprite.w, sprite.h).data;

  for (let i = 0; i < originalData.length; i += 4) {
    const x = Math.floor((i / 4) / sprite.h);
    targetData[i] = originalData[i] / 255 * hsl[x][0];
    targetData[i + 1] = originalData[i + 1] / 255 * hsl[x][1];
    targetData[i + 2] = originalData[i + 2] / 255 * hsl[x][2];
    targetData[i + 3] = originalData[i + 3] * alpha;
  }
  targetCtx.putImageData(targetDataObj, 0, 0);
  appResourceLoader.addImage(targetName, canvas, 0, 0, sprite.w, sprite.h);

  return canvas;
}

export function blendSprites(a, b, targetName, mode = 'destination-out') {
  const sprA = appResourceLoader.getImage(a);
  const sprB = appResourceLoader.getImage(b);

  const [result, ctx] = createCanvas(sprA.w, sprA.h);

  ctx.drawImage(sprA.img, sprA.x, sprA.y, sprA.w, sprA.h, 0, 0, sprA.w, sprA.h);
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.drawImage(sprB.img, sprB.x, sprB.y, sprB.w, sprB.h, 0, 0, sprB.w, sprB.h);
  ctx.restore();

  appResourceLoader.addImage(targetName, result, 0, 0, sprA.w, sprA.h);
}

export function flipSprite(name, hor, vert, rotate, targetName) {
  const spr = appResourceLoader.getImage(name);
  const w = spr.w;
  const h = spr.h;

  const [result, ctx] = createCanvas(spr.w, spr.h);
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rotate);
  ctx.scale((hor) ? -1 : 1, (vert) ? -1 : 1);

  ctx.drawImage(spr.img, spr.x, spr.y, spr.w, spr.h, -w / 2, -h / 2, spr.w, spr.h);

  appResourceLoader.addImage(targetName, result, 0, 0, spr.w, spr.h);
}

function drawPaintingBorder(ctx, w, h) {
  ctx.strokeStyle = 'rgb(100,67,58)';
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.stroke();
  ctx.strokeStyle = 'rgb(247,226,107)';
  ctx.beginPath();
  ctx.rect(1, 1, w - 2, h - 2);
  ctx.stroke();
}

async function fetchArcadian(id, targetName) {
  try {
    const url = 'https://api.arcadians.io/' + id;
    const req = await fetch(url);
    const data = await req.json();

    const w = 25;
    const h = 25;
    const [result, ctx] = createCanvas(w, h);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 140, 110, 100, 100, 0, 0, w, h);
      drawPaintingBorder(ctx, w, h);

      appResourceLoader.addImage(targetName, result, 0, 0, w, h);
    };
    img.src = data.image;
  } catch (err) {
    console.warn('Failed to fetch arcadian id', id, err);
  }
}

export function createArcadian(id) {
  const targetName = 'arcadian' + id;

  if (appResourceLoader.getImage(targetName)) {
    return;
  }

  const w = 25;
  const h = 25;
  const [result, ctx] = createCanvas(w, h);
  ctx.fillStyle = 'rgb(213,213,213)';
  ctx.fillRect(0, 0, w, h);
  drawPaintingBorder(ctx, w, h);
  ctx.font = '20px Papyrus, fantasy, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#303030';
  ctx.fillText('A', 12, 15);

  if (id !== -1) {
    fetchArcadian(id, targetName);
  }

  appResourceLoader.addImage(targetName, result, 0, 0, w, h);
}

export function createPainting(baseSpr, targetName) {
  const w = 25;
  const h = 25;
  const [result, ctx] = createCanvas(w, h);
  ctx.fillStyle = 'rgb(38,50,50)';
  ctx.fillRect(0, 0, w, h);
  drawPaintingBorder(ctx, w, h);

  const spr = appResourceLoader.getImage(baseSpr);
  ctx.drawImage(spr.img, spr.x, spr.y, spr.w, spr.h, 4, 4, spr.w, spr.h);

  appResourceLoader.addImage(targetName, result, 0, 0, w, h);
}
