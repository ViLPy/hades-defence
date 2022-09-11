import {drawImage} from './canvas';
import {shuffle} from './utils';

/**
 * @enum {number}
 */
export const AnimationMode = {
  CONT: 1,
  CONT_PING: 2,
  RANDOM: 3
};

export class Sprite {
  /**
   * @param {Array<string>} frames
   * @param {number} x
   * @param {number} y
   * @param {number} animSpeed
   * @param {AnimationMode} mode
   */
  constructor(frames, x, y, animSpeed = 1, mode = AnimationMode.CONT) {
    this.frames = frames;
    this.x = x;
    this.y = y;
    this.currentFrame = 0;

    this.isAnimated = true;

    this.frameIdx = [0];
    this.mode = mode;
    this.animSpeed = animSpeed;

    this.setAnimation();

    this.isFlipped = false;

    this.alpha = 1;
  }

  startAnimation() {
    this.isAnimated = true;
  }

  stopAnimation() {
    this.isAnimated = false;
    this.currentFrame = 0;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }

  setFlip(flip) {
    this.isFlipped = flip;
  }

  setAnimation() {
    switch (this.mode) {
    case AnimationMode.CONT: {
      this.frameIdx = this.frames.map((_, index) => index);
      break;
    }
    case AnimationMode.CONT_PING: {
      const indices = this.frames.map((_, index) => index);
      this.frameIdx = [...indices, [...indices].reverse()];
      break;
    }
    case AnimationMode.RANDOM: {
      const indices = this.frames.map((_, index) => index);
      shuffle(indices);
      this.frameIdx = indices;
      break;
    }
    }
  }

  update(dt) {
    if (this.frameIdx.length === 1) {
      return;
    }

    if (this.isAnimated) {
      this.currentFrame += this.animSpeed * dt;
      if (this.currentFrame >= this.frameIdx.length) {
        this.currentFrame = 0;
        if (this.mode === AnimationMode.RANDOM) {
          this.setAnimation();
        }
      }
    }
  }

  render(dt) {
    this.update(dt);
    if (this.alpha <= 0) {
      return;
    }
    const spr = this.frames[this.frameIdx[~~this.currentFrame]];
    drawImage(spr, ~~this.x, ~~this.y, this.isFlipped, undefined, this.alpha);
  }
}

export class SpriteGroup {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    /**
     * @type {number}
     */
    this.x = x;

    /**
     * @type {number}
     */
    this.y = y;

    /**
     * @type {Array<{spr: Sprite, x: number, y: number}>}
     */
    this.sprites = [];

    /**
     * @type {boolean}
     */
    this.isFlipped = false;
  }

  setFlip(flag) {
    this.isFlipped = flag;
    this.sprites.forEach((spr) => spr.spr.setFlip(flag));
  }

  addSprite(spr, x, y) {
    this.sprites.push({
      spr, x, y
    });
  }

  render(dt) {
    this.sprites.forEach((entry) => {
      if (this.isFlipped) {
        entry.spr.x = this.x - entry.x;
        entry.spr.y = this.y - entry.y;
        entry.spr.render(dt);
      } else {
        entry.spr.x = this.x + entry.x;
        entry.spr.y = this.y + entry.y;
        entry.spr.render(dt);
      }
    });
  }
}
