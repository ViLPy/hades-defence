import {AnimationMode, Sprite} from './sprite';

export class Fire {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lightSpr = new Sprite(['lgth-c-i0', 'lgth-c-i1', 'lgth-c-i2'], x, y - 3, 10, AnimationMode.RANDOM);
    this.flameSpr = new Sprite(['flm-c-i0', 'flm-c-i1', 'flm-c-i2', 'flm-c-i3', 'flm-c-i4', 'flm-c-i5'], x, y, 10);
  }

  render(dt) {
    this.lightSpr.render(dt);
    this.flameSpr.render(dt);
  }
}
