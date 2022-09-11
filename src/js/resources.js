/**
 * @typedef {{
 *   img: (HTMLImageElement|HTMLCanvasElement),
 *   x: number,
 *   y: number,
 *   w: number,
 *   h: number,
 * }}
 */
var ImageResource;

class ResourceLoader {

  constructor() {
    /** @private Map<string, ImageResource> */
    this.images = new Map();
  }

  /**
   * @param {string} path
   * @param {Array<{n: string, x: number, y: number, w: number, h: number}>} data
   */
  loadImages(path, data) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        data.forEach((entry) => {
          const {x, y} = entry;
          this.images.set(entry.n, {img, x, y, w: 16, h: 16});
        });
        res();
      };
      img.src = path;
    });
  }

  /**
   * @param {string} path
   * @param {CanvasImageSource} image
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  addImage(path, image, x, y, w, h) {
    this.images.set(path, {img: image, x, y, w, h});
  }

  /**
   * @param {string} path
   */
  getImage(path) {
    return this.images.get(path);
  }

}

export const appResourceLoader = new ResourceLoader();
