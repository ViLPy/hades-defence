import {Walker} from './walker';
import {gameState} from './state';
import {MapArea, sortObject} from './utils';
import {Skeleton, Skeletons} from './objects/skeletons';
import {Barricade} from './objects/barricade';
import {canvasCtx} from './canvas';
import {GlobalConfig} from './config';

/**
 * @enum {number}
 */
export const EnemyState = {
  APPEAR: 1,
  MOVE: 2,
  ATTACK: 3,
  BLEND: 4
};

let nextEnemyId = 1;

export class Enemy {
  constructor(x, level, speed = 24) {
    this.isHero = level === 0;

    this.id = nextEnemyId++;
    this.health = this.isHero ? GlobalConfig.ENEMY_HERO_HP : GlobalConfig.ENEMY_MONSTER_HP;
    this.maxHealth = this.health;
    this.time = 0;
    this.waitTimer = 0;
    this.attackCycle = 0;
    this.rechargeTime = this.isHero ? GlobalConfig.ENEMY_HERO_RECHARGE : GlobalConfig.ENEMY_MONSTER_RECHARGE;
    this.damage = this.isHero ? GlobalConfig.ENEMY_HERO_DAMAGE : GlobalConfig.ENEMY_MONSTER_DAMAGE;

    this.state = EnemyState.APPEAR;
    this.target = 64;
    this.targetLevel = 1;

    const prefix = this.isHero ? 'hr-c-i' : 'm-c-i';

    this.sprite = new Walker(
      [prefix + '1', prefix + '2', prefix + '0'],
      x, level, speed
    );

    const levelMax = [
      gameState.maxElysiumArea,
      gameState.maxAsphodelArea,
      gameState.maxTartarArea
    ];

    this.setTarget(levelMax[this.sprite.currentLevel] * 16, level);
  }

  setTarget(x, level) {
    this.target = x;
    this.targetLevel = level;
  }

  update(dt) {
    if (this.health <= 0) {
      this.state = EnemyState.BLEND;
      this.sprite.stop();
    }

    const levelMax = [
      gameState.maxElysiumArea,
      gameState.maxAsphodelArea,
      gameState.maxTartarArea
    ];

    this.time += dt;
    this.waitTimer += dt;
    this.attackCycle -= dt;

    const isWithinRange = gameState.state.playerPosition.y === this.sprite.currentLevel && Math.abs(gameState.state.playerPosition.x - this.sprite.x) < 8;
    let targetSkeleton = undefined;
    let targetBarricade = undefined;
    [
      ...gameState.state.area[MapArea.ELYSIUM].objects,
      ...gameState.state.area[MapArea.ASPHODEL].objects,
      ...gameState.state.area[MapArea.TARTAR].objects
    ].forEach((obj) => {
      if (
        !targetSkeleton
        && obj instanceof Skeletons
        && obj.level === this.sprite.currentLevel
      ) {
        targetSkeleton = obj.skeletons
          .find(({spr, enemy}) =>
            Math.abs(spr.sprite.x - this.sprite.x) < 6
            && enemy?.id === this.id
          );
      }

      if (
        !targetBarricade
        && obj instanceof Barricade
        && obj.level === this.sprite.currentLevel
        && obj.x < this.sprite.x
        && Math.abs(obj.x - this.sprite.x) < 14
      ) {
        targetBarricade = obj;
      }
    });

    const [nearestBlocked] = [targetSkeleton, targetBarricade].filter(Boolean).sort(sortObject);

    if (this.state === EnemyState.BLEND) {
      this.sprite.sprite.alpha -= dt;
    } else if (this.state === EnemyState.APPEAR) {
      if (Math.abs(this.sprite.sprite.x - levelMax[this.sprite.currentLevel] * 16) < 10) {
        this.state = EnemyState.MOVE;
      }
    } else if (this.state === EnemyState.MOVE) {
      if (isWithinRange || nearestBlocked) {
        if (nearestBlocked instanceof Skeleton) {
          this.setTarget(targetSkeleton.spr.sprite.x, this.sprite.currentLevel);
        } else if (nearestBlocked instanceof Barricade) {
          this.setTarget(targetBarricade.x, this.sprite.currentLevel);
        }
        this.state = EnemyState.ATTACK;
        this.attackCycle = 0;
        this.sprite.stop();
      } else {
        this.setTarget(gameState.state.playerPosition.x, gameState.state.playerPosition.y);
      }
    } else if (this.state === EnemyState.ATTACK) {
      if (isWithinRange || nearestBlocked) {
        if (this.attackCycle <= 0) {
          this.attackCycle = this.rechargeTime;
          if (nearestBlocked instanceof Skeleton) {
            targetSkeleton.hp -= this.damage;
          } else if (nearestBlocked instanceof Barricade) {
            targetBarricade.hp -= this.damage;
          } else {
            gameState.state.playerHealth -= this.damage;
          }
        }
      } else {
        this.state = EnemyState.MOVE;
      }
    }
  }

  render(dt) {
    this.update(dt);
    this.sprite.render(dt);
    if (this.state !== EnemyState.ATTACK && this.state !== EnemyState.BLEND) {
      this.sprite.walkTo(this.target, this.targetLevel);
    }
    const healthPercentage = Math.max(0, this.health / this.maxHealth);
    if (healthPercentage < 1) {
      if (healthPercentage > 0.7) {
        canvasCtx.fillStyle = '#0f0';
      } else if (healthPercentage > 0.3) {
        canvasCtx.fillStyle = '#ff0';
      } else {
        canvasCtx.fillStyle = '#f00';
      }
      canvasCtx.fillRect(this.sprite.sprite.x + 3, this.sprite.sprite.y, Math.max(1, ~~(10 * healthPercentage)), 1);
    }
  }
}
