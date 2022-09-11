import {canvasCtx} from './canvas';

export class Particles {
  constructor() {
    this.particles = [];
  }

  add(x, y, target, color, dmg) {
    this.particles.push({
      sx: x, sy: y, x, y, target, color, dmg, lvl: Math.round((y - 16 * 3) / (16 * 5))
    });
  }

  render(dt) {
    this.particles = this.particles.filter((p) => {
      const tx = p.target.sprite.x + 8;
      const ty = p.target.sprite.y + 8;
      const distSq = Math.pow(p.x - tx, 2) + Math.pow(p.y - ty, 2);
      const isHit = distSq < 9;
      canvasCtx.fillStyle = p.color;
      canvasCtx.fillRect(p.x - 1, p.y - 1, 2, 2);
      const perc = Math.abs(p.x - tx) / Math.abs(p.sx - tx);
      p.x += dt * Math.sign(tx - p.x) * 64;
      p.y = p.sy + (ty - p.sy) * (1 - perc);

      const differentLevels = p.lvl !== p.target.sprite.currentLevel;
      const isDead = p.target.health <= 0;

      if (isHit) {
        p.target.health -= p.dmg;
      }

      return !isHit && !differentLevels && !isDead;
    });
  }
}

export const particleManager = new Particles();
