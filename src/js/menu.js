import {renderBg} from './bg';
import {drawImage, drawText, width} from './canvas';
import {UITextButton} from './button';
import {GameState, gameState} from './state';
import {
  buyPremium,
  getUsersNearState,
  initNearGame,
  isLoggedInWithNear, isPremiumNear,
  loginWithNear, logoutNear
} from './near';
import {isSoundOn, toggleSound} from './sound';

/**
 * @enum {number}
 */
const MenuState = {
  DEFAULT: 0,
  NEAR: 10
};

export class Menu {
  constructor(onGameReset) {
    this.state = MenuState.DEFAULT;

    this.start = new UITextButton('Start New Game', width / 2, 120, 12, () => {
      gameState.reset();
      this.onGameReset();
      gameState.gameState = GameState.GAME;
    });
    this.continue = new UITextButton('Continue locally', width / 2, 170, 12, () => {
      gameState.reset();
      gameState.loadLocal();
      this.onGameReset();
      gameState.gameState = GameState.GAME;
    });

    this.loginAndContinue = new UITextButton('Login with NEAR', width / 2, 220, 12, async () => {
      await loginWithNear();
      if (isLoggedInWithNear()) {
        this.state = MenuState.NEAR;
      }
    });

    this.continueWithNear = new UITextButton('Continue with NEAR', width / 2, 220, 12, () => {
      this.state = MenuState.NEAR;
    });

    this.toggleSound = new UITextButton('Sound (' + (isSoundOn() ? 'On' : 'Off') + ')', width / 2, 270, 12, () => {
      toggleSound();
      this.toggleSound.text = 'Sound (' + (isSoundOn() ? 'On' : 'Off') + ')';
    });

    this.nearNew = new UITextButton('New Game', width / 3 - 30, 120, 12, () => {
      gameState.reset();
      this.onGameReset();
      gameState.gameState = GameState.GAME;
      this.state = MenuState.DEFAULT;
    });
    this.nearLoad = new UITextButton('Load Game from Near', width / 3 - 30, 180, 12, async () => {
      gameState.reset();
      await initNearGame();
      this.onGameReset();
      gameState.gameState = GameState.GAME;
      this.state = MenuState.DEFAULT;
    });
    this.localLoad = new UITextButton('Load locally saved', width / 3 - 30, 240, 12, async () => {
      gameState.reset();
      gameState.loadLocal();
      this.onGameReset();
      gameState.gameState = GameState.GAME;
    });
    this.buyPremium = new UITextButton('Go Premium', 2 * width / 3 + 30, 120, 12, async () => {
      await buyPremium();
      this.state = MenuState.DEFAULT;
    });

    this.nearView = new UITextButton('Try other player base', 2 * width / 3 + 30, 180, 12, async () => {
      try {
        const id = prompt('Enter wallet ID to load:');
        if (id) {
          const data = await getUsersNearState(id);
          if (data) {
            gameState.reset();
            gameState.loadFromNearState(data);
            this.onGameReset();
            gameState.gameState = GameState.GAME;
            this.state = MenuState.DEFAULT;
          } else {
            alert('No state found for ' + id);
          }
        }
      } catch (err) {
        console.warn(err);
      }
    });

    this.logout = new UITextButton('Logout', 2 * width / 3 + 30, 240, 12, () => {
      logoutNear();
    });

    this.onGameReset = onGameReset;

    this.hasStored = gameState.hasLocalStore();
  }

  renderNearSubMenu() {
    renderBg();
    drawText('Hades Defence', width / 2, 65, 40, '#f0f0f0');

    if (isPremiumNear) {
      drawImage('crown-c', width / 2 + 30, 110);
      drawText('Premium Tier', width / 2 + 50, 120, 16, '#fff', false);
    } else {
      this.buyPremium.render();
    }
    this.nearNew.render();
    this.nearLoad.render();
    this.nearView.render();
    this.localLoad.render();
    this.logout.render();
  }

  render() {
    if (this.state === MenuState.NEAR) {
      this.renderNearSubMenu();
      return;
    }

    renderBg();
    drawText('Hades Defence', width / 2, 65, 40, '#f0f0f0');

    this.toggleSound.render();
    this.start.render();
    if (this.hasStored) {
      this.continue.render();
    }
    if (isLoggedInWithNear()) {
      this.continueWithNear.render();
    } else {
      this.loginAndContinue.render();
    }
  }
}
