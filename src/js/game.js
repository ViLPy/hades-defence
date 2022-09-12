import {drawBorder} from './bg';
import {canvasCtx, drawImage, drawText, width, height} from './canvas';
import {Sprite} from './sprite';
import {Director} from './director';
import {Walker} from './walker';
import {mx, my, pressedKeys, setClickHandler} from './input';
import {renderMap} from './map';
import {GameState, gameState} from './state';
import {UISpriteButton, UITextButton} from './button';
import {getMapDY, MapArea, sortDist} from './utils';
import {createObject, Objects, TileGrade, Tiles} from './tiles';
import {particleManager} from './particles';
import {gameSkeletons, Skeletons} from './objects/skeletons';
import {EnemyState} from './enemy';
import {Barricade} from './objects/barricade';
import {isSoundOn, playBuildSound, playClick, playGameOver, playShoot, toggleSound} from './sound';
import {isLoggedInWithNear, isPremiumNear} from './near';
import {GlobalConfig} from './config';

/**
 * @enum {number}
 */
export const GameMode = {
  DEFAULT: 0,
  PAINT: 10,
  PAINT_SELECT: 11,
  BUILD: 20,
  BUILD_SELECT: 21,
  EXTEND: 3,
  UPGRADE: 4,
  MENU: 5,
  GAME_OVER: 6,
};

const GradeOrder = [
  TileGrade.NORMAL,
  TileGrade.DARK,
  TileGrade.LIGHT,
  TileGrade.GREEN,
  TileGrade.HELLISH,
  TileGrade.SHINING,
  TileGrade.PONY,
];

const GradeMinScore = [
  0,
  30,
  100,
  250,
  400,
  700,
  0
];

export class Game {
  constructor() {
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSelectObject = this.handleSelectObject.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.selectedTile = -1;
    this.selectedTileGrade = -1;
    this.selectedTileType = '';
    this.hoverTile = -1;
    this.hoverTileGrade = -1;
    this.hoverTileType = '';
    this.hoverObject = -1;
    this.selectedObject = -1;
    this.selectedArcadianId = undefined;

    this.recalcMapValueIn = 0;

    this.director = new Director();

    this.player = new Walker(
      ['hds-i1', 'hds-i2', 'hds-i0'],
      gameState.state.playerPosition.x, gameState.state.playerPosition.y, 30
    );
    this.playerRecharge = 0;

    this.mode = GameMode.DEFAULT;

    this.gateEl = new Sprite(['gate-c'], 16 * 5, 16 * 3);
    this.gateAs = new Sprite(['gate-c'], 16 * 5, 16 * 8);
    this.gateTa = new Sprite(['gate-c'], 16 * 5, 16 * 13);

    this.buttons = [
      new UISpriteButton('Expand', 'expnd-c', 145, 17 * 16, 3, () => {
        this.mode = GameMode.EXTEND;
      }),
      new UISpriteButton('Paint', 'pnt-c', 200, 17 * 16, 3, () => {
        this.mode = GameMode.PAINT_SELECT;
      }),
      new UISpriteButton('Build', 'bld-c', 255, 17 * 16, 3, () => {
        this.mode = GameMode.BUILD_SELECT;
      }),
      new UISpriteButton('Upgrade', 'up-c', 310, 17 * 16, 3, () => {
        this.mode = GameMode.UPGRADE;
      }),
      new UISpriteButton('Menu', 'menu', 365, 17 * 16, 3, () => {
        this.mode = GameMode.MENU;
      }),
    ];
    this.confirm = new UITextButton('Confirm', 380, 17 * 16, 4, () => {
      this.handleConfirm();
    });
    this.cancel = new UITextButton('Cancel', 460, 17 * 16, 4, () => {
      this.handleCancel();
    });

    this.saveBtn = new UITextButton('Save', width / 3, 8 * 16, 8, () => {
      gameState.saveLocal();
      this.handleCancel();
    });
    this.saveNearBtn = new UITextButton('Save to Near', 2 * width / 3, 8 * 16, 8, async () => {
      this.saveNearBtn.text = 'Saving...';
      gameState.saveLocal();
      await gameState.saveNear();
      this.handleCancel();
      this.saveNearBtn.text = 'Save to Near';
    });
    this.soundBtn = new UITextButton('Sound (' + (isSoundOn() ? 'On' : 'Off') + ')', width / 3, 12 * 16, 8, () => {
      toggleSound();
      this.soundBtn.text = 'Sound (' + (isSoundOn() ? 'On' : 'Off') + ')';
    });
    this.exitToMainBtn = new UITextButton('Exit to Main', 2 * width / 3, 12 * 16, 8, () => {
      gameState.gameState = GameState.MENU;
    });

    this.exitToMainGameOverBtn = new UITextButton('Exit to Main menu', width / 2, 17 * 16, 10, () => {
      gameState.gameState = GameState.MENU;
    });

    this.objectsPreview = Objects.map((obj, index) => createObject(obj, 30 + index * 40, 30, true));

    gameSkeletons.skeletons = [];
  }

