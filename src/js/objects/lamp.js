import {AnimationMode, Sprite} from '../sprite';

export class Lamp {
  constructor(def, x, y, isPreview) {
    this.def = def;
    this.x = x;
    this.y = y;

    const dy = isPreview ? 0 : -16 * 2;

    this.lightSpr = new Sprite(['lgth-c-i0', 'lgth-c-i1', 'lgth-c-i2'], x - 1, y + dy - 5, 10, AnimationMode.RANDOM);
    this.fl = new Sprite(['lmp-c'], x - 1, y + dy + 1);
  }

  render(dt) {
    this.lightSpr.render(dt);
    this.fl.render(dt);
  }
}
