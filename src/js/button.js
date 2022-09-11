import {canvasCtx, drawText} from './canvas';
import {drawBorder} from './bg';
import {mx, my, isPressed} from './input';
import {Sprite} from './sprite';
import {playClick} from './sound';

export class UITextButton {
  constructor(text, x, y, width, onClick) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.isPressedOver = false;
    this.onClick = onClick;
  }

  isMouseOver() {
    const x = this.x - 16 * this.width / 2;
    const y = this.y - 16;
    const w = this.width * 16;
    const h = 2 * 16;

    return (mx > x && mx < x + w && my > y && my < y + h);
  }

  render() {
    const isOver = this.isMouseOver();
    if (isOver) {
      if (isPressed && !this.isPressedOver) {
        playClick();
        this.isPressedOver = true;
      }
      if (!isPressed && this.isPressedOver) {
        this.isPressedOver = false;
        this.onClick();
      }
    } else {
      this.isPressedOver = false;
    }

    drawBorder(
      this.x - 16 * this.width / 2 - 8,
      this.y - 16 * 1.5,
      this.width, 2,
      (isOver) ? 'brd2-p-' : 'brd2-b-'
    );
    drawText(this.text, this.x, this.y, 17, '#f0f0f0');
  }
}

export class UISpriteButton {
  constructor(text, sprite, x, y, width, onClick) {
    this.text = text;
    this.spr = new Sprite([sprite], x - 8, y - 13);
    this.x = x;
    this.y = y;
    this.width = width;
    this.isPressedOver = false;
    this.onClick = onClick;
  }

  isMouseOver() {
    const x = this.x - 16 * this.width / 2;
    const y = this.y - 16;
    const w = this.width * 16;
    const h = 2 * 16;

    return (mx > x && mx < x + w && my > y && my < y + h);
  }

  render(isForceOver) {
    const isOver = this.isMouseOver();
    if (isOver) {
      if (isPressed && !this.isPressedOver) {
        playClick();
        this.isPressedOver = true;
      }
      if (!isPressed && this.isPressedOver) {
        this.isPressedOver = false;
        this.onClick();
      }
    } else {
      this.isPressedOver = false;
    }

    canvasCtx.strokeStyle = (isOver || isForceOver) ? '#f00000' : '#f0f0f0';
    canvasCtx.beginPath();
    canvasCtx.rect(this.x - 16 * this.width / 2, this.y - 16, this.width * 16, 2 * 16);
    canvasCtx.stroke();

    this.spr.render(0);
    drawText(this.text, this.x, this.y + 8, 10, '#f0f0f0', true, 'monospace');
  }
}