  handleCancel() {
    this.mode = GameMode.DEFAULT;
  }

  handleConfirm() {
    if (this.mode === GameMode.PAINT_SELECT) {
      this.mode = GameMode.PAINT;
    } else if (this.mode === GameMode.BUILD_SELECT) {
      this.mode = GameMode.BUILD;
    }
  }

  handlePaint(x, y, level) {
    const map = gameState.state.area[level].map;
    const [type] = (map[y][x] ?? '').split('|');
    if (type === this.selectedTileType) {
      let tile = undefined;
      const grade = GradeOrder[this.selectedTileGrade];
      if (this.selectedTileType === 'f') {
        tile = Tiles.FLOORS[this.selectedTile];
        drawImage('flr-i' + tile.id + '-' + grade, 20, 150);
      } else {
        tile = Tiles.WALLS[this.selectedTile];
        drawImage('wl-i' + tile.id + '-' + grade, 20, 150);
      }

      const tileId = tile.id;
      const baseCost = (grade === TileGrade.NORMAL) ? tile.basePrice : Math.max(tile.basePrice, 0.1);
      const cost = baseCost * GlobalConfig.TILE_GRADE_MULTIPLIER[grade];
      if (gameState.state.money >= cost) {
        playBuildSound();
        gameState.state.money -= cost;
        map[y][x] = [this.selectedTileType, tileId, GradeOrder[this.selectedTileGrade]].join('|');
        gameState.updateMoodAndValue();
      }
    }
  }

  handleBuild(x, y, level) {
    const map = gameState.state.area[level].objects;
    const objDef = Objects[this.selectedObject];
    if (objDef && gameState.state.money >= objDef.cost) {
      gameState.state.money -= objDef.cost;
      const current = map[x];
      if (current instanceof Skeletons) {
        // cleanup old skeletons
        current.skeletons.forEach((sk) => sk.hp = -10);
      }

      playBuildSound();

      map[x] = createObject(
        Objects[this.selectedObject],
        x * 16 + 16,
        getMapDY(level) + 2 * 16,
        false,
        this.selectedArcadianId
      );
      gameState.updateMoodAndValue();
    }
  }

