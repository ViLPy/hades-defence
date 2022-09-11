import {canvas} from './canvas';

export const pressedKeys = new Set();

function handleMouseMove(evt) {
  mx = evt.offsetX / 2;
  my = evt.offsetY / 2;
}

function handleMouseUp() {
  isPressed = false;
}

function handleMouseDown() {
  isPressed = true;
}

/**
 * @type {(Function|undefined)}
 */
let clickHandler = undefined;

function handleClick() {
  if (clickHandler && typeof clickHandler === 'function') {
    clickHandler();
  }
}

/**
 * @param {(Function|undefined)} handler
 */
export function setClickHandler(handler) {
  clickHandler = handler;
}

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('click', handleClick);

document.addEventListener('keydown', (evt) => {
  pressedKeys.add(evt.code);
});
document.addEventListener('keyup', (evt) => {
  pressedKeys.delete(evt.code);
});

export let mx = 0;
export let my = 0;
export let isPressed = false;
