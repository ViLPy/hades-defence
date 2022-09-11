import {Fire} from '../fire';

export class Light {
  constructor(def, x, y, isPreview) {
    this.def = def;
    this.x = x;
    this.y = y;

    const dy = isPreview ? 0 : -15;

    this.fl = new Fire(x, y + dy);
  }

  render(dt) {
    this.fl.render(dt);
  }
}
