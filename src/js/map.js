import {drawImage} from './canvas';

export function renderMap(sx, sy, map) {
  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      const [type, element, color] = row[x].split('|');
      if (type === '-') {
        continue;
      }
      if (element === 'x') {
        // default stones
        if (type === 'f') {
          // floor
          drawImage('stones-grad', sx + x * 16, sy + y * 16);
        } else {
          drawImage('stones-d', sx + x * 16, sy + y * 16);
        }
        continue;
      }

      if (type === 'w') {
        // walls
        drawImage('wl-i' + element + '-' + color, sx + x * 16, sy + y * 16);
      }
      if (type === 'f') {
        // floor
        drawImage('flr-i' + element + '-' + color, sx + x * 16, sy + y * 16);
      }
    }
  }
}
