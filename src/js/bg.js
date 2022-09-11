import {drawImage, width, height, canvasCtx} from './canvas';

export function renderBg() {
  canvasCtx.fillStyle = 'rgb(56,56,56)';
  canvasCtx.fillRect(0, 0, width, height);

  drawBorder(0, 0, 32, 19, 'brd1-b-');
}

export function drawBorder(x, y, w, h, prefix) {
  drawImage(prefix + 'i0', x, y);
  for (let i = 0; i < (w - 1); i++) {
    drawImage(prefix + 'i1', x + (i + 1) * 16, y);
  }
  drawImage(prefix + 'i2', x + 16 * w, y);

  for (let i = 0; i < (h - 1); i++) {
    drawImage(prefix + 'i3', x, y + (i + 1) * 16);
    drawImage(prefix + 'i5', x + 16 * w, y + (i + 1) * 16);
  }

  drawImage(prefix + 'i6', x, y + 16 * h);
  for (let i = 0; i < (w - 1); i++) {
    drawImage(prefix + 'i7', x + (i + 1) * 16, y + 16 * h);
  }
  drawImage(prefix + 'i8', x + 16 * w, y + 16 * h);
}