  update(dt) {
    if (pressedKeys.has('ArrowDown')) {
      this.player.gate(-1);
    }
    if (pressedKeys.has('ArrowUp')) {
      this.player.gate(1);
    }

    if (pressedKeys.has('ArrowLeft')) {
      this.player.walkTo(this.player.x - 20);
    } else if (pressedKeys.has('ArrowRight')) {
      this.player.walkTo(this.player.x + 20);
    } else {
      this.player.stop();
    }

    const levelMin = [16, 4 * 16, 16];
    const levelMax = [
      31 * 16,
      gameState.maxAsphodelArea * 16,
      31 * 16
    ];
    this.player.x = Math.max(Math.min(this.player.x, levelMax[this.player.currentLevel]), levelMin[this.player.currentLevel]);

    gameState.state.playerPosition.x = this.player.x;
    gameState.state.playerPosition.y = this.player.currentLevel;

    if (gameState.state.playerHealth < gameState.playerMaxHealth) {
      gameState.state.playerHealth += dt * GlobalConfig.PLAYER_HEAL_RATE;
    }

    if (gameState.state.playerHealth <= 0) {
      playGameOver();
      this.mode = GameMode.GAME_OVER;
    }

    const closestEnemies = gameState.enemies.filter(enemy => {
      if (enemy.sprite.currentLevel === this.player.currentLevel && enemy.state !== EnemyState.BLEND) {
        return Math.abs(enemy.sprite.x - this.player.x + 16) < 70;
      }
      return false;
    });
    const [closestEnemy] = closestEnemies.sort((a, b) => sortDist(this.player.sprite.x, a, b));
    this.playerRecharge -= dt;
    if (closestEnemy && this.playerRecharge <= 0) {
      this.playerRecharge = gameState.playerRechargeTime;
      playShoot();
      particleManager.add(
        this.player.sprite.x + 8,
        this.player.sprite.y + 8,
        closestEnemy,
        '#f00000',
        gameState.playerDamage
      );
    }
  }

  renderElysium() {
    renderMap(16, 16, gameState.state.area[MapArea.ELYSIUM].map);
    for (let x = 0; x < 31; x++) {
      drawImage('brick-b', x * 16 + 16, 5 * 16);
    }
  }

  renderAsphodelMeadows() {
    renderMap(16, 6 * 16, gameState.state.area[MapArea.ASPHODEL].map);
    for (let x = 0; x < 31; x++) {
      drawImage('brick-b', x * 16 + 16, 10 * 16);
    }
    for (let x = 0; x < 3; x++) {
      drawImage('water-c', x * 16 + 16, 9 * 16);
    }
  }

  renderTartar() {
    renderMap(16, 11 * 16, gameState.state.area[MapArea.TARTAR].map);
  }

  /**
   * @param {MapArea} area
   */
  extendArea(area) {
    const price = gameState.getExtendPrice(area);
    if (gameState.state.money >= price) {
      playClick();
      gameState.state.money -= price;
      gameState.extend(area);
    }
  }

  isCursorInElysium() {
    return mx > 16 && mx < 32 * 16 && my > 16 && my < 5 * 16;
  }

  isCursorInAsphodel() {
    return mx > 16 && mx < 32 * 16 && my > 6 * 16 && my < 10 * 16;
  }

  isCursorInTartar() {
    return mx > 16 && mx < 32 * 16 && my > 11 * 16 && my < 15 * 16;
  }

  handleSelect() {
    if (this.hoverTile !== -1) {
      this.selectedTile = this.hoverTile;
      this.selectedTileGrade = this.hoverTileGrade;
      this.selectedTileType = this.hoverTileType;
    }
  }

  handleSelectObject() {
    if (this.hoverObject !== -1) {
      this.selectedObject = this.hoverObject;
      const obj = Objects[this.selectedObject];
      if (obj.isArcadian) {
        const id = window.prompt('Enter Arcadian NFT id (1 ~ 3732)') || '-1';
        this.selectedArcadianId = parseInt(id, 10);
        const current = this.objectsPreview[this.selectedObject];
        this.objectsPreview[this.selectedObject] = createObject(obj, current.x, current.y, true, this.selectedArcadianId);
      } else {
        this.selectedArcadianId = undefined;
      }
    }
  }

