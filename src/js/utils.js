/**
 * @enum {string}
 */
export const MapArea = {
  ELYSIUM: 'elysium',
  ASPHODEL: 'asphodel',
  TARTAR: 'tartar',
};

/**
 * Shuffle array in place
 * @param {Array} a
 */
export function shuffle(a) {
  for (let i = 0, l = a.length; i < l; i++) {
    const j = ~~(Math.random() * l);
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}


export function getMapDY(area) {
  if (area === MapArea.TARTAR) {
    return 11 * 16;
  } else if (area === MapArea.ASPHODEL) {
    return 6 * 16;
  } else {
    return 16;
  }
}

export function sortObject(objA, objB) {
  try {
    if (objA.spr.x === objB.spr.x) return 0;
    return objA.spr.x > objB.spr.x ? 1 : -1;
  } catch (err) {
    return 0;
  }
}

export function sortDist(x, objA, objB) {
  if (objA.sprite.x === objB.sprite.x) return 0;
  return Math.abs(x - objA.sprite.x) > Math.abs(x - objB.sprite.x) ? 1 : -1;
}

export const upgradeMarkers = [
  [-3, 0], [3, 0],
  [-3, -5], [3, -5],
  [0, -10]
];


export function genDefaultMap(w, h) {
  const res = [];
  for (let y = 0; y < h; y++) {
    let prefix = 'w';
    if (y === 0) {
      prefix = 'c';
    } else if (y === 3) {
      prefix = 'f';
    }
    res[y] = [];
    for (let x = 0; x < w; x++) {
      res[y][x] = [prefix, 'x'].join('|');
    }
  }
  return res;
}
