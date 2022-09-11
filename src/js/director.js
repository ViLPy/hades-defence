import {Sprite, SpriteGroup} from './sprite';
import {Walker} from './walker';
import {gameState} from './state';
import {gameSkeletons} from './objects/skeletons';
import {Enemy, EnemyState} from './enemy';
import {GlobalConfig} from './config';
import {playElevate, playWave} from './sound';

/**
 * @enum {number}
 */
export const CharonStage = {
  NONE: -1,
  ENTRY: 1,
  WAIT: 2,
  EXIT: 3,
};

const CHARON_TRANSITION_TIME = 3;

/**
 * @enum {number}
 */
export const NormieState = {
  DISEMBARK: 1,
  WANDERING: 2,
  WAITING: 3,
  BLEND: 4
};

class Normie {
  constructor(x, level, targetX, targetLevel, speed = 24) {
    this.x = x;
    this.time = 0;
    this.waitTimer = 0;

    this.state = NormieState.DISEMBARK;
    this.target = targetX;
    this.targetLevel = targetLevel;
    this.sprite = new Walker(
      ['soul-base'],
      x, level, speed
    );
    this.sprite.sprite.setAlpha(0);
  }

  setTarget(x, level) {
    this.target = x;
    this.targetLevel = level;
  }

  update(dt) {
    this.time += dt;
    this.waitTimer += dt;
    if (this.state === NormieState.DISEMBARK) {
      if (this.sprite.sprite.alpha < 1) {
        this.sprite.sprite.alpha += dt;
      } else {
        this.state = NormieState.WANDERING;
      }
    } else if (this.state === NormieState.WAITING) {
      if (this.waitTimer > 3) {
        this.state = NormieState.WANDERING;
      }
    } else if (this.state === NormieState.BLEND) {
      this.sprite.sprite.alpha -= dt * 0.2;
    }
  }

  render(dt) {
    this.update(dt);
    if (this.state === NormieState.WANDERING) {
      this.sprite.walkTo(this.target, this.targetLevel);
    }
    this.sprite.render(dt);
    if (this.state !== NormieState.BLEND && this.sprite.targetLevel === this.targetLevel && Math.abs(this.target - this.sprite.x) < 10) {
      const levelMax = [
        gameState.maxElysiumArea,
        gameState.maxAsphodelArea,
        gameState.maxTartarArea
      ];

      const levelMin = [0, 4, 0];
      const level = this.targetLevel;

      let dx = (levelMin[level] + Math.random() * (levelMax[level] - levelMin[level])) * 16;
      this.setTarget(dx, this.targetLevel);
      this.state = NormieState.WAITING;
      this.waitTimer = 0;
    }
  }
}

export class Director {
  constructor() {
    this.time = 0;
    this.timeSinceLastInvasion = 0;

    // charon
    this.charon = new SpriteGroup(24, 8 * 16);
    this.charon.addSprite(new Sprite(['chA'], 0, 0), -8, 0);
    this.charon.addSprite(new Sprite(['chB'], 0, 0), 8, 0);

    this.charonState = CharonStage.ENTRY;
    this.charonTime = 0;
    this.timeSinceLastArrival = 0;

    /**
     * @type {Array<Normie>}
     */
    this.normies = [];
  }

  reassignSkeletons() {
    const assignedEnemyIds = new Set();
    gameSkeletons.skeletons.forEach((sk) => {
      if (sk.enemy) {
        assignedEnemyIds.add(sk.enemy.id);
      }
    });

    gameSkeletons.skeletons.forEach((sk) => {
      if (sk.hp > 0 && (!sk.enemy || sk.enemy.health <= 0)) {
        sk.enemy = gameState.enemies.find((enemy) => {
          return enemy.state !== EnemyState.APPEAR
            && enemy.state !== EnemyState.BLEND
            && enemy.sprite.currentLevel === sk.level
            && Math.abs(enemy.sprite.x - sk.startX) < 64
            && !assignedEnemyIds.has(enemy.id);
        });
        if (sk.enemy) {
          assignedEnemyIds.add(sk.enemy.id);
        }
      }
    });
  }