  renderObjectSelect(dt) {
    this.hoverObject = -1;
    setClickHandler(this.handleSelectObject);

    drawBorder(0, 0, 32, 19, 'brd1-b-');
    this.objectsPreview.forEach((preview, index) => {
      const x = preview.x;
      const y = preview.y;
      preview.render(dt);

      if (mx > x - 8 && mx < x + 30 && my > y - 8 && my < y + 30) {
        this.hoverObject = index;
        canvasCtx.strokeStyle = '#f00000';
        canvasCtx.beginPath();
        canvasCtx.rect(x - 8, y - 8, 30, 30);
        canvasCtx.stroke();
      }

      if (this.selectedObject === index) {
        canvasCtx.strokeStyle = '#f0f000';
        canvasCtx.beginPath();
        canvasCtx.rect(x - 8, y - 8, 30, 30);
        canvasCtx.stroke();
      }
    });

    this.cancel.render();
    if (this.hoverObject !== -1 || this.selectedObject !== -1) {
      const object = Objects[this.hoverObject === -1 ? this.selectedObject : this.hoverObject];
      drawText(object.name, 32, 70, 18, '#fff0a0', false);
      const lines = object.description.split('\n');
      lines.forEach((line, index) => {
        drawText(line, 32, 90 + index * 20, 16, '#f0f0f0', false);
      });

      drawText('Base price: ' + object.cost, 32, 120 + lines.length * 20, 16, '#f0f0f0', false);
      if (object.upgradeCost) {
        drawText('Upgrade costs multiplier: ' + object.upgradeCost + '%', 32, 140 + lines.length * 20, 16, '#f0f0f0', false);
      }

      let mvDx = 0;
      if (object.mood) {
        mvDx = 70;

        drawImage('skull', 32, 150 + lines.length * 20);
        drawText(object.mood > 0 ? '+' + object.mood : object.mood, 48, 160 + lines.length * 20, 16, '#f0f0f0', false);
      }

      if (object.value) {
        drawImage('crown-c', 32 + mvDx, 150 + lines.length * 20);
        drawText(object.value > 0 ? '+' + object.value : object.value, 48 + mvDx, 160 + lines.length * 20, 16, '#f0f0f0', false);
      }

      if (this.selectedObject !== -1) {
        this.confirm.render();
      }
    } else {
      drawText('Pick object above', 32, 70, 18, '#fff0a0', false);
    }
  }

