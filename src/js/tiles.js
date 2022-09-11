import {TowerA} from './objects/tower-a';
import {Skeletons} from './objects/skeletons';
import {Barricade} from './objects/barricade';
import {Arcadian} from './objects/arcadian';
import {Light} from './objects/light';
import {Lamp} from './objects/lamp';
import {SoulPainting} from './objects/painting';
import {HPUp} from './objects/hpup';

/**
 * @enum {string}
 */
export const TileGrade = {
  HELLISH: 'h',
  DARK: 'd',
  NORMAL: 'n',
  LIGHT: 'l',
  SHINING: 's',
  GREEN: 'g',
  PONY: 'p',
};

export const Tiles = {
  WALLS: [
    {
      id: 0,
      basePrice: 0,
      mood: 0,
      value: 0,
    },
    {
      id: 1,
      basePrice: 0.1,
      mood: 0.5,
      value: 0.5,
    },
    {
      id: 2,
      basePrice: 0.2,
      mood: 1,
      value: 1,
    },
    {
      id: 3,
      basePrice: 0.3,
      mood: 1.5,
      value: 1.5,
    }
  ],
  FLOORS: [
    {
      id: 0,
      basePrice: 0,
      mood: 0,
      value: 0,
    },
    {
      id: 1,
      basePrice: 0.1,
      mood: 0.5,
      value: 0.5,
    },
    {
      id: 2,
      basePrice: 0.2,
      mood: 1,
      value: 1,
    },
    {
      id: 3,
      basePrice: 0.3,
      mood: 1.5,
      value: 1.5,
    }
  ]
};

export const Objects = [
  {
    id: 0,
    name: 'Defensive altar',
    description: 'Launches fire charges into enemies\nEach upgrade increase either recharge rate or targeting distance',
    cost: 15,
    upgradeCost: 30,
    mood: 30,
    value: 20,
    ctor: TowerA
  }, {
    id: 1,
    name: 'Barricade',
    description: 'Can block enemies. Each upgrade increases durability\nCheap and sturdy',
    cost: 2,
    upgradeCost: 15,
    mood: 0,
    value: 10,
    ctor: Barricade
  }, {
    id: 2,
    name: 'Grave',
    description: 'Spawns skeletons who can block and attack enemies\nEach upgrade adds skeleton and increases their health\nDestroyed skeletons respawn over time',
    cost: 10,
    upgradeCost: 10,
    mood: 10,
    value: 30,
    ctor: Skeletons
  },
  {
    id: 9,
    name: 'Potion station',
    description: 'Automatically heals you and skeletons around',
    upgradeCost: 30,
    cost: 20,
    mood: 20,
    value: 10,
    ctor: HPUp
  },
  {
    id: 4,
    name: 'Wall light',
    description: 'Improves overall mood',
    cost: 5,
    mood: 30,
    value: 5,
    ctor: Light
  },
  {
    id: 5,
    name: 'Chandelier',
    description: 'Improves overall mood',
    cost: 15,
    mood: 10,
    value: 80,
    ctor: Lamp
  },
  {
    id: 6,
    name: 'Painting of an ordinary soul',
    description: 'Improves overall mood and adds some value',
    cost: 10,
    mood: 40,
    value: 40,
    ctor: SoulPainting,
    meta: 'soul-paint'
  },
  {
    id: 7,
    name: 'Painting of a skeleton',
    description: 'Improves overall mood and adds some value',
    cost: 20,
    mood: 80,
    value: 50,
    ctor: SoulPainting,
    meta: 'sk-paint'
  },
  {
    id: 8,
    name: 'Painting of a you',
    description: 'You look nice',
    cost: 30,
    mood: 150,
    value: 100,
    ctor: SoulPainting,
    meta: 'hds-paint'
  },
  {
    id: 900,
    isArcadian: true,
    name: 'Arcadian NFT',
    description: 'Improves overall mood and adds some value. ID can be selected',
    cost: 15,
    mood: 50,
    value: 50,
    ctor: Arcadian
  }
];

export function createObject(def, x, y, isPreview = false, meta = undefined) {
  return new def.ctor(def, x, y, isPreview, meta || def.meta);
}
