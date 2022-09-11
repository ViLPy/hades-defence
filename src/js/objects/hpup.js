import {Sprite} from '../sprite';
import {gameSkeletons} from './skeletons';
import {gameState} from '../state';
import {upgradeMarkers} from '../utils';
import {canvasCtx} from '../canvas';
import {playBuildSound} from '../sound';

export class HPUp {
  constructor(def, x, y) {
    this.def = def;
    this.x = x;
    this.y = y;
    this.level = Math.round((this.y - 16 * 3) / (16 * 5));

    this.spr = new Sprite(['hpup-c'], x, y);

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

  update(dt) {
    gameSkeletons.skeletons.forEach((sk) => {
      if (sk.level === this.level && sk.hp > 0 && sk.hp < sk.maxHp && Math.abs(sk.spr.x - this.x) < 32) {
        sk.hp = Math.min(sk.maxHp, sk.hp + dt * 0.1 * this.upgradeLevel);
      }
    });

    if (gameState.state.playerPosition.y === this.level) {
      if (Math.abs(gameState.state.playerPosition.x - this.x) < 32) {
        gameState.state.playerHealth = Math.min(gameState.playerMaxHealth, gameState.state.playerHealth + dt * this.upgradeLevel / 2);
      }
    }
  }

  render(dt) {
    this.update(dt);
    this.spr.render(dt);

    for (let i = 0; i < this.upgradeLevel - 1; i++) {
      const sx = this.x + 8 + upgradeMarkers[i][0];
      const sy = this.y + upgradeMarkers[i][1];
      canvasCtx.fillStyle = '#f0f000';
      canvasCtx.fillRect(sx, sy - 1, 1, 3);
      canvasCtx.fillRect(sx - 1, sy, 3, 1);
    }
  }
}