  renderTileSelect() {
    this.hoverTile = -1;
    this.hoverTileGrade = -1;
    this.hoverTileType = '';
    setClickHandler(this.handleSelect);
    drawBorder(0, 0, 32, 19, 'brd1-b-');

    const openGrades = GradeMinScore.map((min) => gameState.state.score >= min);

    drawText('Floor tiles', 20, 28, 14, '#fff', false);
    Tiles.FLOORS.forEach((tile, tileIndex) => {
      GradeOrder.forEach((grade, gradeIndex) => {
        if (!openGrades[gradeIndex]) {
          return;
        }
        if (grade === TileGrade.PONY && !isPremiumNear) {
          return;
        }

        const x = 20 + gradeIndex * 20;
        const y = 40 + tileIndex * 20;

        drawImage('flr-i' + tile.id + '-' + grade, x, y);

        const isSelected = this.selectedTileType === 'f' && this.selectedTile === tileIndex && this.selectedTileGrade === gradeIndex;

        if (isSelected || (mx > x && mx < x + 16 && my > y && my < y + 16)) {
          this.hoverTile = tileIndex;
          this.hoverTileGrade = gradeIndex;
          this.hoverTileType = 'f';
          canvasCtx.strokeStyle = '#f00000';
          canvasCtx.beginPath();
          canvasCtx.rect(x - 2, y - 2, 20, 20);
          canvasCtx.stroke();
        }
      });
    });

    drawText('Wall tiles', 220, 28, 14, '#fff', false);
    Tiles.WALLS.forEach((tile, tileIndex) => {
      GradeOrder.forEach((grade, gradeIndex) => {
        if (!openGrades[gradeIndex]) {
          return;
        }
        if (grade === TileGrade.PONY && !isPremiumNear) {
          return;
        }

        const x = 220 + gradeIndex * 20;
        const y = 40 + tileIndex * 20;

        drawImage('wl-i' + tile.id + '-' + grade, x, y);

        const isSelected = this.selectedTileType === 'w' && this.selectedTile === tileIndex && this.selectedTileGrade === gradeIndex;

        if (isSelected || (mx > x && mx < x + 16 && my > y && my < y + 16)) {
          this.hoverTile = tileIndex;
          this.hoverTileGrade = gradeIndex;
          this.hoverTileType = 'w';
          canvasCtx.strokeStyle = '#f00000';
          canvasCtx.beginPath();
          canvasCtx.rect(x - 2, y - 2, 20, 20);
          canvasCtx.stroke();
        }
      });
    });

    if (this.selectedTile !== -1 || this.hoverTile !== -1) {
      let tile = undefined;
      const tileId = this.hoverTile === -1 ? this.selectedTile : this.hoverTile;
      const tileType = this.hoverTile === -1 ? this.selectedTileType : this.hoverTileType;
      const tileGrade = this.hoverTile === -1 ? this.selectedTileGrade : this.hoverTileGrade;
      const grade = GradeOrder[tileGrade];
      if (tileType === 'f') {
        tile = Tiles.FLOORS[tileId];
        drawImage('flr-i' + tile.id + '-' + grade, 20, 150);
      } else if (tileType === 'w') {
        tile = Tiles.WALLS[tileId];
        drawImage('wl-i' + tile.id + '-' + grade, 20, 150);
      }

      drawImage('money-c', 20, 170);
      drawImage('skull', 120, 170);
      drawImage('crown-c', 220, 170);

      const cost = (grade === TileGrade.NORMAL) ? tile.basePrice : Math.max(tile.basePrice, 0.1);
      const mood = (grade === TileGrade.NORMAL) ? tile.mood : Math.max(tile.mood, 0.5);
      const value = (grade === TileGrade.NORMAL) ? tile.value : Math.max(tile.value, 0.5);
      drawText('-' + (cost * GlobalConfig.TILE_GRADE_MULTIPLIER[grade]).toFixed(1), 40, 180, 16, '#fff', false);
      drawText('+' + (mood * GlobalConfig.TILE_GRADE_MULTIPLIER[grade]).toFixed(1), 140, 180, 16, '#fff', false);
      drawText('+' + (value * GlobalConfig.TILE_GRADE_MULTIPLIER[grade]).toFixed(1), 240, 180, 16, '#fff', false);
    } else {
      drawText('Pick object above', 20, 150, 18, '#fff0a0', false);
      drawText('Extra tiles will be opened later in the game', 20, 180, 16, '#fff', false);
    }

    this.cancel.render();
    if (this.selectedTile !== -1) {
      this.confirm.render();
    }
  }

  renderMenu() {
    setClickHandler(this.handleSelect);
    drawBorder(0, 0, 32, 19, 'brd1-b-');
    drawText('Hades Defence', width / 2, 40, 25, '#f0f0f0');

    drawText('Score', width / 2, 65, 20, '#f0f0f0');
    drawText(gameState.state.score, width / 2, 85, 20, '#f0f0f0');

    this.saveBtn.render();
    if (isLoggedInWithNear()) {
      this.saveNearBtn.render();
    }
    this.soundBtn.render();
    this.exitToMainBtn.render();
    this.cancel.render();
  }

  renderGameOver() {
    setClickHandler(this.handleSelect);
    drawBorder(0, 0, 32, 19, 'brd1-b-');
    drawText('Game Over', width / 2, 60, 40, '#b90000');

    for (let i = 0; i < 5; i++) {
      drawImage('skull', (i + 3) * width / 10, 100);
    }

    drawText('Your score', width / 2, 150, 30, '#f0f0f0');
    drawText(gameState.getScore(), width / 2, 180, 20, '#f0f0f0');
    this.exitToMainGameOverBtn.render();
  }

