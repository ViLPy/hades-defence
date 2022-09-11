import {loadSpriteSet} from './spriteset';
import {blendSprites, colorPattern, createPainting, flipSprite, rainbowSprite} from './texture-gen';
import {TileGrade} from './tiles';

function prepareFrames() {
  [['b', 'rgb(247,226,107)'], ['p', 'rgb(190,38,51)']].forEach(([name, color]) => {
    colorPattern('brd4', `brd2-${name}-i1`, color);
    flipSprite(`brd2-${name}-i1`, false, true, 0, `brd2-${name}-i7`);
    flipSprite(`brd2-${name}-i1`, false, false, -Math.PI / 2, `brd2-${name}-i3`);
    flipSprite(`brd2-${name}-i1`, false, false, Math.PI / 2, `brd2-${name}-i5`);

    [0, 2, 6, 8].forEach((i) => {
      colorPattern('crn4', `brd2-${name}-i${i}`, color);
    });
    flipSprite(`brd2-${name}-i2`, false, false, Math.PI / 2, `brd2-${name}-i2`);
    flipSprite(`brd2-${name}-i2`, false, false, Math.PI / 2, `brd2-${name}-i8`);
    flipSprite(`brd2-${name}-i8`, false, false, Math.PI / 2, `brd2-${name}-i6`);
  });

  [0, 2, 6, 8].forEach((i) => {
    colorPattern('crn1', `brd1-b-i${i}`, 'rgb(247,226,107)', 'rgb(38,38,38)');
  });
  colorPattern('brd3', 'brd1-b-i1', 'rgb(247,226,107)', 'rgb(38,38,38)');
  colorPattern('brd3', 'brd1-b-i7', 'rgb(247,226,107)', 'rgb(38,38,38)');
  flipSprite('brd1-b-i1', false, false, Math.PI / 2, 'brd1-b-i3');
  flipSprite('brd1-b-i1', false, false, -Math.PI / 2, 'brd1-b-i5');
}

function prepareCharacters() {
  // Charon
  colorPattern('ch-i0', 'chA', 'rgb(142,168,185)', undefined, 0.5);
  colorPattern('ch-i1', 'chB', 'rgb(142,168,185)', undefined, 0.5);

  // Base soul
  colorPattern('soul', 'soul-base', 'rgb(213,213,213)', undefined, 0.3);

  // hero
  for (let i = 0; i < 3; i++) {
    colorPattern('hr-i' + i, 'hr-c-i' + i, 'rgb(255,231,231)');
  }

  // monster
  for (let i = 0; i < 3; i++) {
    colorPattern('m-i' + i, 'm-c-i' + i, 'rgb(255,0,0)');
  }
}

function prepareObjects() {
  // Light
  for (let i = 0; i < 3; i++) {
    colorPattern(`light-i${i}`, `lgth-c-i${i}`, 'rgb(247,226,107)', undefined, 0.15);
  }

  // Flame
  for (let i = 0; i < 6; i++) {
    colorPattern(`flame-i${i}`, `flm-c-i${i}`, 'rgb(190,38,51)');
  }

  // Gate
  colorPattern('gate', 'gate-c', 'rgb(164,100,34)');

  // Water
  colorPattern('water', 'water-c', 'rgb(0,87,132)', 'rgb(178,220,239)');
  blendSprites('water-c', 'grad', 'water-c');

  // tower A
  colorPattern('ob-i0', 'ob-i0-c', 'rgb(164,100,34)');
  // block A
  colorPattern('ob-i1', 'ob-i1-c', 'rgb(100,67,58)');

  colorPattern('lmp', 'lmp-c', 'rgb(247,226,107)');
  colorPattern('hpup', 'hpup-c', 'rgb(142,168,185)');

  colorPattern('crown', 'crown-c', 'rgb(247,226,107)');
  colorPattern('money', 'money-c', 'rgb(247,226,107)');
  colorPattern('hp', 'hp-c', 'rgb(190,38,51)');
  colorPattern('expnd', 'expnd-c', 'rgb(247,226,107)');
  colorPattern('pnt', 'pnt-c', 'rgb(255,52,69)');
  colorPattern('bld', 'bld-c', 'rgb(178,220,239)');
  colorPattern('up', 'up-c', 'rgb(93,253,0)');

  createPainting('soul', 'soul-paint');
  createPainting('sk-i1', 'sk-paint');
  createPainting('hds-i1', 'hds-paint');
}

export async function prepareSprites() {
  await loadSpriteSet();

  prepareFrames();
  prepareCharacters();
  prepareObjects();

  colorPattern('stones', 'stones-d', 'rgb(86,86,86)');
  colorPattern('brick', 'brick-b', 'rgb(58,58,58)', 'rgb(86,86,86)');
  colorPattern('brick', 'brick-d', 'rgb(33,33,33)', 'rgb(86,86,86)');

  blendSprites('stones-d', 'grad', 'stones-grad');

  const wallPallets = [
    [TileGrade.NORMAL, 'rgb(201,201,201)', 0.1],
    [TileGrade.DARK, 'rgb(164,100,34)', 0.2],
    [TileGrade.LIGHT, 'rgb(59,197,255)', 0.2],
    [TileGrade.HELLISH, 'rgb(255,52,69)', 0.2],
    [TileGrade.SHINING, 'rgb(255,242,0)', 0.3],
    [TileGrade.GREEN, 'rgb(93,253,0)', 0.2],
    [TileGrade.PONY, '', 0.3]
  ];
  wallPallets.forEach(([type, color, alpha]) => {
    for (let i = 0; i < 4; i++) {
      if (type === TileGrade.PONY) {
        rainbowSprite('wl-i' + i, 'wl-i' + i + '-' + type, alpha);
      } else {
        colorPattern('wl-i' + i, 'wl-i' + i + '-' + type, color, undefined, alpha);
      }
    }
  });

  const floorPallets = [
    [TileGrade.NORMAL, 'rgb(107,107,107)'],
    [TileGrade.DARK, 'rgb(73,60,43)'],
    [TileGrade.LIGHT, 'rgb(49,162,242)'],
    [TileGrade.HELLISH, 'rgb(190,38,51)'],
    [TileGrade.SHINING, 'rgb(247,226,107)'],
    [TileGrade.GREEN, 'rgb(68,137,26)'],
    [TileGrade.PONY, '']
  ];
  floorPallets.forEach(([type, color]) => {
    for (let i = 0; i < 4; i++) {
      const tname = 'flr-i' + i + '-' + type;
      if (type === TileGrade.PONY) {
        rainbowSprite('flr-i' + i, tname);
      } else {
        colorPattern('flr-i' + i, tname, color);
      }

    }
  });
} 
