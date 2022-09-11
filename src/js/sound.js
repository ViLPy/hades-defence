import {zzfx} from './zzfx';

const SOUND_LOCAL_KEY = 'hades_sound';

export function isSoundOn() {
  const current = window.localStorage.getItem(SOUND_LOCAL_KEY);
  return !current || current === 'true';
}

export function toggleSound() {
  window.localStorage.setItem(SOUND_LOCAL_KEY, (!isSoundOn()).toString());
}

export function playShoot() {
  if (!isSoundOn()) return;
  zzfx(...[0.4, , 71, .01, .07, .05, 1, 1.92, -7.9, -0.7, , , , , , , .08, .98, .04]);
}

export function playElevate() {
  if (!isSoundOn()) return;
  zzfx(...[0.2,,905,.01,,.23,,1.11,,,,,,.1,-0.1,,,.18,.01]);
}

export function playGameOver() {
  if (!isSoundOn()) return;
  zzfx(...[,,570,.05,.22,.3,,1.11,-5.5,,-75,.1,.07,,,,,.54,.16]);
}

export function playBuildSound() {
  if (!isSoundOn()) return;
  zzfx(...[0.2,,42,,.02,.05,3,.15,3.6,,,,,2,,,,.78,.08]);
}

export function playWave() {
  if (!isSoundOn()) return;
  zzfx(...[0.7,,386,.06,.19,.35,2,1.56,4.1,-2.3,,,.14,,,,.01,.97,.1,.48]);
}

export function playClick() {
  if (!isSoundOn()) return;
  zzfx(...[0.5,,521,.01,.01,.01,2,.75,12,34,-262,,,,,,,,.01,.05]);
}