  render(dt) {
    if (this.recalcMapValueIn <= 0) {
      gameState.updateMoodAndValue();
      this.recalcMapValueIn = 1;
    }
    this.recalcMapValueIn -= dt;
    gameSkeletons.cleanup();
    canvasCtx.clearRect(0, 0, width, height);
    setClickHandler(undefined);

    if (this.mode === GameMode.PAINT_SELECT) {
      this.renderTileSelect();
      return;
    } else if (this.mode === GameMode.BUILD_SELECT) {
      this.renderObjectSelect(dt);
      return;
    } else if (this.mode === GameMode.MENU) {
      this.renderMenu();
      return;
    } else if (this.mode === GameMode.GAME_OVER) {
      this.renderGameOver();
      return;
    }
    this.update(dt);

    this.renderTartar();
    this.renderAsphodelMeadows();
    this.renderElysium();

    this.gateEl.render(dt);
    this.gateAs.render(dt);
    this.gateTa.render(dt);

    gameState.state.area[MapArea.TARTAR].objects.forEach((obj, index) => {
      obj?.render(dt);
      if (obj instanceof Barricade && obj.hp <= 0) {
        gameState.state.area[MapArea.TARTAR].objects[index] = undefined;
      }
    });
    gameState.state.area[MapArea.ASPHODEL].objects.forEach((obj, index) => {
      obj?.render(dt);
      if (obj instanceof Barricade && obj.hp <= 0) {
        gameState.state.area[MapArea.ASPHODEL].objects[index] = undefined;
      }
    });
    gameState.state.area[MapArea.ELYSIUM].objects.forEach((obj, index) => {
      obj?.render(dt);
      if (obj instanceof Barricade && obj.hp <= 0) {
        gameState.state.area[MapArea.ELYSIUM].objects[index] = undefined;
      }
    });

    this.player.render(dt);
    this.director.render(dt);
    particleManager.render(dt);

    drawBorder(0, 0, 32, 19, 'brd1-b-');
    drawBorder(16, 15 * 16, 30, 3, 'brd2-b-');

    const moneyText = gameState.state.money > 100000 ? '99999+' : (gameState.state.money).toFixed(1);
    drawImage('money-c', 24, 16 * 16 - 5);
    drawText(moneyText, 42, 17 * 16 - 10, 16, '#fff', false);

    drawImage('hp-c', 24, 17 * 16 + 5);
    drawText(Math.ceil(gameState.state.playerHealth), 42, 18 * 16 - 1, 16, '#fff', false);

    drawImage('crown-c', 25 * 16 - 5, 16 * 16 - 5);
    drawText('Value: ' + Math.round(gameState.value) + '%', 26 * 16 - 2, 17 * 16 - 10, 14, '#fff', false);

    drawImage('skull', 25 * 16 - 5, 17 * 16 + 5);
    drawText('Mood: ' + Math.round(gameState.mood) + '%', 26 * 16 - 2, 18 * 16 - 1, 14, '#fff', false);

    const forceMode = [
      this.mode === GameMode.EXTEND,
      this.mode === GameMode.PAINT,
      this.mode === GameMode.BUILD,
      this.mode === GameMode.UPGRADE
    ];
    this.buttons.forEach((btn, index) => btn.render(forceMode[index]));

    const maxTartarArea = gameState.maxTartarArea;
    const maxAsphodelArea = gameState.maxAsphodelArea;
    const maxElysiumArea = gameState.maxElysiumArea;

    if (this.mode === GameMode.EXTEND) {
      let y = 0;
      let w = 0;

      if (this.isCursorInTartar() && maxTartarArea < 31) {
        setClickHandler(() => this.extendArea(MapArea.TARTAR));
        y = 11 * 16;
        w = (maxTartarArea + 1) * 16;
        drawText(`-${gameState.getExtendPrice(MapArea.TARTAR)}$`, mx, my - 14, 16);
      } else if (this.isCursorInAsphodel() && maxAsphodelArea < 31) {
        setClickHandler(() => this.extendArea(MapArea.ASPHODEL));
        y = 6 * 16;
        w = (maxAsphodelArea + 1) * 16;
        drawText(`-${gameState.getExtendPrice(MapArea.ASPHODEL)}$`, mx, my - 14, 16);
      } else if (this.isCursorInElysium() && maxElysiumArea < 31) {
        setClickHandler(() => this.extendArea(MapArea.ELYSIUM));
        y = 16;
        w = (maxElysiumArea + 1) * 16;
        drawText(`-${gameState.getExtendPrice(MapArea.ELYSIUM)}$`, mx, my - 14, 16);
      }

      if (w) {
        canvasCtx.strokeStyle = '#a0a000';
        canvasCtx.beginPath();
        canvasCtx.rect(16, y, w, 4 * 16);
        canvasCtx.stroke();
      }
    } else if (this.mode === GameMode.PAINT) {
      let dx = 16;
      let area;
      let dy = 0;
      let maxLen = 0;

      if (this.isCursorInTartar()) {
        dy = 11 * 16;
        area = MapArea.TARTAR;
        maxLen = maxTartarArea;
      } else if (this.isCursorInAsphodel()) {
        dy = 6 * 16;
        area = MapArea.ASPHODEL;
        maxLen = maxAsphodelArea;
      } else if (this.isCursorInElysium()) {
        dy = 16;
        area = MapArea.ELYSIUM;
        maxLen = maxElysiumArea;
      }

      if (dy) {
        let px = ~~((mx - dx) / 16);
        let py = ~~((my - dy) / 16);
        const [type, entity] = (gameState.state.area[area].map[py][px] ?? '').split('|');
        const isMatchingType = (this.selectedTileType === 'f' && py === 3) || (this.selectedTileType === 'w' && py !== 3);

        if (isMatchingType && entity !== 'x' && type !== '-' && px < maxLen) {
          canvasCtx.strokeStyle = '#a00000';
          canvasCtx.beginPath();
          canvasCtx.rect(dx + px * 16, dy + py * 16, 16, 16);
          canvasCtx.stroke();

          setClickHandler(() => this.handlePaint(px, py, area));
        }
      }
    } else if (this.mode === GameMode.BUILD) {
      let dx = 16;
      let area;
      let dy = 0;
      let maxLen = 0;
      let minX = 5;

      if (this.isCursorInTartar()) {
        dy = 11 * 16;
        minX = 0;
        area = MapArea.TARTAR;
        maxLen = maxTartarArea;
      } else if (this.isCursorInAsphodel()) {
        dy = 6 * 16;
        area = MapArea.ASPHODEL;
        maxLen = maxAsphodelArea;
      } else if (this.isCursorInElysium()) {
        dy = 16;
        minX = 0;
        area = MapArea.ELYSIUM;
        maxLen = maxElysiumArea;
      }

      if (dy) {
        let px = ~~((mx - dx) / 16);
        let py = ~~((my - dy) / 16);
        if (px < maxLen && px >= minX && px !== 4) {
          canvasCtx.strokeStyle = 'rgb(178,220,239)';
          canvasCtx.beginPath();
          canvasCtx.rect(dx + px * 16, dy, 16, 16 * 3);
          canvasCtx.stroke();

          const objDef = Objects[this.selectedObject];
          drawText(`-${objDef.cost}$`, mx, my - 14, 16);

          setClickHandler(() => this.handleBuild(px, py, area));
        }
      }
    } else if (this.mode === GameMode.UPGRADE) {
      let area;
      let dy = 0;
      let dx = 16;

      if (this.isCursorInTartar()) {
        dy = 11 * 16;
        area = MapArea.TARTAR;
      } else if (this.isCursorInAsphodel()) {
        dy = 6 * 16;
        area = MapArea.ASPHODEL;
      } else if (this.isCursorInElysium()) {
        dy = 16;
        area = MapArea.ELYSIUM;
      }

      if (dy) {
        let px = ~~((mx - dx) / 16);
        const object = gameState.state.area[area].objects[px];
        if (object && object.canUpgrade) {
          canvasCtx.strokeStyle = '#00a000';
          canvasCtx.beginPath();
          canvasCtx.rect(dx + px * 16, dy, 16, 16 * 3);
          canvasCtx.stroke();

          drawText(`-${object.getUpgradeCost()}$`, mx, my - 14, 16);

          setClickHandler(() => object.upgrade());
        }
      }
    }
  }
}
