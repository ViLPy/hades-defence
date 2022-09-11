import {Sprite} from '../sprite';
import {canvasCtx} from '../canvas';
import {upgradeMarkers} from '../utils';
import {gameState} from '../state';
import {playBuildSound} from '../sound';

export class Barricade {
  constructor(def, x, y) {
    this.def = def;
    this.x = x;
    this.y = y;
    this.level = Math.round((this.y - 16 * 3) / (16 * 5));
    this.base = new Sprite(['ob-i1-c'], x, y);
    this.hp = 10;
    this.maxHp = this.hp;

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
    this.hp += 8;
    this.maxHp += 8;
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

    const healthPercentage = Math.max(0, this.hp / this.maxHp);
    if (healthPercentage < 1) {
      if (healthPercentage > 0.7) {
        canvasCtx.fillStyle = '#0f0';
      } else if (healthPercentage > 0.3) {
        canvasCtx.fillStyle = '#ff0';
      } else {
        canvasCtx.fillStyle = '#f00';
      }
      canvasCtx.fillRect(this.x + 3, this.y + 4, ~~(10 * healthPercentage), 1);
    }
  }
}
