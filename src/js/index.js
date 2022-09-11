import {renderBg} from './bg';
import {Menu} from './menu';
import {Game} from './game';
import {prepareSprites} from './sprite-prep';
import {GameState, gameState} from './state';
import {initNearWallet} from './near';

async function init() {
  await prepareSprites();
  await initNearWallet();

  start();
}

function start() {
  
  let time = 0;
  renderBg();
  let game = new Game();
  const menu = new Menu(() => {
    game = new Game();
  });

  requestAnimationFrame(raf);

  function raf(now) {
    const newTime = now / 1000;
    const dt = newTime - time;
    time = newTime;

    if (gameState.gameState === GameState.MENU) {
      menu.render();
    } else if (gameState.gameState === GameState.GAME) {
      game.render(dt);
    }

    requestAnimationFrame(raf);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(init, 100);
});
