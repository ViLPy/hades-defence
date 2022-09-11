import {TileGrade} from './tiles';

export const GlobalConfig = {
  INVASION_WAVE_MULTIPLIER: 1.03,
  PLAYER_HEAL_RATE: 0.1,

  SOUL_VALUE_MULTIPLIER: 1.4,
  SOUL_VALUE_DROP: 0.1,
  SOUL_MOOD_DROP: 0.2,
  MOOD_DAMAGE_MULTIPLIER: 0.2,
  MOOD_RECHARGE_MULTIPLIER: 0.3,
  MOOD_HEALTH_MULTIPLIER: 0.2,
  TILE_GRADE_MULTIPLIER: {
    [TileGrade.NORMAL]: 1,
    [TileGrade.DARK]: 2,
    [TileGrade.LIGHT]: 3,
    [TileGrade.GREEN]: 4,
    [TileGrade.HELLISH]: 5,
    [TileGrade.SHINING]: 6,
    [TileGrade.PONY]: 7,
  },
  SKELETON_RECHARGE_TIME: 2,
  SKELETON_DAMAGE: 3,

  ENEMY_HERO_HP: 10,
  ENEMY_HERO_DAMAGE: 2,
  ENEMY_HERO_RECHARGE: 2,
  ENEMY_MONSTER_HP: 15,
  ENEMY_MONSTER_DAMAGE: 1,
  ENEMY_MONSTER_RECHARGE: 2,

  MAX_NORMIES: 15
};
