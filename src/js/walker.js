import {Sprite} from './sprite';

/**
 * @enum {number}
 */
export const PlayerTransferState = {
  DEFAULT: 0,
  IN: 2,
  OUT: 1,
};

export class Walker {
  constructor(spriteBase, x, level, speed = 24) {
    this.currentLevel = level;
    this.x = x;
    this.y = this.currentLevel * (16 * 5) + 16 * 3;
    this.target = x;
    this.speed = speed;
    this.sprite = new Sprite(spriteBase, this.x, this.y, 10);
    this.sprite.stopAnimation();
    this.canMove = true;
    this.isWalking = false;
    this.targetLevel = level;

    this.currentLevelDelta = 0;
    this.playerTransferState = PlayerTransferState.DEFAULT;
  }

  stop() {
    this.target = this.x;
    this.targetLevel = this.currentLevel;
    this.sprite.stopAnimation();
    this.isWalking = false;
  }

  /**
   * @param {number} dx
   * @param {number=} level
   */
  walkTo(dx, level) {
    if (this.playerTransferState !== PlayerTransferState.DEFAULT) {
      this.canMove = false;
      this.stop();
      return;
    }

    this.canMove = true;
    this.target = dx;
    this.targetLevel = level;
    if (!this.isWalking) {
      this.isWalking = true;
      this.sprite.startAnimation();
    }
  }

  gate(dy) {
    const isNearGate = Math.abs(this.x - 16 * 5) < 8;
    const canTransfer = this.playerTransferState === PlayerTransferState.DEFAULT && isNearGate;

    if (dy < 0 && canTransfer && this.currentLevel < 2) {
      this.currentLevelDelta = 1;
      this.playerTransferState = PlayerTransferState.OUT;
    }
    if (dy > 0 && canTransfer && this.currentLevel > 0) {
      this.currentLevelDelta = -1;
      this.playerTransferState = PlayerTransferState.OUT;
    }
  }

  render(dt) {
    if (this.playerTransferState === PlayerTransferState.OUT && this.sprite.alpha > 0) {
      this.sprite.alpha -= dt * 3;
    } else if (this.playerTransferState === PlayerTransferState.OUT && this.sprite.alpha <= 0) {
      this.sprite.alpha = 0;
      this.currentLevel += this.currentLevelDelta;
      this.playerTransferState = PlayerTransferState.IN;
    }

    if (this.playerTransferState === PlayerTransferState.IN && this.sprite.alpha < 1) {
      this.sprite.alpha += dt * 3;
    } else if (this.playerTransferState === PlayerTransferState.IN && this.sprite.alpha >= 1) {
      this.sprite.alpha = 1;
      this.playerTransferState = PlayerTransferState.DEFAULT;
    }

    let xTarget = this.target;
    if (this.targetLevel !== undefined && this.currentLevel !== this.targetLevel) {
      xTarget = 16 * 5;
      this.gate(Math.sign(this.currentLevel - this.targetLevel));
    }


    if (this.x !== this.target) {
      this.sprite.setFlip(this.x > xTarget);
    }

    if (this.canMove && this.x > xTarget) {
      this.x -= dt * this.speed;
    }
    if (this.canMove && this.x < xTarget) {
      this.x += dt * this.speed;
    }
    this.y = this.currentLevel * (16 * 5) + 16 * 3;
    this.sprite.x = this.x;
    this.sprite.y = this.y + 1;

    if (Math.abs(this.x - this.target) < 2) {
      this.stop();
    }

    this.sprite.render(dt);
  }
}
