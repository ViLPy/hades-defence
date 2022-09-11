import {appResourceLoader} from './resources';

export const canvas = document.getElementById('game');
export const width = canvas.width;
export const height = canvas.height;

/** @type {CanvasRenderingContext2D} */
export const canvasCtx = canvas.getContext('2d');
canvasCtx.imageSmoothingEnabled = false;

export function drawImage(name, x, y, flipX = false, flipY = false, alpha = 1) {
  const spr = appResourceLoader.getImage(name);
  if (!spr) {
    console.warn(name, 'not found');
    return;
  }
  if (flipX || flipY || alpha !== 1) {
    canvasCtx.save();
    canvasCtx.globalAlpha = alpha;
    canvasCtx.translate(x + spr.w / 2, y + spr.h / 2);
    canvasCtx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    canvasCtx.drawImage(spr.img, spr.x, spr.y, spr.w, spr.h, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
    canvasCtx.restore();
  } else {
    canvasCtx.drawImage(spr.img, spr.x, spr.y, spr.w, spr.h, x, y, spr.w, spr.h);
  }
}

export function drawText(text, x, y, size = 16, color = '#f0f0f0', isCentred = true, font = 'Papyrus') {
  canvasCtx.font = `${size}px ${font}, fantasy, sans-serif`;
  canvasCtx.textBaseline = 'middle';
  canvasCtx.textAlign = isCentred ? 'center' : 'left';
  canvasCtx.fillStyle = color;
  canvasCtx.fillText(text, x, y);
}
