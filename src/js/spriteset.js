import {appResourceLoader} from './resources';
import {spriteData} from '../generated/sprite-data';

export async function loadSpriteSet() {
  return appResourceLoader.loadImages('./hades.webp', spriteData);
}
