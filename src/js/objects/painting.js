import {Sprite} from '../sprite';

export class SoulPainting {
  constructor(def, x, y, isPreview, sprite) {
    this.def = def;
    this.x = x;
    this.y = y;

    const dy = isPreview ? 0 : -15;

    this.spr = new Sprite([sprite], x - 5, y - 5 + dy);
  }

  render(dt) {
    this.spr.render(dt);
  }
}
