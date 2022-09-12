import {MapArea} from './utils';
import {Enemy} from './enemy';
import {TileGrade, Tiles} from './tiles';
import {GlobalConfig} from './config';
import {StateExt, LOCAL_STORAGE_KEY} from './state-ext';

/**
 * @enum {number}
 */
export const GameState = {
  MENU: 0,
  GAME: 10,
};

class State {
  constructor() {
    this.gameState = GameState.MENU;

    this.state = this.getEmptyState();
    this.maxTartarArea = this.getMapMaxLen(MapArea.TARTAR);
    this.maxAsphodelArea = this.getMapMaxLen(MapArea.ASPHODEL);
    this.maxElysiumArea = this.getMapMaxLen(MapArea.ELYSIUM);

    this.sound = true;

    /**
     * @type {Array<Enemy>}
     */
    this.enemies = [];

    this.mood = 0;
    this.value = 0;
    this.playerMaxHealth = 100;
    this.playerRechargeTime = 1;
    this.playerDamage = 2;
  }

  reset() {
    this.gameState = GameState.MENU;

    this.state = this.getEmptyState();
    this.maxTartarArea = this.getMapMaxLen(MapArea.TARTAR);
    this.maxAsphodelArea = this.getMapMaxLen(MapArea.ASPHODEL);
    this.maxElysiumArea = this.getMapMaxLen(MapArea.ELYSIUM);

    this.enemies = [];

    this.mood = 0;
    this.value = 0;
    this.playerMaxHealth = 100;
    this.playerRechargeTime = 1;
    this.playerDamage = 2;
  }

  getScore() {
    return 0;
  }

  getMapMaxLen(area) {
    const index = this.state.area[area].map[0].findIndex(entry => entry.split('|')[1] === 'x');
    if (index === -1) {
      return this.state.area[area].map[0].length;
    }
    return index;
  }

  recalc() {
    this.maxTartarArea = this.getMapMaxLen(MapArea.TARTAR);
    this.maxAsphodelArea = this.getMapMaxLen(MapArea.ASPHODEL);
    this.maxElysiumArea = this.getMapMaxLen(MapArea.ELYSIUM);
  }

  getEmptyState() {
    return new StateExt();
  }

  updateMoodAndValue() {
    let totalObjectValue = 0;
    let totalObjectMood = 0;
    [
      ...this.state.area[MapArea.ELYSIUM].objects,
      ...this.state.area[MapArea.ASPHODEL].objects,
      ...this.state.area[MapArea.TARTAR].objects
    ].forEach((obj) => {
      totalObjectValue += obj?.def?.value ?? 0;
      totalObjectMood += obj?.def?.mood ?? 0;
    });

    let totalTilesValue = 0;
    let totalTilesMood = 0;
    [
      ...this.state.area[MapArea.ELYSIUM].map,
      ...this.state.area[MapArea.ASPHODEL].map,
      ...this.state.area[MapArea.TARTAR].map
    ].flat().forEach(entry => {
      const [type, id, grade] = (entry ?? '').split('|');
      if (id === 'x' || type === '-') {
        return;
      }

      let tile = undefined;
      if (type === 'w') {
        tile = Tiles.WALLS[id];
      } else {
        tile = Tiles.FLOORS[id];
      }

      const mood = (grade === TileGrade.NORMAL) ? tile.mood : Math.max(tile.mood, 0.5);
      const value = (grade === TileGrade.NORMAL) ? tile.value : Math.max(tile.value, 0.5);
      const tileBaseValue = (GlobalConfig.TILE_GRADE_MULTIPLIER[grade] ?? 0) * (value ?? 0);
      totalTilesValue += tileBaseValue ?? 0;
      const tileBaseMood = (GlobalConfig.TILE_GRADE_MULTIPLIER[grade] ?? 0) * (mood ?? 0);
      totalTilesMood += tileBaseMood ?? 0;
    });

    this.value = totalObjectValue + totalTilesValue;
    this.mood = totalObjectMood + totalTilesMood;
    this.value -= Math.min(this.state.souls * GlobalConfig.SOUL_VALUE_DROP, 3000);
    this.mood -= Math.min(this.state.souls * GlobalConfig.SOUL_MOOD_DROP, 3000);

    if (this.mood < 0) {
      this.playerMaxHealth = 100 / (1 + (Math.abs(this.mood) / 100) * GlobalConfig.MOOD_HEALTH_MULTIPLIER);
      this.playerRechargeTime = 1 * (1 + (Math.abs(this.mood) / 100) * GlobalConfig.MOOD_RECHARGE_MULTIPLIER);
      this.playerDamage = 2 / (1 + (Math.abs(this.mood) / 100) * GlobalConfig.MOOD_DAMAGE_MULTIPLIER);
    } else {
      this.playerMaxHealth = 100 * (1 + (this.mood / 100) * GlobalConfig.MOOD_HEALTH_MULTIPLIER);
      this.playerRechargeTime = 1 / (1 + (this.mood / 100) * GlobalConfig.MOOD_RECHARGE_MULTIPLIER);
      this.playerDamage = 2 * (1 + (this.mood / 100) * GlobalConfig.MOOD_DAMAGE_MULTIPLIER);
    }
  }

  getExtendPrice(area) {
    const x = this.getMapMaxLen(area);
    return Math.floor(2 * Math.pow(1.2, x - 10));
  }

  extend(area) {
    const x = this.getMapMaxLen(area);
    for (let y = 0; y < 4; y++) {
      if (y === 3) {
        this.state.area[area].map[y][x] = 'f|0|n';
      } else {
        this.state.area[area].map[y][x] = 'w|0|n';
      }
    }
    this.recalc();
  }

  saveLocal() {
    this.state.saveLocal();
  }

  hasLocalStore() {
    return Boolean(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  }

  loadLocal() {
    this.state.loadLocal();
    this.updateMoodAndValue();
    this.recalc();
  }

  loadFromNearState(data) {
    this.state.restoreFromString(data['last_saved_map']);
    this.updateMoodAndValue();
    this.recalc();
  }

  saveNear() {
    return this.state.saveNear();
  }
}

export const gameState = new State();
