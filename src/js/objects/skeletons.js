import {Sprite} from '../sprite';
import {Walker} from '../walker';
import {canvasCtx} from '../canvas';
import {Enemy} from '../enemy';
import {upgradeMarkers} from '../utils';
import {GlobalConfig} from '../config';
import {gameState} from '../state';
import {playBuildSound} from '../sound';

export class Skeleton {
  constructor(x, level) {
    this.startX = x;
    this.dx = this.startX + Math.random() * 32 - 16;
    this.level = level;
    this.hp = 10;
    this.maxHp = 10;
    this.spr = new Walker(['sk-i1', 'sk-i2', 'sk-i0'], x, this.level, 32);
    this.spr.walkTo(this.dx);
    this.recharge = 0;
    /**
     * @type {(Enemy|undefined)}
     */
    this.enemy = undefined;
  }

  update(dt) {
    if (this.enemy && (this.enemy.health <= 0 || this.enemy.sprite.currentLevel !== this.level)) {
      this.enemy = undefined;
    }

    this.recharge -= dt;
    if (this.enemy) {
      const isNear = Math.abs(this.spr.x - this.enemy.sprite.x) < 6;
      const canAttack = this.recharge <= 0;
      if (isNear && canAttack) {
        this.enemy.health -= GlobalConfig.SKELETON_DAMAGE;
        this.recharge = GlobalConfig.SKELETON_RECHARGE_TIME;
      }
      if (isNear) {
        this.spr.stop();
      } else {
        this.spr.walkTo(this.enemy.sprite.x);
      }
    } else {
      this.spr.walkTo(this.dx);
    }
  }

  render(dt) {
    this.update(dt);
    this.spr.render(dt);
    const healthPercentage = Math.max(0, this.hp / this.maxHp);
    if (healthPercentage < 1) {
      if (healthPercentage > 0.7) {
        canvasCtx.fillStyle = '#0f0';
      } else if (healthPercentage > 0.3) {
        canvasCtx.fillStyle = '#ff0';
      } else {
        canvasCtx.fillStyle = '#f00';
      }
      canvasCtx.fillRect(this.spr.sprite.x + 3, this.spr.sprite.y, ~~(10 * healthPercentage), 1);
    }
  }
}

export class SkeletonManager {
  constructor() {
    /** @type {Array<Skeleton>} */
    this.skeletons = [];
  }

  add(x, level) {
    const newSkeleton = new Skeleton(x, level);
    this.skeletons.push(newSkeleton);
    return newSkeleton;
  }

  cleanup() {
    this.skeletons = this.skeletons.filter((s) => s.hp > 0);
  }
}

export const gameSkeletons = new SkeletonManager();

export class Skeletons {
  constructor(def, x, y, isPreview) {
    this.def = def;
    this.isPreview = isPreview;
    this.x = x;
    this.y = y;
    this.level = Math.round((this.y - 16 * 3) / (16 * 5));

    this.hp = [];

    this.base = new Sprite(['ob-i2'], x, y);
    /**
     * @type {Array<Skeleton>}
     */
    this.skeletons = [];
    this.skeletonRecharges = [];

    this.upgradeLevel = 1;
    this.maxUpgradeLevel = 6;

    this.canUpgrade = true;
  }

  getUpgradeCost() {
    const baseUpgradeCost = (this.def.upgradeCost ?? 30) / 100;
    return Number((this.def.cost * Math.pow(1 + baseUpgradeCost, this.upgradeLevel)).toFixed(1));
  }

  upgrade(isLoad = false) {
    const upgradeCost = this.getUpgradeCost();
    if (gameState.state.money < upgradeCost && !isLoad) {
      return;
    }
    if (!isLoad) {
      gameState.state.money -= upgradeCost;
      playBuildSound();
      gameState.updateMoodAndValue();
    }
    this.upgradeLevel++;
    this.canUpgrade = this.maxUpgradeLevel > this.upgradeLevel;
  }

  render(dt) {
    this.base.render(dt);
    for (let i = 0; i < this.upgradeLevel - 1; i++) {
      const sx = this.x + 8 + upgradeMarkers[i][0];
      const sy = this.y + upgradeMarkers[i][1];
      canvasCtx.fillStyle = '#f0f000';
      canvasCtx.fillRect(sx, sy - 1, 1, 3);
      canvasCtx.fillRect(sx - 1, sy, 3, 1);
    }

    if (this.isPreview) {
      return;
    }

    this.skeletons.forEach(sk => {
      sk.render(dt);
    });
    const init = this.skeletons.length;
    this.skeletons = this.skeletons.filter((sk) => sk.hp > 0);
    const newLength = this.skeletons.length;
    for (let i = 0; i < init - newLength; i++) {
      this.skeletonRecharges.push(50);
    }

    const maxSkeletons = this.upgradeLevel;
    const canAddSkeletons = Math.max(0, maxSkeletons - this.skeletons.length - this.skeletonRecharges.length);
    for (let i = 0; i < canAddSkeletons; i++) {
      const sk = gameSkeletons.add(this.x, this.level);
      this.skeletons.push(sk);
    }

    for (let i = 0; i < this.skeletonRecharges.length; i++) {
      this.skeletonRecharges[i] -= dt;
    }
    this.skeletonRecharges = this.skeletonRecharges.filter((r) => r >= 0);
  }
}
