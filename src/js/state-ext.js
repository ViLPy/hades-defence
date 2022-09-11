import {genDefaultMap, MapArea} from './utils';
import {Arcadian} from './objects/arcadian';
import {createObject, Objects} from './tiles';
import {isPremiumNear, saveStateToNear} from './near';

export const LOCAL_STORAGE_KEY = 'hades_state';

function mapObject(obj) {
  if (!obj) {
    return [];
  }
  if (obj instanceof Arcadian) {
    return [obj.def.id, obj.x, obj.y, obj.arcadianId];
  } else {
    return [obj.def.id, obj.x, obj.y, obj.upgradeLevel ?? 0];
  }
}

function parseObject(obj) {
  const [id, x, y, meta] = obj;
  const def = Objects.find((def) => def.id === id);
  if (!def) {
    return null;
  }

  if (def.isArcadian) {
    return createObject(def, x, y, false, meta);
  } else {
    const newObject = createObject(def, x, y, false);
    if (newObject.canUpgrade) {
      for (let i = 1; i < meta; i++) {
        newObject.upgrade(true);
      }
    }
    return newObject;
  }
}

export class StateExt {
  constructor() {
    const tartarDefMap = genDefaultMap(31, 4);
    const elysiumDefMap = genDefaultMap(31, 4);
    const asphodelDefMap = genDefaultMap(31, 4);

    const cleanArea = 10;

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < cleanArea; x++) {
        if (y === 3) {
          elysiumDefMap[y][x] = 'f|0|n';
          tartarDefMap[y][x] = 'f|0|n';
          asphodelDefMap[y][x] = 'f|0|n';
        } else {
          elysiumDefMap[y][x] = 'w|0|n';
          tartarDefMap[y][x] = 'w|0|n';
          asphodelDefMap[y][x] = 'w|0|n';
        }
      }
    }

    for (let x = cleanArea; x < 31; x++) {
      elysiumDefMap[2][x] = 'w|0|n';
      tartarDefMap[2][x] = 'w|0|n';
    }

    for (let x = 0; x < 3; x++) {
      asphodelDefMap[3][x] = '-';
    }

    this.playerPosition = {x: 64, y: 1};
    this.score = 0;
    this.souls = 0;
    this.playerHealth = 100;
    this.time = 0;
    this.money = isPremiumNear ? 100 : 10;
    this.monsterInvasions = 0;
    this.area = {
      [MapArea.TARTAR]: {
        souls: 0, map: tartarDefMap, objects: tartarDefMap[0].map(() => null)
      }, [MapArea.ASPHODEL]: {
        souls: 0, map: asphodelDefMap, objects: asphodelDefMap[0].map(() => null)
      }, [MapArea.ELYSIUM]: {
        souls: 0, map: elysiumDefMap, objects: asphodelDefMap[0].map(() => null)
      }
    };
  }

  stringify() {
    return JSON.stringify({
      'pp': {'x': this.playerPosition.x, 'y': this.playerPosition.y},
      'score': this.score,
      'ph': this.playerHealth,
      'time': this.time,
      'money': this.money,
      'souls': this.souls,
      'mi': this.monsterInvasions,
      [MapArea.TARTAR]: {
        'map': this.area[MapArea.TARTAR].map,
        'obj': this.area[MapArea.TARTAR].objects.map(mapObject)
      },
      [MapArea.ASPHODEL]: {
        'map': this.area[MapArea.ASPHODEL].map,
        'obj': this.area[MapArea.ASPHODEL].objects.map(mapObject)
      },
      [MapArea.ELYSIUM]: {
        'map': this.area[MapArea.ELYSIUM].map,
        'obj': this.area[MapArea.ELYSIUM].objects.map(mapObject)
      }
    });
  }

  restoreFromString(dataStr) {
    if (!dataStr) {
      return;
    }

    try {
      const json = JSON.parse(dataStr);
      this.playerPosition.x = json['pp']['x'];
      this.playerPosition.y = json['pp']['y'];
      this.score = json['score'] ?? 0;
      this.playerHealth = json['ph'] ?? 100;
      this.time = json['time'] ?? 0;
      this.souls = json['souls'] ?? 0;
      this.money = json['money'] ?? 10;
      this.monsterInvasions = json['mi'] ?? 0;
      this.area[MapArea.TARTAR].map = json[MapArea.TARTAR]['map'];
      this.area[MapArea.TARTAR].objects = json[MapArea.TARTAR]['obj'].map(parseObject);
      this.area[MapArea.ASPHODEL].map = json[MapArea.ASPHODEL]['map'];
      this.area[MapArea.ASPHODEL].objects = json[MapArea.ASPHODEL]['obj'].map(parseObject);
      this.area[MapArea.ELYSIUM].map = json[MapArea.ELYSIUM]['map'];
      this.area[MapArea.ELYSIUM].objects = json[MapArea.ELYSIUM]['obj'].map(parseObject);
    } catch (err) {
      console.warn('Tried to load broken state');
    }
  }

  saveLocal() {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, this.stringify());
  }

  loadLocal() {
    const storedState = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedState) {
      this.restoreFromString(storedState);
    }
  }

  saveNear() {
    return saveStateToNear(this.stringify());
  }
}