  update(dt) {
    this.time += dt;
    this.timeSinceLastInvasion += dt;

    // charon
    this.charonTime += dt;
    this.timeSinceLastArrival += dt;

    if (this.timeSinceLastArrival > 10 && this.charonState === CharonStage.NONE) {
      this.charonState = CharonStage.ENTRY;
      this.charon.setFlip(false);
      this.charonTime = 0;
      this.timeSinceLastArrival = 0;
    }

    if (this.charonState === CharonStage.ENTRY) {
      this.charon.x = (Math.min(this.charonTime, CHARON_TRANSITION_TIME) / CHARON_TRANSITION_TIME) * 48 - 10;
      if (this.charonTime > CHARON_TRANSITION_TIME) {
        const levelMax = [
          gameState.maxElysiumArea,
          gameState.maxAsphodelArea,
          gameState.maxTartarArea
        ];

        const levelMin = [0, 4, 0];

        this.charonTime = 0;
        const addedSouls = Math.max(1, Math.round(GlobalConfig.SOUL_VALUE_MULTIPLIER * gameState.value / 100));
        playElevate();
        gameState.state.money += addedSouls;
        this.charonState = CharonStage.WAIT;
        for (let i = 0; i < addedSouls; i++) {
          gameState.state.score++;
          gameState.state.souls++;
          const level = Math.floor(Math.random() * 3);
          let dx = (levelMin[level] + Math.random() * (levelMax[level] - levelMin[level])) * 16;
          this.normies.push(
            new Normie(
              64 + Math.random() * 10 - 5,
              1,
              dx,
              level,
              Math.random() * 10 + 14
            )
          );
        }
        const normiesToHide = Math.max(0, this.normies.length - GlobalConfig.MAX_NORMIES);
        for (let i = 0; i < normiesToHide; i++) {
          this.normies[i].state = NormieState.BLEND;
        }
      }
    }

    if (this.charonState === CharonStage.WAIT && this.charonTime > 3) {
      this.charon.setFlip(true);
      this.charonTime = 0;
      this.charonState = CharonStage.EXIT;
    }

    if (this.charonState === CharonStage.EXIT) {
      this.charon.x = ((CHARON_TRANSITION_TIME - Math.min(this.charonTime, CHARON_TRANSITION_TIME)) / CHARON_TRANSITION_TIME) * 48 - 10;
      if (this.charonTime > CHARON_TRANSITION_TIME) {
        this.charonTime = 0;
        this.charonState = CharonStage.NONE;
      }
    }

    // invasions
    if (gameState.enemies.length === 0 && this.timeSinceLastInvasion > 15) {
      this.timeSinceLastInvasion = 0;
      playWave();

      const totalAmount = Math.ceil(Math.pow(GlobalConfig.INVASION_WAVE_MULTIPLIER, gameState.state.monsterInvasions));
      gameState.state.monsterInvasions++;
      for (let i = 0; i < totalAmount; i++) {
        const enemy = new Enemy(32 * 16 + Math.random() * 20, Math.random() >= 0.5 ? 0 : 2, 18 + Math.random() * 8);
        gameState.enemies.push(enemy);
      }
    }

    this.reassignSkeletons();
  }

  render(dt) {
    this.update(dt);
    this.charon.render(dt);
    this.normies = this.normies.filter((normie) => {
      normie.render(dt);
      const canBeRemoved = normie.state === NormieState.BLEND && normie.sprite.sprite.alpha <= 0;
      return !canBeRemoved;
    });
    const startEnemies = gameState.enemies.length;
    gameState.enemies = gameState.enemies.filter((enemy) => {
      enemy.render(dt);
      const isDead = enemy.state === EnemyState.BLEND && enemy.sprite.sprite.alpha <= 0;
      if (isDead) {
        gameState.state.score++;
      }
      return !isDead;
    });
    const endEnemies = gameState.enemies.length;
    if (endEnemies === 0 && startEnemies !== 0) {
      this.timeSinceLastInvasion = 0;
    }
  }
}
