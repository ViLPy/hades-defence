import {Sprite} from '../sprite';
import {createArcadian} from '../texture-gen';

export class Arcadian {
  constructor(def, x, y, isPreview, id = -1) {
    this.def = def;
    this.x = x;
    this.y = y;
    this.arcadianId = id;
    createArcadian(id);

    const dy = isPreview ? 0 : -15;

    this.spr = new Sprite(['arcadian' + id], x - 5, y - 5 + dy);
  }

  render(dt) {
    this.spr.render(dt);
  }
}
