import {Fire} from '../fire';
import {Sprite} from '../sprite';
import {gameState} from '../state';
import {EnemyState} from '../enemy';
import {particleManager} from '../particles';
import {playBuildSound, playShoot} from '../sound';
import {sortDist, upgradeMarkers} from '../utils';
import {canvasCtx} from '../canvas';

const distDelta = [0, 0, 32, 32, 64, 80];
const rechargeDelta = [1, 2, 2, 3, 3, 5];

export class TowerA {
  constructor(def, x, y) {
    this.def = def;
    this.x = x;
    this.y = y;
    this.level = Math.round((this.y - 16 * 3) / (16 * 5));
    this.base = new Sprite(['ob-i0-c'], x, y);
    this.fire = new Fire(x - 1, y - 2);

    this.recharge = 0;

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
    this.upgradeLevel = Math.min(this.upgradeLevel + 1, this.maxUpgradeLevel);
    this.canUpgrade = this.maxUpgradeLevel > this.upgradeLevel;
  }

  update(dt) {
    this.recharge -= dt;

    const dist = 64 + distDelta[this.upgradeLevel - 1];

    const targets = gameState.enemies.filter((enemy) => {
      return enemy.state !== EnemyState.APPEAR
        && enemy.state !== EnemyState.BLEND
        && enemy.sprite.currentLevel === this.level
        && Math.abs(enemy.sprite.x + 8 - this.x + 8) < dist;
    });
    const [target] = targets.sort((a, b) => sortDist(this.x, a, b));
    if (this.recharge <= 0 && target) {
      this.recharge = 1 / rechargeDelta[this.upgradeLevel - 1];
      playShoot();
      particleManager.add(this.x + 7, this.y + 2, target, '#fff000', 2);
    }
  }

  render(dt) {
    this.update(dt);

    this.base.render(dt);
    this.fire.render(dt);

    for (let i = 0; i < this.upgradeLevel - 1; i++) {
      const sx = this.x + 8 + upgradeMarkers[i][0];
      const sy = this.y + upgradeMarkers[i][1];
      canvasCtx.fillStyle = '#f0f000';
      canvasCtx.fillRect(sx, sy - 1, 1, 3);
      canvasCtx.fillRect(sx - 1, sy, 3, 1);
    }
  }
}
